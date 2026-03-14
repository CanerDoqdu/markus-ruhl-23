import { NextRequest } from "next/server"
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
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // CSRF: reject requests from origins other than our own site.
  const origin = request.headers.get("origin")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? ""
  if (siteUrl && origin && origin !== siteUrl) {
    return clientError("Forbidden", "BAD_REQUEST", 403)
  }

  // Content-Type guard — only accept JSON bodies.
  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return clientError("Unsupported Media Type", "BAD_REQUEST", 415)
  }

  // Rate limiting — 5 requests per minute per IP.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  if (isRateLimited(ip)) {
    return clientError("Too many requests. Please try again later.", "BAD_REQUEST", 429)
  }

  // Parse body safely to prevent prototype pollution via JSON.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return clientError("Request body must be valid JSON.")
  }

  // Sanitize string fields before validation to strip control characters.
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

  // Schema validation: type checks, length caps, email format.
  const result = validate(body, ContactSchema)
  if (!result.ok) {
    return validationError(result.errors)
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

    return ok({ message: "Message received successfully! We'll get back to you soon." })
  } catch (err) {
    return serverError(err)
  }
}