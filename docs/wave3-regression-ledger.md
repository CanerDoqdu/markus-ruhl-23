# Wave-3 Regression Ledger (PRs #53-#75)

Audit basis:
- Repository: `CanerDoqdu/markus-ruhl-23`
- Branch state audited: `main` at `ff75d14` (current HEAD at audit time)
- PR metadata source: `gh pr view <n> --json ...`
- Classification codes: `VERIFIED`, `REGRESSED`, `SKIP-UNTESTABLE`, `INSUFFICIENT-CONTEXT`

| PR # | Claim | File:Line | Status | Evidence |
|---|---|---|---|---|
| 53 | Contact route enforces CSRF origin check (`403` on mismatch). | `app/api/contact/route.ts:184-192` | VERIFIED | Origin compared to configured/derived site origin; mismatch returns forbidden response. |
| 53 | Non-JSON payloads are rejected with `415`. | `app/api/contact/route.ts:195-199` | VERIFIED | `Content-Type` guard returns `Unsupported Media Type` with `415`. |
| 53 | Control chars are stripped before validation. | `app/api/contact/route.ts:10-12,216-226` | VERIFIED | `sanitizeText()` removes CR/LF/control bytes; applied prior to schema validation. |
| 53 | Per-IP rate limiting is applied. | `app/api/contact/route.ts:201-205`, `lib/rate-limit.ts:37-39` | VERIFIED | Route calls `isRateLimited(ip)` and limiter defaults to 5 req/window. |
| 53 | PII-safe logging and generic server error shape. | `app/api/contact/route.ts:237-257`, `lib/api/log.ts:24-35,60-67` | VERIFIED | Route logs via `logEvent`; redaction list includes `name/email/message`; server errors use shared generic envelope. |
| 54 | CI includes install/lint/build/test/audit gates. | `.github/workflows/ci.yml:64-85` | VERIFIED | Workflow runs `npm ci`, lint, build, type-check, tests, and audit (`high`). |
| 54 | "test step is TypeScript type-check" (per PR body wording). | `package.json:13-15`, `.github/workflows/ci.yml:74-79` | REGRESSED | Current state separates `type-check` from `test`; `test` runs Vitest, not `tsc`. |
| 55 | Mobile nav ARIA controls/state were added. | `components/layout/Header.tsx:130-133,150-154` | VERIFIED | Toggle has `aria-label/expanded/controls`; menu has labelled dialog semantics. |
| 55 | Timeline uses tab semantics for keyboard/AT. | `components/sections/InteractiveTimeline.tsx:165-179,332-335` | VERIFIED | `tablist`, `tab`, and `tabpanel` roles plus `aria-controls/labelledby` are present. |
| 55 | Reduced-motion guards added to key interactions. | `components/shared/Button.tsx:24-26,43-45,60-61` | VERIFIED | `useReducedMotion` gates hover/tap animation variants. |
| 56 | Baseline contact API tests cover happy path + invalid input + malformed body + RL behavior. | `app/api/contact/route.test.ts:91,104,121,718,727` | VERIFIED | Test file contains all baseline paths and expanded follow-on coverage. |
| 57 | Mail service call sits inside try/catch error boundary. | `app/api/contact/route.ts:240-257` | VERIFIED | Mail send + timeout are in guarded block; failures mapped to `serverError()`. |
| 58 | Rate limiter moved to Redis-capable module with fallback. | `app/api/contact/route.ts:6,201-205`, `lib/rate-limit.ts:121-132,154-173` | VERIFIED | Route imports shared limiter; module supports Redis and in-memory fallback. |
| 58 | Sliding-window algorithm is used for Redis path. | `lib/rate-limit.ts:81-104,163-165` | VERIFIED | Lua script prunes (`ZREMRANGEBYSCORE`) + counts + inserts atomically. |
| 59 | CSRF/CORS middleware-order rationale documented in route. | `app/api/contact/route.ts:101-169` | VERIFIED | Ordered [1]-[6] guard comments retained with rationale and threat model notes. |
| 59 | CORS/CSRF behavior has route-level regression tests. | `app/api/contact/route.test.ts:625,660` | VERIFIED | Tests assert CSRF 403 headers policy and OPTIONS preflight security headers. |
| 60 | Mail timeout/rejection/network failure path coverage exists. | `app/api/contact/route.test.ts:727,749,764` | VERIFIED | Deterministic failure tests present for timeout, rejection, and DNS/network errors. |
| 61 | Timeout guard exists around mail dispatch. | `app/api/contact/route.ts:14-21,23-37,251` | VERIFIED | `withTimeout(sendContactMail, getMailSendTimeoutMs())` is enforced. |
| 62 | Mail timeout failure coverage exists (500 + safe error contract). | `app/api/contact/route.test.ts:727-747` | VERIFIED | Timeout test asserts HTTP 500 and non-leaky generic response behavior. |
| 63 | DNS/network mail failure path is covered. | `app/api/contact/route.test.ts:764-791` | VERIFIED | Explicit DNS/network failure test validates stable 500 behavior. |
| 64 | Wave4 audit docs were delivered (a11y/perf/checklist). | `docs/accessibility-audit-wave4.md:1`, `docs/performance-baseline.md:1`, `docs/regression-checklist.md:1` | VERIFIED | All three documentation artifacts are present in current main. |
| 65 | CI audit gate blocks on high severity vulnerabilities. | `.github/workflows/ci.yml:80-85` | VERIFIED | Audit step uses `npm audit --audit-level=high`. |
| 66 | Dead webpack shader loader config removed. | `next.config.js:1-66` | VERIFIED | No webpack/shader loader customization remains in current config. |
| 67 | Health response is `{ status, redis, version, timestamp }` (flat `redis` field). | `app/api/health/route.ts:47-50`, `docs/api-contracts.md:33-35` | REGRESSED | Current contract is `dependencies.redis`, not top-level `redis`. |
| 67 | Contact route has structured, non-PII logging. | `app/api/contact/route.ts:179,190,197,203,231,253,256`, `lib/api/log.ts:24-35` | VERIFIED | Route logs event-typed JSON via redacting helper; sensitive keys are masked. |
| 67 | Redis limiter is fail-open with explicit observability signal. | `lib/rate-limit.ts:170-173` | VERIFIED | Redis errors emit `rate_limit_redis_error` and fallback to in-memory limiter. |
| 68 | Observability + fail-open claims in PR body (duplicate of #67). | `N/A` | INSUFFICIENT-CONTEXT | PR #68 is not merged (`mergedAt = null`), so claims are not authoritative for main. |
| 69 | Reduced-motion behavior propagated through shared motion surfaces. | `components/layout/Header.tsx:18,155-159`, `components/sections/InteractiveTimeline.tsx:76,132-133,338-339` | VERIFIED | `useReducedMotion` is wired across key motion-heavy components. |
| 69 | "Responsive breakpoints fixed across all impacted surfaces." | `N/A (runtime/layout claim)` | SKIP-UNTESTABLE | Requires viewport-by-viewport runtime visual verification; static source alone cannot prove all breakpoints. |
| 70 | Skip-link and `#main-content` path added for keyboard bypass. | `app/(site)/layout.tsx:18-20`, `app/(site)/page.tsx:66`, `app/globals.css:23-41` | VERIFIED | Skip-link exists, target exists, and focus-visible style reveals link on keyboard focus. |
| 70 | Global visible focus styling for interactive controls. | `app/globals.css:43-51` | VERIFIED | Shared `:focus-visible` outline rules are applied to links/buttons/inputs/etc. |
| 70 | Lighthouse before/after performance claims in PR body. | `N/A (external run data)` | SKIP-UNTESTABLE | Claimed scores require reproducing Lighthouse runs in equivalent runtime env. |
| 71 | App/global error boundaries and branded not-found page were added. | `app/error.tsx:6-70`, `app/global-error.tsx:10-81`, `app/(site)/not-found.tsx:3-43` | VERIFIED | Error and 404 surfaces exist and provide fallback UX actions. |
| 71 | Mail transport implementation includes Resend + SMTP + fallback. | `lib/contact/mail.ts:26-68,71-117,120-138` | VERIFIED | Multi-transport send path implemented with fallback logging mode. |
| 71 | Artificial loading delay removed from homepage. | `app/(site)/page.tsx:42-50` | VERIFIED | Loading completion now binds to actual document load; comment explicitly notes no artificial delay. |
| 71 | Contact form accessibility hardening (aria-invalid/aria-live/errors). | `components/sections/contact/ContactForm.tsx:170-172,201-203,231-236,294-315` | VERIFIED | Per-field ARIA + live-region status/error semantics are present. |
| 71 | Header focus-trap/escape/route-change close behavior. | `components/layout/Header.tsx:41-57,59-76,79-84` | VERIFIED | Route-change close, Escape handler, focus trap loop, and autofocus are implemented. |
| 71 | Security headers and restricted image domains in Next config. | `next.config.js:6-12,34-58` | VERIFIED | CSP and standard security headers present; image hosts are explicit allowlist domains. |
| 71 | JSON-LD Person structured data for SEO. | `app/layout.tsx:78-91,101-104` | VERIFIED | Root layout emits Person JSON-LD via `application/ld+json` script. |
| 72 | Health fail-open regression test and payload contract test added. | `app/api/health/route.test.ts:33-52,54-69,71-89` | VERIFIED | Tests assert 200 degraded behavior, schema keys, and no internal error leak. |
| 73 | Health contract hardened to `dependencies.redis` wrapper. | `app/api/health/route.ts:47-50`, `docs/api-contracts.md:33-35` | VERIFIED | Route + docs align on wrapped dependency schema. |
| 73 | Shared `logEvent` helper used for structured logs. | `lib/api/log.ts:60-67`, `app/api/contact/route.ts:4,179`, `app/api/health/route.ts:3,54-62` | VERIFIED | Both routes use the centralized logger with standard fields. |
| 74 | CI hardening includes least-privilege token and timeout cap. | `.github/workflows/ci.yml:23-24,31` | VERIFIED | `permissions: contents: read` and `timeout-minutes: 15` are set. |
| 74 | CSP and baseline security headers are configured globally. | `next.config.js:34-58` | VERIFIED | CSP + `X-Content-Type-Options`, `X-Frame-Options`, HSTS, Referrer, Permissions headers are set. |
| 74 | Env completeness updated for contact mail timeout/address vars. | `.env.example:3-18` | VERIFIED | `CONTACT_MAIL_TO`, `CONTACT_MAIL_FROM`, `CONTACT_MAIL_TIMEOUT_MS` present with docs. |
| 74 | Node engine pinned to match CI baseline. | `package.json:5-7`, `.github/workflows/ci.yml:42` | VERIFIED | `engines.node >=20` and CI setup uses node `20`. |
| 74 | Regression checklist contains operational runbooks sections. | `docs/regression-checklist.md:51,85,162,189,235` | VERIFIED | Env/runbook/rotation/observability/deployment sections are present. |
| 75 | Mail fallback logging no longer leaks name/email values. | `lib/contact/mail.ts:128-136` | VERIFIED | Fallback payload redacts `subject/replyTo/name`; logs message length only. |
| 75 | Contact message max length docs aligned to 2000 chars. | `docs/api-contracts.md:121,131` | VERIFIED | Request schema and validation table both specify `message` max `2000`. |
| 75 | checkRedisHealth failure-matrix tests added. | `lib/rate-limit.test.ts:255-412` | VERIFIED | Tests cover ECONNREFUSED, ETIMEDOUT, auth failures, healthy, and no-env behavior. |
| 75 | Contact regression tests expanded for XSS/control-char/null-byte/redaction paths. | `app/api/contact/route.test.ts:793,809,825,846,879` | VERIFIED | Expanded negative-path/security tests exist with deterministic assertions. |

## Inter-PR Drift Check (#71/#72 vs #67-#69)

- **Overlap found:** `#71` and `#69` both touched `components/layout/Header.tsx`, `components/sections/contact/ContactForm.tsx`, and `app/(site)/page.tsx`.
- **Final-state union verified:** current files simultaneously contain wave4 responsive/motion patterns (`motion-reduce`/`useReducedMotion`) and wave-2 hardening semantics (focus trap, ARIA validation/live-region handling, no artificial load delay).
- **#72 overlap result:** `#72` only touched `app/api/health/route.test.ts` and does **not** overlap file paths from `#67-#69`; no revert collision detected.

## Key-file Deep Validation Summary

- `app/api/contact/route.ts`: input validation, rate-limit hook, CSRF/origin guard, mail timeout enforcement, and redacted structured logging are all present.
- `app/api/health/route.ts`: fail-open 200 contract with stable schema (`status`, `dependencies.redis`, `version`, `timestamp`) is present.
- `next.config.js`: CSP and baseline security headers are configured globally for `/(.*)`.
- `.github/workflows/ci.yml`: lint/build/type-check/test/audit gates are present; no `continue-on-error` bypass path observed.

## Test Run Evidence (current main state)

- `npm test` (before install) -> **failed** (`vitest` not found in fresh worktree).
- `npm ci` -> **completed** successfully.
- `npx vitest run app/api/health/route.test.ts --reporter=verbose` -> **PASS** (`6/6`).
- `npx vitest run app/api/contact/route.test.ts --reporter=verbose` -> **PASS** (`44/44`).
- `npx vitest run lib/rate-limit.test.ts --reporter=verbose` -> **PASS** (`18/18`).

Targeted regression surfaces total: **68/68 tests passing**.
