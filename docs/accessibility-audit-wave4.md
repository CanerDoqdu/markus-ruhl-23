# Wave 4 Accessibility Audit (WCAG 2.1 AA)

Date: 2026-03-17  
Scope: `/`, `/#timeline`, `/contact`, `/training`, `/media`, `/legacy`  
Methods: `axe-core` CLI (`@axe-core/cli`), code review, keyboard-flow review

## Summary

- Automated axe scan reported repeated issues on all audited pages.
- Most frequent issue is insufficient color contrast on muted gray text.
- Contact form has label associations in place (`label` + `htmlFor`), but status/error messaging is not screen-reader-announced (`role`/`aria-live` missing).
- Mobile menu is accessible by button semantics but has no focus trap/escape-close behavior.
- Reduced-motion handling is partial: some components use `useReducedMotion`, others still animate regardless of user preference.

## Findings

| Severity | Page(s) | Element(s) | WCAG 2.1 AA criterion | Finding |
|---|---|---|---|---|
| major | `/`, `/#timeline`, `/contact`, `/training`, `/media`, `/legacy` | Multiple gray text blocks (e.g., `.text-gray-500`, `.text-gray-600`, `.text-gray-700`) | **1.4.3 Contrast (Minimum)** | Text/background contrast falls below 4.5:1 for normal text. |
| major | `/` | Overlay element matching `.inset-0` during initial loading/hero layering | **1.3.1 Info and Relationships** | Axe `region` rule failure: content/overlay exists outside landmark structure. |
| major | `/contact` | Contact methods heading sequence (`h3` cards after page `h1`) | **1.3.1 Info and Relationships** | Axe `heading-order` failure: heading level sequence is not semantically consistent. |
| major | `/contact` | Form status/error containers | **4.1.3 Status Messages** | Success/error feedback is visual only; no `role="status"/"alert"` + `aria-live` for AT announcement. |
| major | global (mobile nav) | Mobile nav drawer in `Header` | **2.1.2 No Keyboard Trap** / **2.4.3 Focus Order** | Drawer opens without explicit focus management or escape-close handling; focus can move behind overlay. |
| minor | global | Skip-navigation link | **2.4.1 Bypass Blocks** | No skip link to bypass repeated header/navigation content. |
| minor | global motion | `Reveal`, `StaggerContainer`, `ScrollProgress`, CSS `scroll-smooth` | **2.3.3 Animation from Interactions** / user preference support | `prefers-reduced-motion` support is incomplete and inconsistent across motion layers. |

## Contact Form Accessibility Check

- Labels: present and associated (`name`, `email`, `message`) ✅
- Keyboard path: native fields and submit are keyboard reachable ✅
- Validation UX: backend returns structured field errors, but UI does not expose them as per-field, screen-reader-announced messages ⚠️
- Error/status AT compatibility: currently insufficient (no live regions) ❌

## Contact Flow End-to-End Validation

Executed against running app (`next start`) at `http://localhost:3000/api/contact`.

| Scenario | Request | Expected | Actual |
|---|---|---|---|
| Success path | Valid JSON payload | 200 + success body | ✅ `200` with `"Message received successfully! We'll get back to you soon."` |
| Validation failure | Empty name/message + invalid email | 422 + field validation object | ✅ `422` with `fields.name/email/message` |
| Unsupported content-type | `text/plain` body | 415 error | ✅ `415` |
| CORS preflight allowlisted origin | `OPTIONS` with `Origin: http://localhost:3000` | 204 | ✅ `204` |

Server-error graceful path (`500`) is already covered by existing automated route tests (`app/api/contact/route.test.ts`) via mail transport failure mocks (timeout/rejection/network failure). In current runtime, `lib/contact/mail.ts` is a placeholder transport and resolves successfully, so live `500` reproduction is not available without intentionally altering runtime behavior.

## Recommended Ownership

- **Fast HTML/ARIA fixes (QA/dev):** status live regions, heading level correction on contact page, skip-link insertion.
- **Frontend behavior/systemic fixes (Esther):** reduced-motion contract across all animated components, mobile menu focus-trap and escape handling, contrast token pass across theme.

## Raw axe execution

Command used:

```bash
npx --yes @axe-core/cli http://localhost:3000 http://localhost:3000/story http://localhost:3000/contact http://localhost:3000/training http://localhost:3000/media http://localhost:3000/legacy --exit
```

