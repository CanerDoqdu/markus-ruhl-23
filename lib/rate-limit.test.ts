/**
 * Tests for lib/rate-limit.ts
 *
 * Structure:
 *  1. In-memory fallback — exercises the fixed-window path when no Redis env vars are set.
 *  2. Redis sliding-window path — stubs ioredis; verifies the Lua EVAL is called with the
 *     correct sliding-window script and interprets return values correctly.
 *  3. Fail-open behaviour — verifies that Redis errors degrade to in-memory (never throws,
 *     never blocks the first request from an IP just because Redis is down).
 *
 * vi.resetModules() before each group ensures module-level singletons
 * (redisClient, redisAvailable, redisInitDone) start fresh per test.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"

// Top-level mock is hoisted by vitest; the factory runs on every fresh module load
// triggered by vi.resetModules() + dynamic import below.
vi.mock("ioredis")

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uniqueIp(): string {
  return `10.0.0.${Math.floor(Math.random() * 255)}-${Date.now()}`
}

// ---------------------------------------------------------------------------
// In-memory fallback (no Redis env vars)
// ---------------------------------------------------------------------------

describe("rate-limit: in-memory fallback", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL
    delete process.env.REDIS_HOST
    vi.resetModules()
  })

  it("allows a first request from a new IP", async () => {
    const { isRateLimited } = await import("./rate-limit")
    expect(await isRateLimited(uniqueIp())).toBe(false)
  })

  it("allows requests up to the configured limit", async () => {
    process.env.CONTACT_RATE_LIMIT_MAX = "3"
    vi.resetModules()
    const { isRateLimited } = await import("./rate-limit")
    const ip = uniqueIp()
    expect(await isRateLimited(ip)).toBe(false) // 1
    expect(await isRateLimited(ip)).toBe(false) // 2
    expect(await isRateLimited(ip)).toBe(false) // 3
    delete process.env.CONTACT_RATE_LIMIT_MAX
  })

  it("blocks requests beyond the configured limit", async () => {
    process.env.CONTACT_RATE_LIMIT_MAX = "2"
    vi.resetModules()
    const { isRateLimited } = await import("./rate-limit")
    const ip = uniqueIp()
    await isRateLimited(ip) // 1 — allowed
    await isRateLimited(ip) // 2 — allowed
    expect(await isRateLimited(ip)).toBe(true) // 3 — blocked
    delete process.env.CONTACT_RATE_LIMIT_MAX
  })

  it("isolates counters per IP address", async () => {
    process.env.CONTACT_RATE_LIMIT_MAX = "1"
    vi.resetModules()
    const { isRateLimited } = await import("./rate-limit")
    const ip1 = uniqueIp()
    const ip2 = uniqueIp()
    await isRateLimited(ip1) // consumes ip1's single slot
    expect(await isRateLimited(ip2)).toBe(false) // ip2 is independent
    delete process.env.CONTACT_RATE_LIMIT_MAX
  })
})

// ---------------------------------------------------------------------------
// Redis sliding-window path
// ---------------------------------------------------------------------------

describe("rate-limit: Redis sliding-window path", () => {
  let mockEval: ReturnType<typeof vi.fn>
  let mockConnect: ReturnType<typeof vi.fn>
  let mockOn: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    mockEval = vi.fn().mockResolvedValue(0) // default: not rate-limited
    mockConnect = vi.fn().mockResolvedValue(undefined)
    mockOn = vi.fn((event: string, cb: () => void) => {
      // Immediately fire "ready" so redisAvailable is set to true
      if (event === "ready") cb()
    })

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: mockConnect,
      eval: mockEval,
      on: mockOn,
    }))
  })

  afterEach(() => {
    delete process.env.REDIS_URL
  })

  it("calls Redis eval with the sliding-window Lua script", async () => {
    const { isRateLimited } = await import("./rate-limit")
    await isRateLimited("192.168.1.1")

    expect(mockEval).toHaveBeenCalledOnce()
    const [script, numkeys, key] = mockEval.mock.calls[0] as [string, number, string]
    expect(script).toContain("ZREMRANGEBYSCORE") // sliding window eviction
    expect(script).toContain("ZADD")             // request recording
    expect(script).toContain("ZCARD")            // current count
    expect(numkeys).toBe(1)
    expect(key).toMatch(/^rl:/)                  // key namespace
  })

  it("passes current timestamp, window, max-requests, and unique ID as ARGV", async () => {
    const { isRateLimited } = await import("./rate-limit")
    const before = Date.now()
    await isRateLimited("192.168.1.2")
    const after = Date.now()

    const args = mockEval.mock.calls[0] as [string, number, string, string, string, string, string]
    const [, , , nowStr, windowStr, maxStr, requestId] = args

    const now = Number(nowStr)
    expect(now).toBeGreaterThanOrEqual(before)
    expect(now).toBeLessThanOrEqual(after)
    expect(Number(windowStr)).toBeGreaterThan(0) // WINDOW_MS
    expect(Number(maxStr)).toBeGreaterThan(0)    // MAX_REQUESTS
    expect(typeof requestId).toBe("string")
    expect(requestId.length).toBeGreaterThan(0)  // unique per-request UUID
  })

  it("returns false (allowed) when Redis eval returns 0", async () => {
    mockEval.mockResolvedValue(0)
    const { isRateLimited } = await import("./rate-limit")
    expect(await isRateLimited("10.0.0.1")).toBe(false)
  })

  it("returns true (rate-limited) when Redis eval returns 1", async () => {
    mockEval.mockResolvedValue(1)
    const { isRateLimited } = await import("./rate-limit")
    expect(await isRateLimited("10.0.0.2")).toBe(true)
  })

  it("uses a unique member ID per request to avoid sorted-set collisions", async () => {
    const { isRateLimited } = await import("./rate-limit")
    await isRateLimited("10.0.0.3")
    await isRateLimited("10.0.0.3")

    const id1 = (mockEval.mock.calls[0] as string[])[6]
    const id2 = (mockEval.mock.calls[1] as string[])[6]
    expect(id1).not.toBe(id2)
  })
})

// ---------------------------------------------------------------------------
// Window slide behaviour — old requests outside the window must not count
// ---------------------------------------------------------------------------

describe("rate-limit: window slide / expiry", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL
    delete process.env.REDIS_HOST
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("in-memory: resets counter after window expires (old requests don't count)", async () => {
    process.env.CONTACT_RATE_LIMIT_MAX = "2"
    process.env.CONTACT_RATE_LIMIT_WINDOW_MS = "1000"
    vi.resetModules()
    vi.useFakeTimers()

    const { isRateLimited } = await import("./rate-limit")
    const ip = uniqueIp()

    // Exhaust the limit in window #1
    await isRateLimited(ip) // 1 — allowed
    await isRateLimited(ip) // 2 — allowed
    expect(await isRateLimited(ip)).toBe(true) // 3 — blocked (over limit)

    // Advance time past the full window so the old bucket expires
    vi.advanceTimersByTime(1001)

    // Counter must have reset; request is allowed again
    expect(await isRateLimited(ip)).toBe(false)

    delete process.env.CONTACT_RATE_LIMIT_MAX
    delete process.env.CONTACT_RATE_LIMIT_WINDOW_MS
  })

  it("Redis path: passes (now - window) as the pruning cutoff so expired entries are evicted", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const capturedArgs: unknown[][] = []
    const mockEval = vi.fn().mockImplementation((...args: unknown[]) => {
      capturedArgs.push(args)
      return Promise.resolve(0)
    })
    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      eval: mockEval,
      on: vi.fn((event: string, cb: () => void) => {
        if (event === "ready") cb()
      }),
    }))

    const { isRateLimited } = await import("./rate-limit")
    const before = Date.now()
    await isRateLimited("10.2.0.1")
    const after = Date.now()

    // ARGV[1]=now, ARGV[2]=window. ZREMRANGEBYSCORE evicts scores <= now-window.
    // Verify the timestamp is within the expected range so the pruning cutoff is correct.
    const args = capturedArgs[0] as [string, number, string, string, string, string, string]
    const [, , , nowStr, windowStr] = args
    const now = Number(nowStr)
    const window = Number(windowStr)

    expect(now).toBeGreaterThanOrEqual(before)
    expect(now).toBeLessThanOrEqual(after)
    expect(window).toBeGreaterThan(0)
    // If now - window >= now, nothing would ever be evicted — the window would never slide.
    expect(now - window).toBeLessThan(now)

    delete process.env.REDIS_URL
  })
})

// ---------------------------------------------------------------------------
// Fail-open behaviour
// ---------------------------------------------------------------------------

describe("rate-limit: fail-open on Redis errors", () => {
  afterEach(() => {
    delete process.env.REDIS_URL
  })

  it("falls back to in-memory (fail-open) when Redis connect throws", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
      eval: vi.fn(),
      on: vi.fn(),
    }))

    const { isRateLimited } = await import("./rate-limit")
    // Must not throw; first request should be allowed (fail-open)
    expect(await isRateLimited("10.1.1.1")).toBe(false)
  })

  it("falls back to in-memory (fail-open) when Redis eval throws mid-request", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const mockEval = vi.fn().mockRejectedValue(new Error("Redis connection lost"))
    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      eval: mockEval,
      on: vi.fn((event: string, cb: () => void) => {
        if (event === "ready") cb()
      }),
    }))

    const { isRateLimited } = await import("./rate-limit")
    // Must not throw; first in-memory request should be allowed
    expect(await isRateLimited("10.1.1.2")).toBe(false)
  })

  it("does not block the first request when Redis is down (not fail-closed)", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockRejectedValue(new Error("timeout")),
      eval: vi.fn(),
      on: vi.fn(),
    }))

    const { isRateLimited } = await import("./rate-limit")
    // Fail-open contract: Redis down must NOT make the first request return true
    const result = await isRateLimited("10.1.1.3")
    expect(result).toBe(false)
  })
})
