# API Contracts — Wave-1 Stable Surface

> **Stability:** This document is the authoritative contract for the health and
> contact endpoints as of wave-1 (2026-03-17). Samuel uses it to write
> regression tests; Noah uses it to define CI gate definitions. Changes to
> response shapes or log schemas require a PR that updates this file.

---

## `GET /api/health`

### Purpose

Returns service observability status. Used by load-balancers, uptime monitors,
and deployment pipelines to determine whether the service is in a healthy or
degraded state.

### Request

```
GET /api/health
```

No request body, headers, or authentication required.

### Response Schema (stable)

HTTP status is always **200**. Callers MUST read the body `status` field.

```jsonc
{
  "status": "ok" | "degraded",
  "dependencies": {
    "redis": "ok" | "unavailable"
  },
  "version": "string",      // npm package version or "unknown"
  "timestamp": "ISO-8601"   // UTC, e.g. "2026-03-17T18:00:00.000Z"
}
```

#### Field Semantics

| Field | Type | Values | Description |
|---|---|---|---|
| `status` | string | `ok` \| `degraded` | Overall service health. `ok` = all dependencies healthy. `degraded` = one or more non-critical dependencies unavailable but service is still accepting requests. |
| `dependencies.redis` | string | `ok` \| `unavailable` | Redis connectivity state. `ok` = ping succeeded. `unavailable` = client absent, connection refused, or ping timed out. |
| `version` | string | semver or `"unknown"` | npm package version from `process.env.npm_package_version`. |
| `timestamp` | string | ISO-8601 UTC | Time the response was generated. |

#### Fail-Open Behavior

The health endpoint is **fail-open** on Redis:

- When Redis is unreachable, `dependencies.redis` = `"unavailable"` and `status` = `"degraded"`.
- HTTP 200 is returned in **both** `ok` and `degraded` states.
- A `degraded` response MUST NOT be treated as a service outage by callers — the contact route continues operating using the in-memory rate-limiter fallback.
- Callers that want to alert on Redis degradation should check `dependencies.redis === "unavailable"`.

#### Example Responses

**Redis healthy:**
```json
{
  "status": "ok",
  "dependencies": { "redis": "ok" },
  "version": "1.0.0",
  "timestamp": "2026-03-17T18:00:00.000Z"
}
```

**Redis unavailable (fail-open):**
```json
{
  "status": "degraded",
  "dependencies": { "redis": "unavailable" },
  "version": "1.0.0",
  "timestamp": "2026-03-17T18:00:01.412Z"
}
```

### Structured Log Entry

Every health check emits one structured JSON log line:

```jsonc
{
  "event": "health_check",
  "route": "/api/health",
  "method": "GET",
  "status": 200,
  "durationMs": 4,
  "serviceStatus": "ok" | "degraded",
  "redisStatus": "ok" | "unavailable",
  "timestamp": "ISO-8601"
}
```

---

## `POST /api/contact`

### Purpose

Accepts a contact form submission, validates and sanitizes input, enforces rate
limiting, and dispatches an email via the configured mail provider.

### Request

```
POST /api/contact
Content-Type: application/json
Origin: <NEXT_PUBLIC_SITE_URL>
```

**Body:**

```jsonc
{
  "name": "string",     // 2–100 characters, required
  "email": "string",    // valid RFC-5322 email, required
  "message": "string"   // 10–2000 characters, required
}
```

### Validation Rules

| Field | Min | Max | Format |
|---|---|---|---|
| `name` | 2 chars | 100 chars | Any string (control characters stripped) |
| `email` | — | — | Valid email address |
| `message` | 10 chars | 2000 chars | Any string (control characters stripped) |

Input is sanitized (control characters removed) **before** schema validation
to prevent email-header injection attacks (CRLF sequences).

### Guard Execution Order

Requests are rejected at the cheapest layer first:

1. **CSRF / Origin check** — `Origin` header must match `NEXT_PUBLIC_SITE_URL` (or request origin). Mismatch → **403** (no CORS headers, intentional).
2. **Content-Type guard** — must be `application/json`. Otherwise → **415**.
3. **Rate limiting** — 5 requests per IP per minute (sliding window via Redis; falls back to in-memory on Redis failure). Exceeded → **429**.
4. **JSON parse** — malformed body → **400**.
5. **Sanitization** — strips `\r\n\t` and other control characters from string fields.
6. **Schema validation** — type/length/format checks → **422** with per-field detail.
7. **Mail dispatch** — `sendContactMail()` wrapped in a 10-second timeout.

