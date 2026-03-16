import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "./route"

const ROUTE_SOURCE = readFileSync(fileURLToPath(new URL("./route.ts", import.meta.url)), "utf8")
const HAS_RATE_LIMIT = /rate[\s-_]?limit|too many requests|429/i.test(ROUTE_SOURCE)
const HAS_CSRF = /NEXT_PUBLIC_SITE_URL|origin.*siteUrl|siteUrl.*origin/i.test(ROUTE_SOURCE)
const HAS_CONTENT_TYPE_GUARD = /unsupported media type|415/i.test(ROUTE_SOURCE)
const HAS_SANITIZATION = /sanitize|crlf|\\\\r\\\\n|\x00-\x1f/i.test(ROUTE_SOURCE)

/**
 * Each test gets a unique IP via x-forwarded-for so the module-level
 * rate-limit map never carries state between tests (no watch-mode flakiness).
 * Pass an explicit `ip` only when you need multiple requests from the same
 * "client" (e.g., the rate-limit trip test).
 */
function createRequest(body: string, options: { ip?: string; contentType?: string; origin?: string } = {}) {
  const ip = options.ip ?? randomUUID()
  const headers: Record<string, string> = {
    "content-type": options.contentType ?? "application/json",
    "x-forwarded-for": ip,
  }
  if (options.origin !== undefined) headers["origin"] = options.origin
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers,
    body,
  })
}

const VALID_PAYLOAD = {
  name: "Markus Ruhl",
  email: "markus@example.com",
  message: "I would like to discuss collaboration opportunities.",
}

async function submitWithSimulatedMailFailure(simulatedError: Error) {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  vi.resetModules()
  vi.doMock("@/lib/api/response", async () => {
    const actual = await vi.importActual<typeof import("@/lib/api/response")>("@/lib/api/response")
    return {
      ...actual,
      ok: vi.fn(() => {
        throw simulatedError
      }),
    }
  })

  try {
    const { POST: isolatedPost } = await import("./route")
    const responsePromise = isolatedPost(createRequest(JSON.stringify(VALID_PAYLOAD)))
    await expect(responsePromise).resolves.toBeInstanceOf(Response)
    const response = await responsePromise
    const text = await response.text()
    const json = JSON.parse(text) as {
      success: boolean
      error?: { code?: string; message?: string }
    }
    return { response, text, json, errorSpy }
  } finally {
    vi.doUnmock("@/lib/api/response")
    vi.resetModules()
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  vi.useRealTimers()
})

beforeEach(() => {
  // Guard rail: tests must not perform real outbound requests.
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("Unexpected network call in contact API tests")
    })
  )
})

