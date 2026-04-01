# QA Audit: PR #69, #70, #71 Claims vs Current `main`

Date: 2026-03-17  
Auditor: Isaiah (QA)  
Scope: Accessibility, responsive/animation, SEO, and CWV-sensitive patterns in `app/` and `components/` plus root layout/config.

## Method

- Audited committed `main` content via `git show HEAD:<file>` and `git grep` line references.
- Did not rely on local unstaged workspace edits.
- Verified build/test baseline:
  - `npm run build` ✅
  - `npm test` ✅ (3 files, 68 tests)

## Claim Validation Matrix

### PR #69 — Responsive design and animation performance

#### Substantiated

- Responsive breakpoints are present across key sections (example: `app/(site)/contact/page.tsx:47-57`, `app/(site)/training/page.tsx:18-33`, `components/sections/home/TrophyShowcase.tsx:68-73`).
- Mobile nav behavior and keyboard handling are implemented (`components/layout/Header.tsx:47-84`, `126-154`).
- Reduced-motion handling exists in shared motion primitives (`components/motion/Reveal.tsx:29-60`, `components/motion/StaggerContainer.tsx:17-55`, `components/sections/InteractiveTimeline.tsx:76,132,182,257,289`).

#### Not fully substantiated / regressions vs claim text

- Claim: “switched shared animation primitives to respect reduced-motion.”  
  Counter-evidence: `components/motion/ScrollProgress.tsx:3-17` in `HEAD` has no `useReducedMotion` guard and always renders animated progress.
- Claim: “improved canvas fallback behavior for reduced motion users.”  
  Counter-evidence: `components/sections/home/TrophyShowcase.tsx` has multiple unconditional motion transitions without reduced-motion gating (`75-90`, `148-163`, `175-179`, `201-217`, `226-231`), and does not use `useReducedMotion`.

### PR #70 — Accessibility audit

#### Substantiated

- Skip link is implemented and wired to page mains:
  - `app/(site)/layout.tsx:18-20`
  - `app/(site)/page.tsx:66`
  - `app/(site)/contact/page.tsx:45`
  - `app/(site)/training/page.tsx:16`
  - `app/(site)/story/page.tsx:16`
  - `app/(site)/media/page.tsx:18`
  - `app/(site)/legacy/page.tsx:59`
  - `app/(site)/not-found.tsx:6`
- Visible focus styles are globally defined (`app/globals.css:37-51`).
- ARIA labeling is broadly present:
  - Header menu trigger/dialog (`components/layout/Header.tsx:130-133`, `151-154`)
  - Contact form semantics (`components/sections/contact/ContactForm.tsx:136`, `153`, `169-171`, `200-203`, `230-236`, `294`)
  - Timeline tab semantics (`components/sections/InteractiveTimeline.tsx:165-178`, `332-334`)
- Keyboard focus management exists:
  - Menu focus trap and Escape restore (`components/layout/Header.tsx:47-76`)
  - Auto-focus first menu item (`components/layout/Header.tsx:78-84`)
  - Timeline roving tab focus (`components/sections/InteractiveTimeline.tsx:80-109`)
  - Contact form focuses first invalid field (`components/sections/contact/ContactForm.tsx:78-84`)

#### Cannot be fully substantiated from code alone

- PR body claims Lighthouse/axe score deltas and route scans; no executable evidence artifact is tracked in `main` as canonical CI output. Existing local artifacts are not commit-anchored proof.

### PR #71 — Error boundaries, accessibility, SEO, mail/security

#### Substantiated

- Error boundaries exist:
  - `app/error.tsx:6-70`
  - `app/global-error.tsx:10-80`
- SEO metadata and structured data are present:
  - Root metadata + OG/Twitter/robots: `app/layout.tsx:20-76`
  - JSON-LD Person schema: `app/layout.tsx:78-104`
  - Route metadata examples: `app/(site)/contact/page.tsx:9-12`, `app/(site)/training/page.tsx:7-10`
  - Sitemap uses env-aware base URL: `app/sitemap.ts:4-5`
- Security/image hardening exists in config:
  - Restricted image domains + modern formats: `next.config.js:4-12`
  - Security headers/CSP: `next.config.js:34-58`

## Focus Management Assessment

- **Pass** for nav/dialog and form validation-first-error.
- **Gap**: Error boundaries do not set initial focus to heading/landmark on render (`app/error.tsx`, `app/global-error.tsx`), so assistive tech focus placement depends on browser defaults.

## Reduced Motion Assessment

- **Partial pass**: global CSS and many components honor reduced motion.
- **Fail for full claim coverage**: `ScrollProgress` and `TrophyShowcase` still include unconditional motion in `HEAD` as noted above.

## Meta/SEO Assessment

- **Pass**: metadata, OG/Twitter/robots, and JSON-LD are implemented and coherent with Next App Router patterns.

## CWV-Sensitive Pattern Assessment

### Positive patterns

- Heavy homepage sections are dynamically imported with `ssr: false` (`app/(site)/page.tsx:14-27`).
- Optimized image usage includes `next/image`, explicit `sizes`, and selective `priority` (`components/sections/hero/PremiumHero.tsx:315-323`, `components/sections/InteractiveTimeline.tsx:262-269`).
- Fonts use `display: "swap"` (`app/layout.tsx:10`, `17`).

### Risks observed

- Homepage is a client component and gates real content behind `window.load` via `isLoading` (`app/(site)/page.tsx:29-61`), which can delay meaningful content and affect LCP under slower conditions.
- Animation-heavy sections remain substantial; reduced-motion coverage is inconsistent (see PR #69 gaps).

## Final QA Verdict

- ARIA labels: **mostly substantiated**
- Focus management: **partially substantiated**
- Reduced-motion: **partially substantiated (material gaps remain)**
- Meta/SEO: **substantiated**
- CWV-sensitive patterns: **mixed (good optimizations + remaining risk factors)**