### Response Shapes

All responses use the shared envelope from `lib/api/response.ts`.

**Success (200):**
```json
{
  "success": true,
  "data": { "message": "Message received successfully! We'll get back to you soon." }
}
```

**Validation failure (422):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "fields": { "email": "Invalid email address." }
  }
}
```

**Rate limited (429):**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Too many requests. Please try again later."
  }
}
```

**CSRF rejection (403):**
```json
{
  "success": false,
  "error": { "code": "BAD_REQUEST", "message": "Forbidden" }
}
```

**Server error (500):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

> **Note:** 500 responses never expose stack traces, SMTP credentials, or
> internal error details. Raw error messages are logged server-side only.

### Rate-Limit Behavior

- **Algorithm:** Sliding window (Redis-backed when `REDIS_URL` or `REDIS_HOST` is set).
- **Window:** 60 seconds (configurable via `CONTACT_RATE_LIMIT_WINDOW_MS`).
- **Limit:** 5 requests per IP per window (configurable via `CONTACT_RATE_LIMIT_MAX`).
- **Fail-open:** When Redis is unavailable, the limiter falls back to an in-memory fixed-window counter. Service continues; cross-instance enforcement is best-effort only.

### Structured Log Entries

All log entries include the minimum required fields: `event`, `route`, `method`,
`status`, `durationMs`, `timestamp`. **`name`, `email`, `message`, and body
content are never logged** — they are in the redaction list.

| Event | Emitted When | `status` |
|---|---|---|
| `contact_request` | On every inbound POST (before guards) | `0` |
| `csrf_rejected` | Origin check fails | `403` |
| `content_type_rejected` | Non-JSON content-type | `415` |
| `rate_limit_hit` | Rate limit exceeded | `429` |
| `parse_error` | Malformed JSON body | `400` |
| `validation_failed` | Schema validation errors | `422` |
| `mail_success` | Mail dispatched successfully | `200` |
| `mail_failure` | Mail dispatch threw or timed out | `500` |

**Example log entries:**

```jsonc
// Inbound request (status 0 = not yet determined)
{"event":"contact_request","route":"/api/contact","method":"POST","status":0,"durationMs":0,"ip":"1.2.3.4","timestamp":"2026-03-17T18:00:00.000Z"}

// Successful submission
{"event":"mail_success","route":"/api/contact","method":"POST","status":200,"durationMs":142,"ip":"1.2.3.4","timestamp":"2026-03-17T18:00:00.142Z"}

// Mail dispatch failure (error field present; no PII in message)
{"event":"mail_failure","route":"/api/contact","method":"POST","status":500,"durationMs":10012,"ip":"1.2.3.4","error":"Mail service timeout","timestamp":"..."}
```

### Redacted Fields

The following fields are automatically redacted by `lib/api/log.ts` and will
never appear with real values in any log output:

`name`, `email`, `message`, `body`, `password`, `token`, `secret`, `apiKey`, `api_key`, `authorization`

---

## Shared Utilities

### `lib/api/log.ts` — `logEvent(entry: LogEntry)`

Emits a single-line JSON entry to stdout. Key guarantees:
- `timestamp` is always appended as the last field.
- Sensitive keys (see redaction list above) are replaced with `"[REDACTED]"`.
- Never throws — logging errors are silently swallowed so they cannot disrupt the request lifecycle.

### `lib/api/response.ts` — Response helpers

All routes use these builders for consistent response envelopes:

| Helper | Status | Shape |
|---|---|---|
| `ok(data?)` | 200 | `{ success: true, data? }` |
| `validationError(errors)` | 422 | `{ success: false, error: { code: "VALIDATION_ERROR", fields } }` |
| `clientError(msg, code?, status?)` | 400 (default) | `{ success: false, error: { code, message } }` |
| `serverError(err?)` | 500 | `{ success: false, error: { code: "INTERNAL_ERROR", message } }` |

---

## Contract Change Policy

1. Any change to response field names, types, or HTTP status codes requires a
   PR that updates this file **in the same commit**.
2. Adding new fields to the health `dependencies` object is backwards-compatible
   and does not require a version bump.
3. Removing or renaming existing fields (including `status`, `dependencies.redis`)
   is a breaking change and requires a deprecation period.
4. Log schema changes (new/renamed keys) must be reflected in the table above.
