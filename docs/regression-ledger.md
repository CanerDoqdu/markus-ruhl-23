# Wave-3 Regression Audit Ledger (PRs #53–#75)

Baseline audited: `main@693a3a5`  
Audit date: `2026-03-18`  
Method: GitHub PR metadata (`gh api`) + code/test verification against current tree + targeted test execution (`68/68` on contact/health/rate-limit suites).

## Access + evidence notes

- GitHub API access: available (`gh auth status` OK).
- PR corpus fetched: `#53` through `#75` inclusive (`23` PRs).
- Evidence sources include PR body/commit claims plus current files:
  `app/api/contact/route.ts`, `app/api/health/route.ts`, `next.config.js`, `.github/workflows/ci.yml`,
  `app/api/contact/route.test.ts`, `app/api/health/route.test.ts`, `lib/rate-limit.ts`, `lib/contact/mail.ts`,
  `docs/api-contracts.md`, `docs/regression-checklist.md`.

## Ledger

| PR # | Claim | File/Location | Status | Evidence/Note |
|---|---|---|---|---|
| 53 | Contact API enforces rate limiting (5 req/min/IP). | `app/api/contact/route.ts:201-205`, `app/api/contact/route.test.ts:214-224` | VERIFIED | `isRateLimited(ip)` gate returns 429; test confirms limit reached. |
| 53 | CSRF Origin mismatch rejected with 403. | `app/api/contact/route.ts:184-192`, tests `307-349` | VERIFIED | Origin compared against expected origin; mismatches return 403. |
| 53 | CSRF is fail-closed even without `NEXT_PUBLIC_SITE_URL`. | `app/api/contact/route.ts:185-187` | VERIFIED | Fallback derives expected origin from `request.url`. |
| 53 | Non-JSON content type rejected with 415. | `app/api/contact/route.ts:195-199`, test `181-191` | VERIFIED | Content-type guard emits 415 BAD_REQUEST envelope. |
| 53 | Control-char sanitization runs before validation. | `app/api/contact/route.ts:216-229`, tests `825-866` | VERIFIED | Sanitization mutates body before `validate(...)`. |
| 53 | Error responses are generic and do not leak stack traces. | `app/api/contact/route.ts:255-257`, tests `245-257`, `403-427` | VERIFIED | `serverError(err)` used; tests assert no stack/paths leaked. |
| 54 | CI workflow runs install, lint, build, type-check/test, audit on push/PR. | `.github/workflows/ci.yml:16-67` | VERIFIED | Pipeline present and active for push/main + pull_request. |
| 54 | `npm test` is the TypeScript type-check step. | `.github/workflows/ci.yml:55-60`, `package.json:13-15` | REGRESSED | Current contract split: `type-check` is `tsc --noEmit`; `test` runs Vitest. Superseded by later CI hardening. |
| 54 | Branch protection requires CI check. | GitHub branch protection settings | INSUFFICIENT-CONTEXT | Repo policy settings are not present in git tree; cannot verify from code. |
| 55 | Mobile menu has ARIA state/controls. | `components/layout/Header.tsx:130-133,150-154` | VERIFIED | `aria-label`, `aria-expanded`, `aria-controls`, dialog labeling present. |
| 55 | Timeline exposes tablist/tab/tabpanel semantics. | `components/sections/InteractiveTimeline.tsx:165,175,333` | VERIFIED | `role="tablist"`, `role="tab"`, `role="tabpanel"` present. |
| 55 | Reduced-motion guards applied to key transitions. | `Header.tsx:155-159`, `Reveal.tsx:39-60` | VERIFIED | Motion paths branch on `useReducedMotion` / `motion-reduce`. |
| 55 | Hero fallback image optimized for LCP (priority + sizes). | `components/sections/hero/PremiumHero.tsx:319-320` | VERIFIED | Hero image marked `priority` with explicit `sizes`. |
| 55 | Footer contrast microcopy improved. | `components/layout/Footer.tsx` | INSUFFICIENT-CONTEXT | Current classes are accessible tokens, but claim is relative improvement vs prior baseline. |
| 56 | Contact API baseline tests exist (happy/invalid/malformed/rate-limit). | `app/api/contact/route.test.ts:90-224` | VERIFIED | Baseline scenarios are present and passing. |
| 57 | Mail send boundary is inside try/catch (integration safety). | `app/api/contact/route.ts:240-257` | VERIFIED | `sendContactMail` wrapped by try/catch and timeout wrapper. |
| 57 | Mail failure does not change happy-path 200 behavior. | `route.ts:253-254`, test `718-725` | VERIFIED | Success path still returns 200 + success payload. |
| 58 | Rate limiter extracted to `lib/rate-limit.ts` and route imports shared helper. | `app/api/contact/route.ts:6,201-205`, `lib/rate-limit.ts` | VERIFIED | Route uses imported async limiter; inline map removed from route. |
| 58 | Redis-enabled distributed limiter with graceful fail-open fallback. | `lib/rate-limit.ts:121-173` | VERIFIED | Redis path degrades to in-memory on connect/eval errors. |
| 58 | Limiter algorithm is INCR+PEXPIRE sliding-window. | `lib/rate-limit.ts:81-104,159-165` | REGRESSED | Current implementation is sorted-set sliding-window, not INCR+PEXPIRE; intentional later upgrade. |
| 59 | Contact guard execution order is documented [1]-[6]. | `app/api/contact/route.ts:130-169` | VERIFIED | Numbered comment block documents order and rationale. |
| 59 | CSRF/CORS behavioral tests cover allow/deny and no wildcard leakage. | `app/api/contact/route.test.ts:277-392,443-590` | VERIFIED | Tests assert allowlisted origin echo, disallowed origin no ACAO, OPTIONS behavior. |
| 59 | Defense-in-depth response headers are enforced on all paths. | `route.ts:84-95`, tests `614-678` | VERIFIED | `withSecurityHeaders` stamped on OPTIONS and POST exits. |
| 60 | Deterministic mail failure-path coverage (timeout/reject/network). | `app/api/contact/route.test.ts:727-776` | VERIFIED | Three explicit negative-path tests in suite. |
| 61 | SMTP timeout/rejection/network failures return safe generic 500 contract. | `route.test.ts:727-776`, `route.ts:23-37,251-257` | VERIFIED | Tests assert `INTERNAL_ERROR` and no sensitive leakage. |
| 62 | Timeout failure coverage verifies no timeout internals leaked. | `route.test.ts:727-747` | VERIFIED | Assertions block raw timeout message/stack/path leakage. |
| 63 | DNS failure path (`ENOTFOUND`) covered and stabilized. | `route.test.ts:764-776` | VERIFIED | Explicit `ENOTFOUND` scenario asserted as safe 500. |
| 64 | Wave4 QA docs added (a11y/perf/checklist). | `docs/accessibility-audit-wave4.md`, `docs/performance-baseline.md`, `docs/regression-checklist.md` | VERIFIED | Documentation artifacts exist in current main. |
| 65 | CI audit threshold blocks high+critical vulnerabilities. | `.github/workflows/ci.yml:61-66` | VERIFIED | Audit step uses `npm audit --audit-level=high`. |
| 66 | Dead shader webpack loader removed from Next config. | `next.config.js` | VERIFIED | No custom webpack shader loader rules present. |
| 67 | `/api/health` exists and always returns 200 fail-open. | `app/api/health/route.ts:8-24,64` | VERIFIED | Contract comment and implementation return 200 in both states. |
| 67 | Health payload shape is `{status, redis, version, timestamp}` (flat redis). | `app/api/health/route.ts:47-52` | REGRESSED | Current shape uses `dependencies.redis`; superseded by PR #73 hardening. |
| 67 | Contact route emits structured observability events. | `app/api/contact/route.ts:179,190,197,203,212,231,253,256` | VERIFIED | `logEvent(...)` used across all key branches. |
| 67 | Redis errors are observable via `rate_limit_redis_error`. | `lib/rate-limit.ts:171-172` | VERIFIED | Fail-open catch logs structured degradation event. |
| 68 | Health status vocabulary is `ok`/`degraded` and redis is `ok`/`unavailable`. | `app/api/health/route.ts:44-49` | VERIFIED | Internal health is normalized to public contract values. |
| 69 | Shared motion primitives honor reduced-motion preference. | `components/motion/Reveal.tsx:39-60`, `components/layout/Header.tsx:155-159` | VERIFIED | Motion transitions short-circuit when reduced-motion is enabled. |
| 69 | Responsive breakpoint fixes across many pages/components. | Multiple UI files in PR diff | INSUFFICIENT-CONTEXT | Requires visual/runtime cross-device rendering comparison; not fully provable via static diff alone. |
| 70 | Skip link added and wired to `#main-content`. | `app/(site)/layout.tsx:18-20`, `app/(site)/page.tsx:66` | VERIFIED | Skip link exists and points to present main-content target. |
| 70 | Keyboard-visible focus and WCAG contrast remediations applied. | `app/globals.css` + component class updates | INSUFFICIENT-CONTEXT | Needs rendered contrast/focus audit to prove all WCAG deltas. |
| 71 | App and global error boundaries implemented. | `app/error.tsx`, `app/global-error.tsx` | VERIFIED | Both boundary components exist with retry/home actions. |
| 71 | Branded 404 page added. | `app/(site)/not-found.tsx` | VERIFIED | Not-found page exists and is wired in site app segment. |
| 71 | Mail transport implemented (Resend, SMTP, fallback). | `lib/contact/mail.ts:26-68,71-117,120-137` | VERIFIED | Provider priority path implemented with fallback logging. |
| 71 | Artificial homepage loading delay removed (LCP hardening). | `app/(site)/page.tsx:42-51` | VERIFIED | Uses actual load event; no fixed timeout delay path. |
| 71 | ContactForm accessibility hardening (`aria-invalid`, `aria-live`, etc.). | `components/sections/contact/ContactForm.tsx:170-233,294-314` | VERIFIED | ARIA error/status semantics are present. |
| 71 | Header focus trap + Escape + route-change close + scroll lock. | `components/layout/Header.tsx:29-57,60-84` | VERIFIED | All claimed interaction guards are implemented. |
| 71 | Security headers and restricted image domains in Next config. | `next.config.js:4-12,34-58` | VERIFIED | Remote patterns restricted; security headers include CSP/HSTS/etc. |
| 71 | JSON-LD Person schema and env-based sitemap base URL. | `app/layout.tsx:78-104`, `app/sitemap.ts:4` | VERIFIED | Structured data script and env-derived sitemap base URL present. |
| 72 | Health fail-open regression tests added. | `app/api/health/route.test.ts:33-89` | VERIFIED | Degraded/throw paths are asserted with HTTP 200 contract. |
| 73 | Health contract hardened to stable schema with `dependencies.redis`. | `app/api/health/route.ts:11-17,47-52` | VERIFIED | Current payload matches hardened contract exactly. |
| 73 | Shared `logEvent` with redaction normalizes route logging. | `lib/api/log.ts`, usage in routes | VERIFIED | Contact + health use shared structured logger contract. |
| 73 | Docs codify API contracts and change policy. | `docs/api-contracts.md` | VERIFIED | Contract doc exists with status codes, shapes, and policy. |
| 74 | CI least-privilege permissions and timeout guard added. | `.github/workflows/ci.yml:23-31` | VERIFIED | `permissions: contents: read`, `timeout-minutes: 15` present. |
| 74 | CSP header introduced in Next config. | `next.config.js:34-49` | VERIFIED | CSP is set on all routes via `headers()` block. |
| 74 | Env completeness (`CONTACT_MAIL_TO/FROM/TIMEOUT`) documented. | `.env.example:12-17` | VERIFIED | All referenced variables are present in example file. |
| 74 | Node engine pinned to align with CI node version. | `package.json:5-7`, `.github/workflows/ci.yml:42` | VERIFIED | `engines.node >=20` aligns with CI `node-version: '20'`. |
| 74 | Ops runbook sections added to regression checklist. | `docs/regression-checklist.md:51-221` | VERIFIED | Env/runbook/rotation/alerting/deploy sections present. |
| 75 | Mail fallback no longer logs PII (name/email/subject). | `lib/contact/mail.ts:128-136`, test `route.test.ts:878-914` | VERIFIED | Fallback emits `[REDACTED]`; test asserts no PII leakage. |
| 75 | Docs/code mismatch fixed: message max length = 2000. | `docs/api-contracts.md:121,131` | VERIFIED | Contract now states `10–2000` and matches validation/tests. |
| 75 | `checkRedisHealth` edge-case tests added (ECONNREFUSED/ETIMEDOUT/auth/etc.). | `lib/rate-limit.test.ts:245+` | VERIFIED | Health failure mode coverage is present and passing. |
| 75 | Contact/health contract tests expanded for wave-2 closure. | `app/api/contact/route.test.ts`, `app/api/health/route.test.ts` | VERIFIED | Additional sanitization, redaction, version/timestamp cases present. |

## Special regression-risk checks

| Risk check | Result | Evidence |
|---|---|---|
| Did PR #71 conflict with/revert PRs #67–#70? | NO material regression found on API contracts. | Current `contact` and `health` contracts still match hardened wave-1/wave-2 behavior; #71 changes concentrated in frontend/error/mail/security config. |
| Did PR #73 or #75 change `contact`/`health` behavior vs earlier intent? | YES, intentional hardening changes; no adverse regression detected. | #73 intentionally changed health schema to `dependencies.redis`; #75 fixed mail-fallback PII leak and strengthened tests/docs alignment. |
| Any merge-conflict drift introducing unintended behavior? | None confirmed in audited surfaces. | Merge-related claims (e.g., preserving security/CORS and redis-limiter integration) are consistent with current route/test behavior and passing test evidence. |

## Test evidence executed during audit

Command:

```bash
npm test -- app/api/contact/route.test.ts app/api/health/route.test.ts lib/rate-limit.test.ts
```

Result: `3` files, `68` tests, all passing.

Build check:

```bash
npm run build
```

Result: production build succeeded on audited tree.

