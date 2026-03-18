# Pre-Deployment Regression Checklist (Wave 4 → Wave 2 Ops Hardening)

Use this checklist before release to catch UX/performance regressions quickly.

## 1) Responsive Breakpoints

- [ ] Validate layouts at `320`, `375`, `768`, `1024`, `1280`, and `1440+` widths.
- [ ] Confirm no horizontal overflow on all main pages.
- [ ] Verify navigation behavior on desktop vs mobile menu.
- [ ] Confirm interactive timeline behavior on non-mobile viewports.

## 2) Accessibility (WCAG 2.1 AA)

- [ ] Run axe scan on `/`, `/#timeline`, `/contact`, `/training`, `/media`, `/legacy`.
- [ ] Validate color contrast for body text (>= 4.5:1) and large text (>= 3:1).
- [ ] Verify keyboard-only navigation (tab order, visible focus, no trapped focus).
- [ ] Confirm presence/operation of skip navigation path.
- [ ] Check contact form labels, error announcements, and status announcements with screen reader.
- [ ] Validate reduced-motion behavior with `prefers-reduced-motion: reduce`.

## 3) Contact Form Flow

- [ ] Happy path: valid form submits successfully with confirmation feedback.
- [ ] Validation path: invalid/missing fields show user-facing validation errors.
- [ ] Server error path: mail/provider failure returns safe generic error (no internals leaked).
- [ ] Keyboard-only form completion works from first field to submit and feedback.
- [ ] API response contracts hold for `200`, `400`, `403`, `415`, `422`, `429`, `500`.

## 4) Animation & Motion Behavior

- [ ] Confirm motion remains smooth on capable devices.
- [ ] Confirm reduced-motion users receive minimized/disabled motion across all sections.
- [ ] Ensure loading skeleton and section transitions do not block keyboard access.

## 5) 3D Canvas & Heavy Visuals

- [ ] Verify hero/trophy canvas initializes without console errors.
- [ ] Confirm graceful fallback when WebGL/context is unavailable.
- [ ] Check CPU/GPU usage does not spike excessively on idle.

## 6) Lighthouse Gates

- [ ] Home performance score >= 80.
- [ ] Timeline performance score >= 80.
- [ ] Contact/training/media/legacy performance score >= 80.
- [ ] LCP < 2.5s, CLS < 0.1 on each audited page.
- [ ] Record baseline deltas in `docs/performance-baseline.md` before release sign-off.

---

## 7) Environment Variables

All variables must be set in the deployment environment before going live.
Reference `.env.example` for the canonical list with placeholder values.
**Never commit real values to source control.**

| Variable | Required | Purpose | Rotation trigger |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ Required | CORS/CSRF origin guard for the contact API. Must match the deployed origin exactly (no trailing slash). | On domain change or HTTPS migration |
| `CONTACT_MAIL_TO` | ✅ Required | Delivery address for incoming contact-form submissions. | On mailbox change |
| `CONTACT_MAIL_FROM` | ✅ Required | Sender address on outbound contact emails. Must be verified by your mail provider. | On domain/provider change |
| `CONTACT_MAIL_TIMEOUT_MS` | Optional | Mail dispatch timeout in milliseconds. Default: `10000`. Increase only for high-latency providers. | — |
| `CONTACT_RATE_LIMIT_WINDOW_MS` | Optional | Rate-limit window duration in ms. Default: `60000` (1 min). | — |
| `CONTACT_RATE_LIMIT_MAX` | Optional | Max contact requests per IP per window. Default: `5`. | — |
| `REDIS_URL` | Optional | Full Redis connection URL. When set, rate limiting uses a Redis sliding-window shared across all instances. | On credential rotation or Redis migration |
| `REDIS_HOST` | Optional | Redis hostname (alternative to `REDIS_URL`). | On Redis migration |
| `RESEND_API_KEY` | Conditional | Resend API key. Required if using Resend as the mail transport. | **Rotate immediately on suspected breach** |
| `SENDGRID_API_KEY` | Conditional | SendGrid API key. Placeholder for future SendGrid integration. | **Rotate immediately on suspected breach** |
| `SMTP_HOST` | Conditional | SMTP server hostname. Required if using Nodemailer/SMTP transport. | On SMTP provider change |
| `SMTP_PORT` | Conditional | SMTP port. Default: `587`. Use `465` for TLS-wrapped connections. | — |
| `SMTP_USER` | Conditional | SMTP authentication username. | On credential rotation |
| `SMTP_PASS` | Conditional | SMTP authentication password. | **Rotate immediately on suspected breach** |

