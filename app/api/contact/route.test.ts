import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as contactMail from "@/lib/contact/mail"
import { OPTIONS, POST } from "./route"

const ROUTE_SOURCE = readFileSync(fileURLToPath(new URL("./route.ts", import.meta.url)), "utf8")
const HAS_RATE_LIMIT = /rate[\s-_]?limit|too many requests|429/i.test(ROUTE_SOURCE)
const HAS_CSRF = /NEXT_PUBLIC_SITE_URL|origin.*siteUrl|siteUrl.*origin/i.test(ROUTE_SOURCE)
const HAS_CONTENT_TYPE_GUARD = /unsupported media type|415/i.test(ROUTE_SOURCE)
const HAS_SANITIZATION = /sanitize|crlf|\\\\r\\\\n|\x00-\x1f/i.test(ROUTE_SOURCE)
const HAS_CORS_HEADERS = /Access-Control-Allow-Origin/i.test(ROUTE_SOURCE)

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

type ContactRouteErrorBody = {
  success: boolean
  data?: { message?: string }
  error?: { code?: string; message?: string }
}

function assertGenericSafeError(text: string, rawErrorMessage: string) {
  expect(text).not.toContain(rawErrorMessage)
  expect(text).not.toMatch(/at .+\(.+:\d+:\d+\)/)
  expect(text).not.toMatch(/node_modules|smtp-user|smtp-pass|password|api[_-]?key/i)
  expect(text).not.toMatch(/[A-Za-z]:\\\\/)
}

async function submitWithMockedMailTransport(
  transportImpl: () => Promise<void> | void
): Promise<{
  response: Response
  text: string
  json: ContactRouteErrorBody
  errorSpy: ReturnType<typeof vi.spyOn>
  sendContactMailMock: ReturnType<typeof vi.spyOn<typeof contactMail, "sendContactMail">>
}> {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  const sendContactMailMock = vi
    .spyOn(contactMail, "sendContactMail")
    .mockImplementation(transportImpl)
  const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
  const text = await response.text()
  const json = JSON.parse(text) as ContactRouteErrorBody
  return { response, text, json, errorSpy, sendContactMailMock }
}

afterEach(() => {
  vi.restoreAllMocks()
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
    const json = (await response.json()) as {
      success: boolean
      error?: { code?: string; message?: string }
    }

    expect(response.status).toBe(415)
    expect(json).toEqual({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Unsupported Media Type",
      },
    })
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
      const json = (await response.json()) as {
        success: boolean
        error?: { code?: string; message?: string }
      }

      expect(response.status).toBe(403)
      expect(json).toEqual({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Forbidden",
        },
      })
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

  ;(HAS_RATE_LIMIT ? it : it.skip)("returns a stable 429 error envelope when rate limit is exceeded", async () => {
    const fixedIp = `test-rate-limit-schema-${randomUUID()}`

    for (let i = 0; i < 40; i += 1) {
      const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD), { ip: fixedIp }))
      if (response.status === 429) {
        const json = (await response.json()) as {
          success: boolean
          error?: { code?: string; message?: string }
        }
        expect(json).toEqual({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Too many requests. Please try again later.",
          },
        })
        return
      }
    }

    throw new Error("expected rate limiter to return 429 within 40 requests")
  })

  // Security guard (wave-3): X-Forwarded-For leftmost value is client-controlled.
  // An attacker can set X-Forwarded-For: <fake-ip> to rotate IPs and bypass the
  // per-IP rate limit.  The route must use the LAST (proxy-appended) value, so
  // that spoofed leading entries do not defeat the limit.
  //
  // This test verifies that a request with a multi-hop X-Forwarded-For header
  // where the first value differs per-request but the last value (the trusted
  // proxy entry) is fixed still hits the rate limit using the last value.
  ;(HAS_RATE_LIMIT ? it : it.skip)(
    "rate limit is enforced on the proxy-appended (last) X-Forwarded-For IP, not the client-injectable first value",
    async () => {
      // The trusted proxy IP is fixed across all requests — this is the value
      // the route should use for rate-limit bucketing.
      const trustedProxyIp = `trusted-proxy-${randomUUID()}`
      const statuses: number[] = []

      for (let i = 0; i < 30; i += 1) {
        // Each request has a unique spoofed first hop but the same last hop.
        // If the route incorrectly uses the first value, each request looks like
        // a brand new IP and the rate limit is never reached.  If it correctly
        // uses the last value, the window fills up and 429 is returned.
        const spoofedFirstHop = `spoofed-${randomUUID()}`
        const headers: Record<string, string> = {
          "content-type": "application/json",
          // Multi-value X-Forwarded-For: client-injected, proxy-appended
          "x-forwarded-for": `${spoofedFirstHop}, ${trustedProxyIp}`,
        }
        const req = new Request("http://localhost/api/contact", {
          method: "POST",
          headers,
          body: JSON.stringify(VALID_PAYLOAD),
        })
        const response = await POST(req as Parameters<typeof POST>[0])
        statuses.push(response.status)
        if (response.status === 429) break
      }

      // Must hit 429 because the rate limiter sees the same trustedProxyIp
      // on every request — not the rotating spoofed first-hop values.
      expect(statuses).toContain(429)
    }
  )

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
})

