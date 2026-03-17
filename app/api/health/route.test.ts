import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/rate-limit", () => ({
  checkRedisHealth: vi.fn(),
}))

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("returns 200 and health payload when Redis is connected", async () => {
    const { checkRedisHealth } = await import("@/lib/rate-limit")
    vi.mocked(checkRedisHealth).mockResolvedValue("connected")

    const { GET } = await import("./route")
    const response = await GET()
    const body = (await response.json()) as {
      status: string
      redis: string
      version: string
      timestamp: string
    }

    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
    expect(body.redis).toBe("connected")
    expect(typeof body.version).toBe("string")
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow()
  })

  it("fails open with 200 degraded payload when Redis is unavailable", async () => {
    const { checkRedisHealth } = await import("@/lib/rate-limit")
    vi.mocked(checkRedisHealth).mockResolvedValue("unavailable")

    const { GET } = await import("./route")
    const response = await GET()
    const body = (await response.json()) as { status: string; redis: string }

    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
    expect(body.redis).toBe("unavailable")
  })
})
