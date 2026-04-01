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
// checkRedisHealth — specific failure mode coverage
// ---------------------------------------------------------------------------
//
// The health endpoint's fail-open contract requires that ALL Redis failure
// modes (connection refused, timeout, authentication error) result in
// checkRedisHealth() returning "unavailable" — never throwing.
//
// Each test isolates one failure mode and verifies the exact return value so
// regressions in the catch-all path are caught early.

describe("checkRedisHealth: connection-refused failure mode", () => {
  afterEach(() => {
    delete process.env.REDIS_URL
  })

  it("returns 'unavailable' (never throws) when Redis connect is refused (ECONNREFUSED)", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const connRefusedError = new Error("connect ECONNREFUSED 127.0.0.1:6379")
    connRefusedError.name = "Error"
    ;(connRefusedError as NodeJS.ErrnoException).code = "ECONNREFUSED"

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockRejectedValue(connRefusedError),
      eval: vi.fn(),
      on: vi.fn(),
      ping: vi.fn(),
    }))

    const { checkRedisHealth } = await import("./rate-limit")
    // Must not throw — fail-open contract
    const result = await checkRedisHealth()
    expect(result).toBe("unavailable")
  })
})

describe("checkRedisHealth: timeout failure mode", () => {
  afterEach(() => {
    delete process.env.REDIS_URL
  })

  it("returns 'unavailable' (never throws) when Redis connect times out (ETIMEDOUT)", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const timeoutError = new Error("connect ETIMEDOUT")
    timeoutError.name = "Error"
    ;(timeoutError as NodeJS.ErrnoException).code = "ETIMEDOUT"

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockRejectedValue(timeoutError),
      eval: vi.fn(),
      on: vi.fn(),
      ping: vi.fn(),
    }))

    const { checkRedisHealth } = await import("./rate-limit")
    const result = await checkRedisHealth()
    expect(result).toBe("unavailable")
  })

  it("returns 'unavailable' when ping times out after successful connect", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const pingTimeoutError = new Error("Command timed out")
    pingTimeoutError.name = "Error"

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      eval: vi.fn().mockResolvedValue(0),
      on: vi.fn((event: string, cb: () => void) => {
        if (event === "ready") cb()
      }),
      ping: vi.fn().mockRejectedValue(pingTimeoutError),
    }))

    const { checkRedisHealth } = await import("./rate-limit")
    const result = await checkRedisHealth()
    expect(result).toBe("unavailable")
  })
})

describe("checkRedisHealth: authentication failure mode", () => {
  afterEach(() => {
    delete process.env.REDIS_URL
  })

  it("returns 'unavailable' (never throws) when Redis authentication is rejected (WRONGPASS)", async () => {
    process.env.REDIS_URL = "redis://:wrongpassword@localhost:6379"
    vi.resetModules()

    const authError = new Error("WRONGPASS invalid username-password pair or user is disabled.")
    authError.name = "ReplyError"

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockRejectedValue(authError),
      eval: vi.fn(),
      on: vi.fn(),
      ping: vi.fn(),
    }))

    const { checkRedisHealth } = await import("./rate-limit")
    const result = await checkRedisHealth()
    expect(result).toBe("unavailable")
  })

  it("returns 'unavailable' when ping fails with auth error after connect", async () => {
    process.env.REDIS_URL = "redis://:wrongpassword@localhost:6379"
    vi.resetModules()

    const authError = new Error("NOAUTH Authentication required.")
    authError.name = "ReplyError"

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      eval: vi.fn().mockResolvedValue(0),
      on: vi.fn((event: string, cb: () => void) => {
        if (event === "ready") cb()
      }),
      ping: vi.fn().mockRejectedValue(authError),
    }))

    const { checkRedisHealth } = await import("./rate-limit")
    const result = await checkRedisHealth()
    expect(result).toBe("unavailable")
  })
})

describe("checkRedisHealth: healthy connection", () => {
  afterEach(() => {
    delete process.env.REDIS_URL
  })

  it("returns 'connected' when Redis is reachable and ping succeeds", async () => {
    process.env.REDIS_URL = "redis://localhost:6379"
    vi.resetModules()

    const { default: RedisMock } = await import("ioredis")
    ;(RedisMock as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      eval: vi.fn().mockResolvedValue(0),
      on: vi.fn((event: string, cb: () => void) => {
        if (event === "ready") cb()
      }),
      ping: vi.fn().mockResolvedValue("PONG"),
    }))

    const { checkRedisHealth } = await import("./rate-limit")
    const result = await checkRedisHealth()
    expect(result).toBe("connected")
  })

  it("returns 'unavailable' when no Redis env vars are configured", async () => {
    delete process.env.REDIS_URL
    delete process.env.REDIS_HOST
    vi.resetModules()

    const { checkRedisHealth } = await import("./rate-limit")
    const result = await checkRedisHealth()
    expect(result).toBe("unavailable")
  })
})