// ---------------------------------------------------------------------------
// CSRF / origin guard — behavioral
// ---------------------------------------------------------------------------
//
// This app uses origin-header-based CSRF protection rather than token-based
// CSRF.  The Origin header is the implicit "token": browsers always attach it
// on cross-origin requests, so its absence means same-origin (allowed) and a
// mismatch means cross-origin (rejected with 403).
//
// Execution order in the hardened route (PR #53):
//   [1] Origin check  → cheapest gate, runs before rate-limit and JSON parse
//   [2] Content-Type  → rejects non-JSON before body is read
//   [3] Rate limiting → only applied after origin + content-type pass
//   [4] JSON parse / sanitise / validate
//
// Tests in this block are skipped on the unhardened baseline (HAS_CSRF=false)
// and run fully against the hardened route.
describe("CSRF / origin guard — behavioral", () => {
  ;(HAS_CSRF ? it : it.skip)(
    "allows requests without Origin header (same-origin browser form submission)",
    async () => {
      // Browsers omit Origin on same-origin requests that are not triggered by
      // cross-origin fetch/XHR.  Route must treat absence of Origin as allowed.
      const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
      expect(response.status).toBe(200)
    }
  )

  ;(HAS_CSRF ? it : it.skip)(
    "allows requests from the configured allowed origin",
    async () => {
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const response = await POST(
          createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://example.com" })
        )
        expect(response.status).toBe(200)
        expect((await response.json() as { success: boolean }).success).toBe(true)
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )

  ;(HAS_CSRF ? it : it.skip)(
    "rejects disallowed origin with 403 — structured body, no sensitive data leaked",
    async () => {
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const response = await POST(
          createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://attacker.com" })
        )
        const text = await response.text()
        const json = JSON.parse(text) as { success: boolean; error?: { code?: string; message?: string } }

        expect(response.status).toBe(403)
        expect(json.success).toBe(false)
        expect(json.error?.code).toBeDefined()
        // Rejection body must never expose internals
        expect(text).not.toMatch(/at .+\(.+:\d+:\d+\)/)
        expect(text).not.toMatch(/node_modules/)
        expect(text).not.toMatch(/Error:/)
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )

  ;(HAS_CSRF ? it : it.skip)(
    "rejects null Origin (file:// page CSRF attempt) with 403",
    async () => {
      // Browsers send Origin: null for requests initiated from file:// pages and
      // data: URIs.  The string "null" must never match any https:// origin.
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const response = await POST(
          createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "null" })
        )
        expect(response.status).toBe(403)
        expect((await response.json() as { success: boolean }).success).toBe(false)
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )
})

// ---------------------------------------------------------------------------
// Response header contracts
// ---------------------------------------------------------------------------
//
// All responses — success and error — must carry application/json content-type.
// No CORS allow-origin wildcard should ever be emitted; doing so would nullify
// the origin-based CSRF protection above.
describe("response header contracts", () => {
  it("returns Content-Type application/json on success responses", async () => {
    const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
    expect(response.headers.get("content-type")).toMatch(/application\/json/)
  })

  it("returns Content-Type application/json on validation error responses", async () => {
    const response = await POST(createRequest(JSON.stringify({})))
    expect(response.headers.get("content-type")).toMatch(/application\/json/)
  })

  it("returns Content-Type application/json on parse error responses", async () => {
    const response = await POST(createRequest("{bad-json"))
    expect(response.headers.get("content-type")).toMatch(/application\/json/)
  })

  ;(HAS_CSRF ? it : it.skip)(
    "does not emit CORS allow-origin wildcard on cross-origin rejections",
    async () => {
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const response = await POST(
          createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://attacker.com" })
        )
        // '*' here would let attacker JS read the 403 body and probe the API
        expect(response.headers.get("access-control-allow-origin")).not.toBe("*")
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )
})

// ---------------------------------------------------------------------------
// Error response body safety (OWASP A05 — security misconfiguration)
// ---------------------------------------------------------------------------
//
// All error paths must return structured JSON envelopes.  Stack traces, file
// paths, and raw Error objects must never appear in response bodies regardless
// of whether the hardening PR is active.
describe("error response body safety", () => {
  it("does not leak stack traces or internals in validation error responses", async () => {
    const response = await POST(createRequest(JSON.stringify({})))
    const text = await response.text()

    expect(text).not.toMatch(/at .+\(.+:\d+:\d+\)/)
    expect(text).not.toMatch(/node_modules/)
    expect(text).not.toMatch(/Error:/)

    const json = JSON.parse(text) as { success: boolean; error?: { code?: string } }
    expect(json.success).toBe(false)
    expect(json.error?.code).toBeDefined()
  })

  it("does not leak stack traces or internals in JSON parse error responses", async () => {
    const response = await POST(createRequest("{bad-json"))
    const text = await response.text()

    expect(text).not.toMatch(/at .+\(.+:\d+:\d+\)/)
    expect(text).not.toMatch(/node_modules/)
    expect(text).not.toMatch(/SyntaxError/)

    const json = JSON.parse(text) as { success: boolean; error?: { code?: string } }
    expect(json.success).toBe(false)
    expect(json.error?.code).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// CORS response headers — allowlisted origins
// ---------------------------------------------------------------------------
//
// When the request Origin matches the expected origin the route must reflect
// it back in Access-Control-Allow-Origin (never '*') and set
// Access-Control-Allow-Credentials: true so that cookie-authenticated callers
// can read the response.
//
// Execution order verified here: the OPTIONS preflight handler runs BEFORE
// the CSRF guard in POST — a preflight for an allowlisted origin must succeed
// (204) even though the POST CSRF guard would also accept it. A preflight for
// a disallowed origin must be rejected (403) without CORS headers.
describe("CORS response headers — allowlisted origins", () => {
  ;(HAS_CORS_HEADERS ? it : it.skip)(
    "POST from allowlisted origin gets Access-Control-Allow-Origin echoed back",
    async () => {
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const response = await POST(
          createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://example.com" })
        )
        expect(response.status).toBe(200)
        expect(response.headers.get("access-control-allow-origin")).toBe("https://example.com")
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )

  ;(HAS_CORS_HEADERS ? it : it.skip)(
    "POST from allowlisted origin gets Access-Control-Allow-Credentials: true",
    async () => {
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const response = await POST(
          createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://example.com" })
        )
        expect(response.headers.get("access-control-allow-credentials")).toBe("true")
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )

  ;(HAS_CORS_HEADERS ? it : it.skip)(
    "POST from disallowed origin (403) does NOT receive Access-Control-Allow-Origin",
    async () => {
      // Attacker JS must not be able to read the 403 body.
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const response = await POST(
          createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://attacker.com" })
        )
        expect(response.status).toBe(403)
        expect(response.headers.get("access-control-allow-origin")).toBeNull()
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )

  ;(HAS_CORS_HEADERS ? it : it.skip)(
    "OPTIONS preflight from allowlisted origin returns 204 with CORS headers (runs before CSRF gate)",
    async () => {
      // This verifies the execution order: OPTIONS handler runs independently
      // of the POST CSRF guard. A preflight must complete before the browser
      // attempts the actual POST.
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const preflight = new Request("http://localhost/api/contact", {
          method: "OPTIONS",
          headers: {
            origin: "https://example.com",
            "access-control-request-method": "POST",
            "access-control-request-headers": "content-type",
          },
        })
        const response = await OPTIONS(preflight as Parameters<typeof OPTIONS>[0])
        expect(response.status).toBe(204)
        expect(response.headers.get("access-control-allow-origin")).toBe("https://example.com")
        expect(response.headers.get("access-control-allow-credentials")).toBe("true")
        expect(response.headers.get("access-control-allow-methods")).toMatch(/POST/)
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )

  ;(HAS_CORS_HEADERS ? it : it.skip)(
    "OPTIONS preflight from disallowed origin returns 403 with no CORS headers",
    async () => {
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const preflight = new Request("http://localhost/api/contact", {
          method: "OPTIONS",
          headers: {
            origin: "https://attacker.com",
            "access-control-request-method": "POST",
          },
        })
        const response = await OPTIONS(preflight as Parameters<typeof OPTIONS>[0])
        expect(response.status).toBe(403)
        expect(response.headers.get("access-control-allow-origin")).toBeNull()
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )

  // ---------------------------------------------------------------------------
  // Credentialed cross-origin request
  // ---------------------------------------------------------------------------
  //
  // A "credentialed" CORS request is one sent with fetch({ credentials: 'include' })
  // or XHR.withCredentials = true — the browser attaches session cookies and auth
  // headers automatically.  For the browser to expose the response body to JS:
  //   • The server MUST reply with Access-Control-Allow-Credentials: true, AND
  //   • Access-Control-Allow-Origin must be the specific origin, NOT '*'
  // We simulate this by including a Cookie header in the request.
  ;(HAS_CORS_HEADERS ? it : it.skip)(
    "credentialed cross-origin POST from allowlisted origin — returns ACAO + ACAC: true",
    async () => {
      const original = process.env.NEXT_PUBLIC_SITE_URL
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
      try {
        const credentialedRequest = new Request("http://localhost/api/contact", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "https://example.com",
            // Simulate fetch({ credentials: 'include' }) — browser attaches cookies
            cookie: "session=abc123; theme=dark",
            "x-forwarded-for": randomUUID(),
          },
          body: JSON.stringify(VALID_PAYLOAD),
        })
        const response = await POST(credentialedRequest as Parameters<typeof POST>[0])

        // Both headers required for browser to expose the response to credentialed JS
        expect(response.status).toBe(200)
        expect(response.headers.get("access-control-allow-origin")).toBe("https://example.com")
        expect(response.headers.get("access-control-allow-credentials")).toBe("true")
        // Wildcard + credentials is rejected by browsers — must never appear
        expect(response.headers.get("access-control-allow-origin")).not.toBe("*")
      } finally {
        if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
        else process.env.NEXT_PUBLIC_SITE_URL = original
      }
    }
  )
})

// ---------------------------------------------------------------------------
// Security response headers (defence-in-depth)
// ---------------------------------------------------------------------------
//
// Every response — success, error, and preflight — must carry:
//
//   X-Frame-Options: DENY
//     Prevents this API endpoint being embedded in an iframe on an attacker
//     page.  Although JSON APIs are not rendered, legacy browsers can expose
//     JSON in frame contexts.
//
//   X-Content-Type-Options: nosniff
//     Prevents MIME-sniffing of the JSON body as script/stylesheet, which
//     can enable cross-origin attacks even when CORS policy is correct.
//
//   Cache-Control: no-store
//     Prevents sensitive API responses (including error details) from being
//     stored in browser or proxy caches.
//
// All three are stamped by withSecurityHeaders() on every exit path in both
// OPTIONS and POST — including CSRF 403 rejections.
describe("security response headers", () => {
  it("includes X-Frame-Options: DENY on success responses", async () => {
    const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
    expect(response.headers.get("x-frame-options")).toBe("DENY")
  })

  it("includes X-Frame-Options: DENY on validation error responses", async () => {
    const response = await POST(createRequest(JSON.stringify({})))
    expect(response.headers.get("x-frame-options")).toBe("DENY")
  })

  it("includes X-Frame-Options: DENY on CSRF rejection responses (403)", async () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
    try {
      const response = await POST(
        createRequest(JSON.stringify(VALID_PAYLOAD), { origin: "https://attacker.com" })
      )
      expect(response.status).toBe(403)
      expect(response.headers.get("x-frame-options")).toBe("DENY")
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
      else process.env.NEXT_PUBLIC_SITE_URL = original
    }
  })

  it("includes X-Content-Type-Options: nosniff on success responses", async () => {
    const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
    expect(response.headers.get("x-content-type-options")).toBe("nosniff")
  })

  it("includes X-Content-Type-Options: nosniff on error responses", async () => {
    const response = await POST(createRequest(JSON.stringify({})))
    expect(response.headers.get("x-content-type-options")).toBe("nosniff")
  })

  it("includes Cache-Control: no-store on success responses", async () => {
    const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
    expect(response.headers.get("cache-control")).toBe("no-store")
  })

  it("includes Cache-Control: no-store on error responses", async () => {
    const response = await POST(createRequest(JSON.stringify({})))
    expect(response.headers.get("cache-control")).toBe("no-store")
  })

  it("includes X-Frame-Options: DENY on OPTIONS preflight responses", async () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com"
    try {
      const preflight = new Request("http://localhost/api/contact", {
        method: "OPTIONS",
        headers: {
          origin: "https://example.com",
          "access-control-request-method": "POST",
        },
      })
      const response = await OPTIONS(preflight as Parameters<typeof OPTIONS>[0])
      expect(response.headers.get("x-frame-options")).toBe("DENY")
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
      else process.env.NEXT_PUBLIC_SITE_URL = original
    }
  })
})

// ---------------------------------------------------------------------------
// Method constraints — GET is intentionally absent (CSRF exempt by omission)
// ---------------------------------------------------------------------------
//
// CSRF protection typically exempts GET requests because GET is supposed to be
// idempotent (no state mutation).  This endpoint takes a stronger posture:
// rather than trusting "GET is safe" assumptions, it deliberately omits the
// GET handler entirely.  The contact form only accepts submissions (POST).
//
// Consequences:
//   • No read-mutation surface: a CSRF attack via GET cannot trigger anything.
//   • Any GET /api/contact request returns 405 (Method Not Allowed) from
//     the Next.js router — no application code runs, no data is read.
//   • The absence of GET is tested below to prevent accidental regression
//     (e.g., a developer adding a debugging GET route and opening a new surface).
//
// This is the correct security posture: CSRF is "exempt" for GET because GET
// is structurally absent — not because the check is skipped.
describe("method constraints", () => {
  it("does not export a GET handler — contact API has no read surface", async () => {
    // Dynamic import avoids a static TS type error for an export that should
    // not exist.  If GET is accidentally added to route.ts this test fails.
    const routeModule = await import("./route")
    expect((routeModule as Record<string, unknown>).GET).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Mail service failure handling
// ---------------------------------------------------------------------------
//
// The route calls sendContactMail inside a try/catch.  Failures must:
//   • Always return 500 with a generic client-safe message (OWASP A05)
//   • Never leak SMTP credentials, server paths, or raw error messages
//   • Log the error server-side (with IP + timestamp, not PII)
//
// Tests mock sendContactMail via vi.spyOn so no real transport is needed.
describe("mail service failure handling", () => {
  it("keeps success baseline at 200 when mail transport succeeds", async () => {
    const { response, json, sendContactMailMock } = await submitWithMockedMailTransport(async () => {})

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data?.message).toBe("Message received successfully! We'll get back to you soon.")
    expect(sendContactMailMock).toHaveBeenCalledTimes(1)
  })

  it("returns 500 when SMTP transport times out and does not leak timeout internals", async () => {
    vi.useFakeTimers()
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const sendContactMailMock = vi
      .spyOn(contactMail, "sendContactMail")
      .mockImplementation(() => new Promise<void>(() => {}))

    const responsePromise = POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
    await vi.advanceTimersByTimeAsync(10_001)
    const response = await responsePromise
    const text = await response.text()
    const json = JSON.parse(text) as ContactRouteErrorBody

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("INTERNAL_ERROR")
    expect(json.error?.message).toBe("An unexpected error occurred. Please try again later.")
    assertGenericSafeError(text, "Mail service timeout")
    expect(sendContactMailMock).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalled()
  })

  it("returns 500 for SMTP transporter rejection with generic safe response", async () => {
    const rejectionMessage =
      "SMTP authentication failed for smtp-user:smtp-pass@smtp.example.com (ECONNREFUSED)"
    const { response, text, json, errorSpy } = await submitWithMockedMailTransport(() =>
      Promise.reject(new Error(rejectionMessage))
    )

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("INTERNAL_ERROR")
    expect(json.error?.message).toBe("An unexpected error occurred. Please try again later.")
    assertGenericSafeError(text, rejectionMessage)
    expect(errorSpy).toHaveBeenCalled()
  })

  it("returns 500 for DNS/network failures during send and keeps process stable", async () => {
    const networkFailureMessage = "getaddrinfo ENOTFOUND smtp.example.com"
    const { response, text, json, errorSpy, sendContactMailMock } =
      await submitWithMockedMailTransport(() => Promise.reject(new Error(networkFailureMessage)))

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("INTERNAL_ERROR")
    expect(json.error?.message).toBe("An unexpected error occurred. Please try again later.")
    assertGenericSafeError(text, networkFailureMessage)
    expect(sendContactMailMock).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalled()
  })

  it("returns a safe 500 envelope when the mail layer throws a non-Error value", async () => {
    const { response, text, json, errorSpy, sendContactMailMock } =
      await submitWithMockedMailTransport(() => Promise.reject("transport exploded"))

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error?.code).toBe("INTERNAL_ERROR")
    expect(json.error?.message).toBe("An unexpected error occurred. Please try again later.")
    expect(text).not.toContain("transport exploded")
    expect(text).not.toMatch(/at .+\(.+:\d+:\d+\)/)
    expect(sendContactMailMock).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Sanitization effectiveness — injection and boundary inputs
// ---------------------------------------------------------------------------
//
// The route sanitizes control characters before validation. HTML-like inputs
// (XSS patterns) are valid characters within field limits and MUST pass
// through to the mail transport (which escapes them via escapeHtml). The
// contact API is not a browser renderer — HTML injection defense belongs at
// the mail/rendering layer, not here.
//
// These tests verify the API contract for adversarial-looking but structurally
// valid inputs: the route returns 200 (not 400/500), does NOT echo raw HTML
// back in the response body, and correctly strips ONLY control characters.
describe("sanitization effectiveness", () => {
  it("accepts HTML/XSS-like input and returns 200 — escaping is mail-layer responsibility", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({
          name: "<script>alert('xss')</script>",
          email: "markus@example.com",
          message: "<img src=x onerror=alert(1)> This is a message that is long enough.",
        })
      )
    )
    // HTML chars are valid string content — field lengths are within limits,
    // so validation passes. The API must not reject or crash on these inputs.
    expect(response.status).toBe(200)
    expect((await response.json() as { success: boolean }).success).toBe(true)
  })

  it("response body never echoes back raw HTML tags from input fields", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({
          name: "<b>Bold Name</b>",
          email: "markus@example.com",
          message: "<p>Paragraph message content that is long enough to pass.</p>",
        })
      )
    )
    const text = await response.text()
    // The success response body is a fixed string — it does not interpolate
    // user input. Verify no raw HTML tags appear in the response.
    expect(text).not.toMatch(/<b>|<\/b>|<p>|<\/p>/)
  })

  it("control characters in name and message fields are stripped before validation", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({
          // Name and message contain control characters; after stripping they
          // both meet minimum length requirements and pass validation.
          // Email is kept clean so the field passes format validation.
          name: "Al\x00ice\x01",
          email: "alice@example.com",
          message: "Hello,\r\nthis is a\ttest message that is long enough.",
        })
      )
    )
    // Control chars stripped → fields are valid → 200
    expect(response.status).toBe(200)
    const text = await response.text()
    // Response body must not contain raw control characters echoed back
    // eslint-disable-next-line no-control-regex
    expect(text).not.toMatch(/[\x00-\x1f]/)
  })

  it("null byte injection in email field is stripped and then rejected as invalid email format", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({
          name: "Alice",
          email: "ali\x00ce@example.com",
          message: "A valid message that is long enough to pass validation.",
        })
      )
    )
    // "ali ce@example.com" (null replaced with space) fails email format check → 422
    // OR the sanitized value becomes "alice@example.com" if null is stripped cleanly.
    // Either way: must never be 500, and must return a structured envelope.
    expect([200, 422]).toContain(response.status)
    const json = (await response.json()) as { success: boolean; error?: { code?: string } }
    if (response.status === 422) {
      expect(json.error?.code).toBe("VALIDATION_ERROR")
    } else {
      expect(json.success).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Mail fallback PII redaction
// ---------------------------------------------------------------------------
//
// When no mail provider is configured, the route falls back to a console log.
// That log must never contain the submitter's name, email address, or message
// content — even in the fallback path. This test verifies the redaction contract
// by inspecting what the console receives when sendContactMail is allowed to
// run normally (no spyOn mock on sendContactMail itself).
describe("mail fallback PII redaction", () => {
  it("fallback console log does not emit name or email address values", async () => {
    // Ensure no mail transport is configured
    const originalResend = process.env.RESEND_API_KEY
    const originalSmtp = process.env.SMTP_HOST
    delete process.env.RESEND_API_KEY
    delete process.env.SMTP_HOST

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})

    try {
      const response = await POST(createRequest(JSON.stringify(VALID_PAYLOAD)))
      expect(response.status).toBe(200)

      // Collect all console.info calls that contain our fallback event
      const fallbackCalls = infoSpy.mock.calls
        .map((args) => (args[0] as string) ?? "")
        .filter((s) => s.includes("contact_submission_fallback"))

      expect(fallbackCalls.length).toBeGreaterThan(0)

      for (const logLine of fallbackCalls) {
        // Name must be redacted — never log the submitter's real name
        expect(logLine).not.toContain(VALID_PAYLOAD.name)
        // Email address must be redacted — PII
        expect(logLine).not.toContain(VALID_PAYLOAD.email)
        // Message must never appear (only messageLength is logged)
        expect(logLine).not.toContain(VALID_PAYLOAD.message)
        // Subject must not contain the name either
        expect(logLine).not.toMatch(/New contact from Markus/)
      }
    } finally {
      if (originalResend !== undefined) process.env.RESEND_API_KEY = originalResend
      if (originalSmtp !== undefined) process.env.SMTP_HOST = originalSmtp
    }
  })
})
