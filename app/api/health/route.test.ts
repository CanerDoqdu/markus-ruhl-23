import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/rate-limit", () => ({
  checkRedisHealth: vi.fn(),
}))

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("returns 200 with ok status and dependencies when Redis is connected", async () => {
    const { checkRedisHealth } = await import("@/lib/rate-limit")
    vi.mocked(checkRedisHealth).mockResolvedValue("connected")

    const { GET } = await import("./route")
    const response = await GET()
    const body = (await response.json()) as {
      status: string
      dependencies: { redis: string }
      version: string
      timestamp: string
    }

    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
    expect(body.dependencies.redis).toBe("ok")
    expect(typeof body.version).toBe("string")
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow()
  })

  it("fails open: returns 200 with degraded status when Redis is unavailable", async () => {
    const { checkRedisHealth } = await import("@/lib/rate-limit")
    vi.mocked(checkRedisHealth).mockResolvedValue("unavailable")

    const { GET } = await import("./route")
    const response = await GET()
    const body = (await response.json()) as {
      status: string
      dependencies: { redis: string }
      version: string
      timestamp: string
    }

    // Fail-open contract: service stays 200 even when Redis is down.
    expect(response.status).toBe(200)
    expect(body.status).toBe("degraded")
    expect(body.dependencies.redis).toBe("unavailable")
    expect(typeof body.version).toBe("string")
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow()
  })

  it("response shape is deterministic: same keys present in both ok and degraded states", async () => {
    const { checkRedisHealth } = await import("@/lib/rate-limit")

    for (const redisState of ["connected", "unavailable"] as const) {
      vi.mocked(checkRedisHealth).mockResolvedValue(redisState)
      vi.resetModules()
      const { GET } = await import("./route")
      const response = await GET()
      const body = (await response.json()) as Record<string, unknown>

      expect(Object.keys(body).sort()).toEqual(
        ["dependencies", "status", "timestamp", "version"].sort()
      )
      expect(typeof (body.dependencies as Record<string, unknown>).redis).toBe("string")
    }
  })

  it("never exposes internal error stacks in the response body", async () => {
    const { checkRedisHealth } = await import("@/lib/rate-limit")
    vi.mocked(checkRedisHealth).mockRejectedValue(new Error("Internal Redis connection error"))

    const { GET } = await import("./route")
    // Even if checkRedisHealth unexpectedly throws, the route must:
    // 1. Not propagate the exception (return a response, not throw)
    // 2. Return HTTP 200 with degraded status (fail-open)
    // 3. Never leak the internal error message to the client
    const response = await GET()
    const text = await response.text()
    const body = JSON.parse(text) as { status: string; dependencies: { redis: string } }

    expect(response.status).toBe(200)
    expect(body.status).toBe("degraded")
    expect(body.dependencies.redis).toBe("unavailable")
    expect(text).not.toMatch(/Internal Redis connection error/)
    expect(text).not.toMatch(/at .+\(.+:\d+:\d+\)/)
  })
})