### Missing-variable failure modes

| Variable absent | Runtime behavior |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | CSRF guard derives expected origin from `request.url`. Safe but fragile in reverse-proxy deployments — always set explicitly. |
| `CONTACT_MAIL_TO` / `FROM` | Defaults to `contact@markusruhl.com` / `noreply@markusruhl.com` (code fallback). Set explicitly in production to avoid silent misconfiguration. |
| `REDIS_URL` / `REDIS_HOST` | Rate limiter falls back to in-memory fixed-window counter. Safe for single-instance; not safe for multi-instance deployments. |
| Mail provider keys absent | Contact form falls back to a console-warn log. No email is sent. Monitor `contact_submission_fallback` log events for misconfiguration. |

---

## 8) Rollback Runbook

Use this procedure to revert a bad deployment safely and verifiably.

### When to roll back

Roll back immediately if any of the following are observed post-deploy:
- Health endpoint (`GET /api/health`) returns unexpected schema or non-200 status
- Contact form submissions return `500` at a rate > 1% over a 5-minute window
- CI-blocked PR was merged by mistake (protected branch bypass)
- New deployment introduced a visual or functional regression confirmed by Lighthouse

### Known-good release tags

Release tags mark validated, deployable states. Use them as stable rollback anchors:

| Tag | Commit | State |
|---|---|---|
| `known-good/v1-wave2-ops` | `dcf3b30` | Post wave-2 ops hardening — CI green, health endpoint, structured logging, runbooks |

**Tag convention:** `known-good/<descriptor>` — created after each wave's CI passes and ops review is complete.

To list available tags:
```sh
git tag --list 'known-good/*' --sort=-creatordate
```

### Rollback steps

1. **Identify the last known-good tag** (preferred over raw SHA hunting)
   ```sh
   git tag --list 'known-good/*' --sort=-creatordate | head -5
   # Or find the SHA of the tag:
   git rev-parse known-good/v1-wave2-ops
   ```
   If no tag exists, fall back to the recent commit log:
   ```sh
   git log --oneline -10 origin/main
   ```

2. **Revert the bad commit(s)** (creates a new commit — never force-push main)
   ```sh
   git revert <bad-sha> --no-edit
   git push origin main
   ```
   If multiple commits need reverting, use a range: `git revert <oldest>..<newest>`.

3. **Verify CI passes on the revert commit** before monitoring production.

4. **Check the health endpoint** after deployment completes:
   ```sh
   curl -s https://<your-domain>/api/health | jq .
   # Expected: {"status":"ok","dependencies":{"redis":"ok"|"unavailable"},...}
   ```
   Replace `<your-domain>` with the deployed hostname (e.g., `markusruhl.com`).

5. **Confirm contact form** end-to-end with a test submission in staging.

6. **Check structured logs** for `mail_failure` or `rate_limit_redis_error` events
   indicating a dependency degradation that the rollback did not resolve.

7. **Tag the new stable state** after a verified clean deployment:
   ```sh
   git tag known-good/<descriptor> <sha>
   git push origin known-good/<descriptor>
   ```

### Degraded-mode operation (Redis unavailable)

The service is designed to remain fully operational when Redis is unavailable:
- `GET /api/health` returns `{"status":"degraded","dependencies":{"redis":"unavailable"}}` — this is **not** a service outage.
- The contact API continues accepting submissions using the in-memory rate limiter.
- Monitor `rate_limit_redis_error` log events; sustained occurrences indicate a Redis connectivity problem requiring investigation.
- **Do not roll back solely because health shows `degraded`** — investigate Redis connectivity first.

---

## 9) Secret Rotation Policy

### Rotation triggers (immediate action required)

