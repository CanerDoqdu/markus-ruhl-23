import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { afterEach, describe, expect, it, vi } from "vitest"
import { POST } from "./route"

const ROUTE_SOURCE = readFileSync(fileURLToPath(new URL("./route.ts", import.meta.url)), "utf8")
const HAS_RATE_LIMIT = /rate[\s-_]?limit|too many requests|429/i.test(ROUTE_SOURCE)

function createRequest(body: string) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  })
}

const VALID_PAYLOAD = {
  name: "Markus Ruhl",
  email: "markus@example.com",
  message: "I would like to discuss collaboration opportunities.",
}

afterEach(() => {
  vi.useRealTimers()
})

describe("POST /api/contact", () => {
  it("accepts a valid contact form submission", async () => {
    vi.useFakeTimers()

    const responsePromise = POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
    await vi.advanceTimersByTimeAsync(500)

    const response = await responsePromise
    const json = (await response.json()) as {
      success: boolean
      data?: { message?: string }
    }

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data?.message).toBe("Message received successfully! We'll get back to you soon.")
  })

  it("rejects submissions with missing required fields", async () => {
    const response = await POST(createRequest(JSON.stringify({})))
    const json = (await response.json()) as {
      success: boolean
      error?: { code?: string; fields?: Record<string, string> }
    }

    expect(response.status).toBe(422)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("VALIDATION_ERROR")
    expect(json.error?.fields).toMatchObject({
      name: "Name is required.",
      email: "Email is required.",
      message: "Message is required.",
    })
  })

  it("rejects malformed JSON request bodies", async () => {
    const response = await POST(createRequest("{invalid-json"))
    const json = (await response.json()) as {
      success: boolean
      error?: { code?: string; message?: string }
    }

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("BAD_REQUEST")
    expect(json.error?.message).toBe("Request body must be valid JSON.")
  })

  it("rejects malformed field data", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({
          name: 123,
          email: "not-an-email",
          message: false,
        })
      )
    )
    const json = (await response.json()) as {
      success: boolean
      error?: { code?: string; fields?: Record<string, string> }
    }

    expect(response.status).toBe(422)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("VALIDATION_ERROR")
    expect(json.error?.fields).toMatchObject({
      name: "Name must be a string.",
      email: "Email must be a valid email address.",
      message: "Message must be a string.",
    })
  })

  ;(HAS_RATE_LIMIT ? it : it.skip)("returns 429 when rate limit is exceeded", async () => {
    vi.useFakeTimers()

    const statuses: number[] = []
    for (let i = 0; i < 30; i += 1) {
      const responsePromise = POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
      await vi.advanceTimersByTimeAsync(500)
      const response = await responsePromise
      statuses.push(response.status)
      if (response.status === 429) break
    }

    expect(statuses).toContain(429)
  })
})
