import { NextRequest, NextResponse } from "next/server"
import { validate, ContactSchema } from "@/lib/api/validation"
import { ok, validationError, clientError, serverError } from "@/lib/api/response"

// ---------------------------------------------------------------------------
// In-memory rate limiter (sliding window, per IP).
// NOTE: Resets on server restart. Replace with Redis for multi-instance setups.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 5 // max submissions per window per IP
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count++
  return false
}

// Purge stale entries to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(ip)
  }
}, RATE_LIMIT_WINDOW_MS * 2)

// Strip control characters to prevent email-header injection (CRLF sequences).
// Runs before schema validation so sanitised values are what get checked.
function sanitizeText(value: string): string {
  return value.replace(/[\r\n\t\x00-\x1f\x7f]/g, " ").trim()
}

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
//
// Access-Control-Allow-Origin echoes the specific allowed origin rather than
// '*' so that Access-Control-Allow-Credentials: true is valid (browsers reject
// wildcard + credentials mode).
//
// CORS headers are intentionally NOT added to 403 CSRF-rejection responses:
// doing so would let attacker JS read the 403 body and probe the API surface.
// All other responses (including 415, 429, 422, 400, 500) do carry CORS
// headers when the origin is present and allowed, so the browser can surface
// structured error detail to the calling application.

function buildCorsHeaders(allowedOrigin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  }
}

// Attach CORS headers to an existing NextResponse when the request carried an
// Origin that passed the CSRF check. No-op when origin is null (same-origin).
function withCors<T>(response: NextResponse<T>, origin: string | null): NextResponse<T> {
  if (origin) {
    const h = buildCorsHeaders(origin)
    for (const [key, value] of Object.entries(h)) {
      response.headers.set(key, value as string)
    }
  }
  return response
}

// Security headers stamped on every response (including CSRF 403 rejections).
// X-Frame-Options: DENY — prevents this API being embedded in an iframe;
//   defence-in-depth even for JSON APIs since legacy browsers can expose JSON
//   in frame contexts.
// X-Content-Type-Options: nosniff — prevents MIME-sniffing of the JSON body
//   as script/stylesheet, which can enable cross-origin attacks even when the
//   CORS policy is correct.
// Cache-Control: no-store — sensitive API responses (including error detail)
//   must never be stored in browser or proxy caches.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
}