| Secret | Rotate when |
|---|---|
| `RESEND_API_KEY` | Compromised, leaked in logs/code, or Resend reports unauthorized use |
| `SENDGRID_API_KEY` | Compromised, leaked in logs/code, or SendGrid reports unauthorized use |
| `SMTP_PASS` | Compromised, SMTP provider flags suspicious activity, or employee with access offboards |
| `REDIS_URL` (auth token) | Redis auth string leaked, or Redis instance migrated |

### Rotation procedure

1. **Generate a new credential** at the provider (Resend dashboard, SendGrid, SMTP provider).
2. **Update the secret in your deployment environment** (e.g., Vercel dashboard → Environment Variables, or PM2 `.env` on the server).
3. **Re-deploy** to apply the new credential — the Next.js server must restart to pick up new env vars.
4. **Verify the health endpoint** and send a test contact form submission.
5. **Revoke the old credential** at the provider only after confirming the new one is live and working.
6. **Audit logs** for the period the credential was exposed: look for unexpected `mail_success` events from unknown IPs.

### What is never rotated

- `NEXT_PUBLIC_SITE_URL` — this is a public origin URL, not a secret.
- `CONTACT_RATE_LIMIT_*` — these are tuning parameters, not credentials.

---

## 10) Observability and Alerting Signals

### Health endpoint monitoring

Uptime monitors (e.g., Better Uptime, Pingdom, UptimeRobot) should poll `GET /api/health` every 60 seconds.

**Alert if:**
- HTTP status is not `200` — indicates the server itself is down (not degraded).
- Response body `status` is `"degraded"` for more than 5 consecutive checks — indicates sustained Redis unavailability.
- Response latency exceeds 2000 ms — indicates server under load or a hung Redis operation.

**Do not alert if:**
- `status` is `"degraded"` for 1–2 checks — transient Redis blip; the service remains operational.

### Structured log anomaly signals

Monitor these log event patterns for abuse or failure:

| Event | Signal interpretation | Suggested threshold |
|---|---|---|
| `rate_limit_hit` | Normal at low rates. Spike (> 50/min from a single IP) indicates brute-force or crawler. | Alert if > 50 per IP per minute |
| `mail_failure` | Single occurrences: transient mail provider error. Sustained: provider down or credentials expired. | Alert if > 3 in a 5-minute window |
| `csrf_rejected` | Single occurrences: normal (bots, mis-configured clients). High rate: potential scraping or probing. | Alert if > 20 per minute across all IPs |
| `rate_limit_redis_error` | Redis connectivity issue — limiter has fallen back to in-memory. | Alert on any occurrence in production |
| `contact_submission_fallback` | No mail provider configured — submissions are being silently dropped. | Alert on any occurrence in production |

### Log schema reference

All structured log entries emitted by `lib/api/log.ts` follow this schema:

```jsonc
{
  "event": "string (snake_case)",   // machine-readable event ID
  "route": "string",                // e.g. "/api/health", "/api/contact"
  "method": "string",               // HTTP method
  "status": number,                 // HTTP status code (0 = not yet determined)
  "durationMs": number,             // elapsed ms from request start
  "timestamp": "ISO-8601 UTC"       // always the last field
  // ... additional context fields (PII-redacted)
}
```

Sensitive fields are automatically replaced with `"[REDACTED]"` — see `lib/api/log.ts` for the full redaction key list.

---

## 11) Deployment Platform Notes

The repository contains no deployment workflow (`.github/workflows/deploy.yml` absent).
The deployment target is **not codified** — evidence suggests a self-hosted Node.js server via PM2
(inferred from `ecosystem.config.cjs` presence in the workspace, plus `"start": "next start"` script)
or a Vercel-style platform deployment.

**Before adding a deployment workflow:**
1. Confirm the deployment target platform (Vercel, PM2-managed VPS, Docker/container).
2. Confirm the required secrets (`VERCEL_TOKEN`, SSH key, etc.) are stored in GitHub Secrets.
3. Wire the deploy step to run only after the CI job passes (`needs: ci`).
4. Ensure deploy-on-push is gated to `main` only.

Until a deployment workflow is added, deployments must be triggered manually after CI green.

