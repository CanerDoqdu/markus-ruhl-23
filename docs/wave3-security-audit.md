# Wave-3 Security Audit — Findings

**Auditor:** Elijah (BOX security worker)  
**Scope:** Wave-2 changes in CanerDoqdu/markus-ruhl-23  
**Date:** 2026-03-18  
**Branch:** `box/security-wave3-audit`

---

## Findings Table

| Vector | Finding | Status | Evidence |
|---|---|---|---|
| **1 — CSP headers** | `unsafe-inline` in `script-src` | FLAG | `next.config.js:37` — required for Next.js App Router inline hydration scripts. Cannot be removed without implementing nonce-based CSP via a custom middleware, which is a significant architectural change and carries regression risk. All other directives are correct (`frame-ancestors 'none'`, `default-src 'self'`, no `unsafe-eval`, no wildcard sources). |
| **1 — CSP headers** | `unsafe-inline` in `style-src` | FLAG | `next.config.js:38` — required for Tailwind CSS generated styles and Framer Motion / GSAP inline `style` attribute mutations. |
| **1 — CSP headers** | Missing `upgrade-insecure-requests` | FIXED | Added `upgrade-insecure-requests` directive to force all mixed-content subresource loads to HTTPS. Safe addition with no breakage risk. |
| **2 — Redis fail-open** | Health contract transparency | PASS | `app/api/health/route.ts:44-51` — When Redis is unavailable the response body sets `status: "degraded"` and `dependencies.redis: "unavailable"`. The contract is fully transparent; load balancers and monitors can distinguish degraded from healthy. No deceptive contract. Verified by 6 existing tests in `route.test.ts`. |
| **3 — Contact route: X-Forwarded-For spoofing** | Rate-limit bypass via spoofed first-hop IP | FIXED | `app/api/contact/route.ts:175` — Previous code used `split(",")[0]` (leftmost value), which is client-injectable. Attacker could rotate `X-Forwarded-For: <fake-ip>` per request to get a fresh rate-limit bucket on every call. Fixed to use `x-real-ip` first (set by trusted edge, not client-writable), then the **last** value from `X-Forwarded-For` (appended by the nearest trusted proxy). Regression test added. |
| **3 — Contact route: validation** | Input validation completeness | PASS | `lib/api/validation.ts:114-135` — All three required fields (name, email, message) have type, length, and format constraints. Empty/missing fields rejected with 422. |
| **3 — Contact route: sanitization** | HTML/script injection in mailer | PASS | `lib/contact/mail.ts:141-148` — `escapeHtml()` escapes `&`, `<`, `>`, `"`, `'` before all HTML body rendering. `sanitizeText()` in route strips CRLF/control chars before validation. |
| **3 — Contact route: mail timeout** | Serverless function hang | PASS | `app/api/contact/route.ts:23-37` — `withTimeout()` enforces a 10-second cap (configurable via `CONTACT_MAIL_TIMEOUT_MS`). Timeout rejection tested in `route.test.ts`. |
| **4 — Log secret safety: logEvent** | PII / secret redaction in structured logs | PASS | `lib/api/log.ts:24-35` — `REDACTED_KEYS` covers `name`, `email`, `message`, `body`, `password`, `token`, `secret`, `apikey`, `api_key`, `authorization`. All logEvent callers benefit automatically. |
| **4 — Log secret safety: rate-limit direct console calls** | Redis connection-string credentials in error logs | FIXED | `lib/rate-limit.ts:138,149,171` — Three `console.error`/`console.log` calls emitted raw `err.message` directly, bypassing logEvent's redaction. A misconfigured `REDIS_URL` of the form `redis://:password@host:6379` would have appeared verbatim in logs. Added `safeErrorMessage()` helper that strips `scheme://userinfo@` credential segments before logging. |

---

## Risk Summary

### FIXED (confirmed vulnerabilities patched)

1. **X-Forwarded-For rate-limit bypass** (OWASP A07 — Identification and Authentication Failures)  
   - Severity: **High** for a public contact form. An attacker could trivially bypass per-IP rate limiting by cycling spoofed `X-Forwarded-For` header values, enabling spam/DoS of the mail service.  
   - Fix: Use `x-real-ip` → last XFF value → `"unknown"` extraction order.

2. **Redis error message credential exposure in logs** (OWASP A09 — Security Logging and Monitoring Failures)  
   - Severity: **Medium**. If `REDIS_URL` contains a password (common in managed Redis services), connection error messages could embed the full URL including credentials in plain-text log output aggregated to third-party systems.  
   - Fix: `safeErrorMessage()` strips URL credential segments.

3. **Missing `upgrade-insecure-requests` CSP directive** (OWASP A05 — Security Misconfiguration)  
   - Severity: **Low**. Without this directive, browsers may load mixed HTTP subresources on the HTTPS site without a browser-level prompt to upgrade them.  
   - Fix: Added directive to `next.config.js`.

### FLAGGED (cannot fix without significant architectural change)

4. **`unsafe-inline` in `script-src` and `style-src`** (OWASP A03 — Injection / XSS)  
   - Severity: **Medium** (mitigated by origin isolation, CSRF guards, and no untrusted content rendering in the app).  
   - `unsafe-inline` in `script-src` is required by Next.js App Router for inline hydration scripts. The production-grade fix — nonce-based CSP injected via Next.js middleware — requires `middleware.ts` changes and `nonce` prop threading through the document `<head>`. This is a substantial change tracked as a separate task.  
   - `unsafe-inline` in `style-src` is required by Tailwind CSS (class-attribute styles), Framer Motion, and GSAP (inline `style` mutations). Removing it requires migrating to CSS Modules or a different animation approach.

### PASS (no action required)

- Redis fail-open health contract — transparent degraded state, not deceptive  
- Contact route input validation — all fields enforced  
- Contact route HTML/script injection sanitization — `escapeHtml()` in place  
- Contact route mail timeout — 10-second cap enforced  
- logEvent PII/secret redaction — comprehensive REDACTED_KEYS  

---

## Files Changed

| File | Change |
|---|---|
| `next.config.js` | Added `upgrade-insecure-requests` to CSP |
| `app/api/contact/route.ts` | Fixed X-Forwarded-For IP extraction order |
| `lib/rate-limit.ts` | Added `safeErrorMessage()`, applied to all Redis error log calls |
| `app/api/contact/route.test.ts` | Added X-Forwarded-For spoofing regression test |
| `docs/wave3-security-audit.md` | This document |
