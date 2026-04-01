/**
 * Structured logging utility for API routes.
 *
 * All log entries are emitted as single-line JSON to stdout via console.log.
 * This ensures log-aggregation systems (Datadog, CloudWatch, Loki) can parse
 * entries without multi-line reassembly.
 *
 * Required fields on every entry:
 *   event      — machine-readable event identifier (snake_case)
 *   route      — request path (e.g., '/api/contact')
 *   method     — HTTP method (e.g., 'POST')
 *   status     — HTTP status code of the response being returned
 *   durationMs — elapsed time from request start to response in ms
 *   timestamp  — ISO-8601 UTC (always appended last)
 *
 * Sensitive fields are automatically redacted so logs never contain PII,
 * secrets, or credentials. Extend REDACTED_KEYS as new sensitive fields are added.
 */

/**
 * Keys whose values must never appear in log output.
 * Matched case-insensitively against all entry keys.
 */
const REDACTED_KEYS = new Set([
  "name",
  "email",
  "message",
  "body",
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
])

export interface LogEntry {
  /** Machine-readable event identifier (snake_case). */
  event: string
  /** Request path, e.g. '/api/contact'. */
  route: string
  /** HTTP method, e.g. 'POST'. */
  method: string
  /** HTTP status code being returned in the response. */
  status: number
  /** Elapsed milliseconds from request start to this log point. */
  durationMs: number
  /** Any additional context fields — sensitive keys are auto-redacted. */
  [key: string]: unknown
}

/**
 * Emit a structured JSON log entry.
 *
 * - Redacts any key present in REDACTED_KEYS (case-insensitive).
 * - Appends `timestamp` as the final field so it is easy to grep.
 * - Never throws; if serialization fails the error is silently swallowed to
 *   avoid disrupting the request lifecycle.
 */
export function logEvent(entry: LogEntry): void {
  try {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(entry)) {
      out[k] = REDACTED_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : v
    }
    out.timestamp = new Date().toISOString()
    console.log(JSON.stringify(out))
  } catch {
    // Intentional: logging must never crash the request handler.
  }
}