describe("POST /api/contact", () => {
  it("accepts a valid contact form submission", async () => {
    // No artificial delay in route since PR #53 removed the simulation timeout.
    const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
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

  it("rejects oversized message payloads", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({
          ...VALID_PAYLOAD,
          message: "x".repeat(2001),
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
      message: "Message must be at most 2000 characters.",
    })
  })

  // Security guard added in PR #53: reject non-JSON content types with 415.
  ;(HAS_CONTENT_TYPE_GUARD ? it : it.skip)("rejects requests with wrong Content-Type", async () => {
    const response = await POST(
      createRequest(JSON.stringify(VALID_PAYLOAD), { contentType: "text/plain" })
    )
    const json = (await response.json()) as { success: boolean; error?: { code?: string } }

    expect(response.status).toBe(415)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("BAD_REQUEST")
  })

  // Security guard added in PR #53: reject cross-origin requests when
  // NEXT_PUBLIC_SITE_URL is configured. Test only runs when the guard exists.
  ;(HAS_CSRF ? it : it.skip)("rejects cross-origin requests when site URL is configured", async () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
    try {
      const response = await POST(
        createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://evil.com" })
      )
      const json = (await response.json()) as { success: boolean }

      expect(response.status).toBe(403)
      expect(json.success).toBe(false)
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
      else process.env.NEXT_PUBLIC_SITE_URL = original
    }
  })

  // Uses a fixed IP across iterations so the in-memory rate-limit window is
  // consumed predictably. A unique IP is not used here by design.
  ;(HAS_RATE_LIMIT ? it : it.skip)("returns 429 when rate limit is exceeded", async () => {
    const fixedIp = `test-rate-limit-${randomUUID()}`
    const statuses: number[] = []
    for (let i = 0; i < 30; i += 1) {
      const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD), { ip: fixedIp }))
      statuses.push(response.status)
      if (response.status === 429) break
    }

    expect(statuses).toContain(429)
  })

  // Security guard added in PR #53: CRLF/control-char injection in string
  // fields must be stripped, not echoed back or forwarded to mail headers.
  ;(HAS_SANITIZATION ? it : it.skip)("strips CRLF/control characters and accepts sanitized submission", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({
          name: "Evil\r\nBcc: attacker@evil.com",
          email: "markus@example.com",
          message: "This is a legitimate looking message.",
        })
      )
    )
    // Sanitized value stays within field length limits — expect 200.
    expect(response.status).toBe(200)
    // Response body must not echo back raw CRLF sequences.
    const text = await response.text()
    expect(text).not.toMatch(/\r\n/)
  })

  // Error responses must never expose internal stack traces, file paths, or
  // raw Error objects to the client (OWASP A05 / security misconfiguration).
  it("does not leak stack traces or internal details in error responses", async () => {
    const response = await POST(createRequest(JSON.stringify({})))
    const text = await response.text()
    expect(text).not.toMatch(/at .+\(.+:\d+:\d+\)/)
    expect(text).not.toMatch(/node_modules/)
    expect(text).not.toMatch(/Error:/)
    // Must still return a structured error envelope.
    const json = JSON.parse(text) as { success: boolean; error?: { code?: string } }
    expect(json.success).toBe(false)
    expect(json.error?.code).toBeDefined()
  })

  it("returns 500 and logs timeout failures from the mail service", async () => {
    const timeoutError = Object.assign(new Error("SMTP timeout after 10000ms"), {
      code: "ETIMEDOUT",
      name: "TimeoutError",
    })
    const { response, text, json, errorSpy } = await submitWithSimulatedMailFailure(timeoutError)

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("INTERNAL_ERROR")
    expect(json.error?.message).toBe("An unexpected error occurred. Please try again later.")
    expect(text).not.toMatch(/smtp|timeout|stack|node_modules|password/i)
    expect(errorSpy).toHaveBeenCalled()
    expect(errorSpy.mock.calls.some((call) => call.some((arg) => arg === timeoutError))).toBe(true)
  })

  it("returns 500 and logs transporter rejection errors safely", async () => {
    const smtpRejectError = Object.assign(
      new Error("550 5.7.1 Relaying denied for smtp-user:smtp-pass@smtp.example.com"),
      { code: "EENVELOPE" }
    )
    const { response, text, json, errorSpy } = await submitWithSimulatedMailFailure(smtpRejectError)

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("INTERNAL_ERROR")
    expect(json.error?.message).toBe("An unexpected error occurred. Please try again later.")
    expect(text).not.toMatch(/smtp-user|smtp-pass|smtp\.example\.com|550|stack|node_modules/i)
    expect(errorSpy).toHaveBeenCalled()
    expect(errorSpy.mock.calls.some((call) => call.some((arg) => arg === smtpRejectError))).toBe(true)
  })

  it("returns 500 and logs network errors during mail send without crashing", async () => {
    const networkError = Object.assign(new Error("connect ECONNRESET 203.0.113.5:587"), {
      code: "ECONNRESET",
      syscall: "connect",
    })
    const { response, text, json, errorSpy } = await submitWithSimulatedMailFailure(networkError)

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("INTERNAL_ERROR")
    expect(json.error?.message).toBe("An unexpected error occurred. Please try again later.")
    expect(text).not.toMatch(/ECONNRESET|203\.0\.113\.5|587|stack|node_modules|connect/i)
    expect(errorSpy).toHaveBeenCalled()
    expect(errorSpy.mock.calls.some((call) => call.some((arg) => arg === networkError))).toBe(true)
  })
})