function withSecurityHeaders<T>(response: NextResponse<T>): NextResponse<T> {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

// ---------------------------------------------------------------------------
// CORS preflight handler
// ---------------------------------------------------------------------------
//
// Middleware execution order rationale — OPTIONS runs BEFORE the CSRF/origin
// check in POST.  This is architecturally correct because:
//
//   • Preflight requests carry no user data and cannot be weaponised for CSRF.
//   • The browser sends OPTIONS to ask "is this origin allowed?"; blocking the
//     preflight at the CSRF layer would prevent allowlisted origins from ever
//     reaching the POST handler.
//   • Allowing the preflight does NOT grant access — the subsequent POST is
//     still subject to the full CSRF + rate-limit + validation stack.
//
// Response: 204 + full CORS headers for allowed origins, 403 for others.

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")
  const expectedOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin

  if (!origin || origin !== expectedOrigin) {
    return withSecurityHeaders(new NextResponse(null, { status: 403 }))
  }

  return withSecurityHeaders(new NextResponse(null, { status: 204, headers: buildCorsHeaders(origin) }))
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
//
// Guard execution order — each stage is intentionally cheaper than the next
// so expensive work is never done for requests that will be rejected anyway:
//
//  [CORS preflight]          Handled by OPTIONS export above.  OPTIONS runs
//                            before the CSRF check so allowlisted origins can
//                            complete the browser preflight handshake without
//                            being blocked by the origin guard in POST.
//
//  [1] CSRF / origin check   Cheapest POST gate; rejects cross-origin requests
//                            before they can consume rate-limit budget or
//                            trigger JSON parsing.  Fail-closed: when
//                            NEXT_PUBLIC_SITE_URL is absent the expected
//                            origin is derived from request.url — attackers
//                            cannot bypass by omitting the env var.
//
//                            Mechanism: Origin-header CSRF (no separate token).
//                            Browsers always send Origin on cross-origin
//                            requests; its absence means same-origin (allowed);
//                            a mismatch means cross-origin (→ 403, no CORS
//                            headers so attacker JS cannot read the response).
//
//  [2] Content-Type guard    Validates encoding before the body is read.
//                            A 415 here avoids the JSON.parse() call for
//                            non-JSON clients.  CORS headers are added so the
//                            browser can surface the error to the caller.
//
//  [3] Rate limiting         Applied only after origin + content-type pass,
//                            so cross-origin probes cannot burn rate-limit
//                            budget for legitimate users (→ 429).
//
//  [4] JSON parse            Body is read exactly once, after all gate
//                            checks have passed.
//
//  [5] Sanitisation          Control-character stripping on raw string values
//                            before schema validation so the validator always
//                            sees clean input.
//
//  [6] Schema validation     Type, length, and format checks on sanitised
//                            input (→ 422 with per-field detail).
//
export async function POST(request: NextRequest) {
  // [1] CSRF: reject cross-origin requests.
  // Falls back to deriving the expected origin from the request URL so the
  // check is fail-closed even when NEXT_PUBLIC_SITE_URL is not configured.
  const origin = request.headers.get("origin")
  const expectedOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin
  if (origin && origin !== expectedOrigin) {
    // No CORS headers — intentional: attacker JS must not read this body.
    return withSecurityHeaders(clientError("Forbidden", "BAD_REQUEST", 403))
  }

  // [2] Content-Type guard — only accept JSON bodies.
  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return withSecurityHeaders(withCors(clientError("Unsupported Media Type", "BAD_REQUEST", 415), origin))
  }

  // [3] Rate limiting — 5 requests per minute per IP.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  if (isRateLimited(ip)) {
    return withSecurityHeaders(withCors(clientError("Too many requests. Please try again later.", "BAD_REQUEST", 429), origin))
  }

  // [4] Parse body safely to prevent prototype pollution via JSON.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withSecurityHeaders(withCors(clientError("Request body must be valid JSON."), origin))
  }

  // [5] Sanitize string fields before validation to strip control characters.
  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    const raw = body as Record<string, unknown>
    const sanitized: Record<string, unknown> = { ...raw }
    for (const key of ["name", "email", "message"] as const) {
      if (typeof sanitized[key] === "string") {
        sanitized[key] = sanitizeText(sanitized[key] as string)
      }
    }
    body = sanitized
  }

  // [6] Schema validation: type checks, length caps, email format.
  const result = validate(body, ContactSchema)
  if (!result.ok) {
    return withSecurityHeaders(withCors(validationError(result.errors), origin))
  }

  // Safe cast: validate() guarantees these fields are present strings.
  // Required by the mail service call below.
  const { name, email, message } = body as { name: string; email: string; message: string }

  // Intentionally not logging PII (name, email, message content).
  console.log("Contact form submission received", { timestamp: new Date().toISOString() })

  try {
    // ALL mail/notification service calls MUST live inside this try/catch.
    // A service failure (timeout, auth error, API 5xx, SMTP reject) must be
    // caught here and returned via serverError() — never let it propagate as
    // an unhandled exception or leak error details to the client.
    //
    // Load credentials exclusively from environment variables — never hardcode:
    //   Resend:     process.env.RESEND_API_KEY
    //   SendGrid:   process.env.SENDGRID_API_KEY
    //   Nodemailer: process.env.SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
    //
    // TODO: wire up email sending here, e.g.:
    //   await resend.emails.send({ from: 'noreply@yourdomain.com', to: email,
    //                              subject: 'New contact from ' + name, text: message })
    void name
    void email
    void message

    return withSecurityHeaders(withCors(ok({ message: "Message received successfully! We'll get back to you soon." }), origin))
  } catch (err) {
    // Log request context alongside the error so on-call has IP + timing.
    console.error("[contact] mail service error", { ip, timestamp: new Date().toISOString() })
    return withSecurityHeaders(withCors(serverError(err), origin))
  }
}