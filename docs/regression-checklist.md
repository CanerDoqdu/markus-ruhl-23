# Pre-Deployment Regression Checklist (Wave 4)

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
- [ ] API response contracts hold for `200`, `415`, `422`, `429`, `500`.

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

