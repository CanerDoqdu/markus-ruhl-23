# Wave 3 QA Frontend Audit (PRs #69, #70, #71)

Audit date: 2026-03-18  
Repository: `CanerDoqdu/markus-ruhl-23`  
Code audited: clean `origin/main` worktree (`ff75d1454ad6c2bc97ac61b917dc0cba0b95a577`)

## Scope and evidence source

- PR metadata and touched files were pulled from GitHub (`gh pr view 69/70/71 --json body,files`).
- Audit target is **current `main` code**, not PR descriptions.
- Touched files across PRs: **35 unique files**.
- Frontend files audited for this brief: **31 files** in `app/`, `components/`, `app/layout.tsx`, `app/globals.css`, plus `next.config.js` for CWV-adjacent policy context.
- Non-frontend touched files (tracked, not audited for UI claims): `README.md`, `lib/contact/mail.ts`, `tsconfig.json`.

---

## Accessibility

| Component/File | Claim from PR | Finding | Evidence |
|---|---|---|---|
| `app/(site)/layout.tsx` | PR #70: skip link added and wired to shared target | PASS | Skip link exists at `app/(site)/layout.tsx:18-20` with `href="#main-content"`. |
| `app/(site)/page.tsx`, `app/(site)/story/page.tsx`, `app/(site)/training/page.tsx`, `app/(site)/contact/page.tsx`, `app/(site)/media/page.tsx`, `app/(site)/legacy/page.tsx`, `app/(site)/not-found.tsx` | PR #70: pages wired to shared `#main-content` target | PASS | `<main id="main-content">` present at `app/(site)/page.tsx:66`, `story/page.tsx:16`, `training/page.tsx:16`, `contact/page.tsx:45`, `media/page.tsx:18`, `legacy/page.tsx:59`, `not-found.tsx:6`. |
| `components/layout/Header.tsx` | PR #71: header focus trap + accessible menu semantics | PASS | Menu button has `aria-label`, `aria-expanded`, `aria-controls` at `Header.tsx:130-133`; mobile overlay has `role="dialog" aria-modal="true"` at `Header.tsx:151-153`. |
| `components/layout/Header.tsx` | PR #71: escape closes menu and returns focus | PASS | Escape handler sets menu closed and focuses toggle button at `Header.tsx:49-53`. |
| `components/layout/Header.tsx` | PR #71: focus trap in mobile menu | PASS | Tab loop trap implemented at `Header.tsx:60-75`; first focusable element auto-focused at `Header.tsx:79-83`. |
| `components/sections/contact/ContactForm.tsx` | PR #71: form accessibility hardening (aria-invalid, describedby, live region) | PASS | Field-level `aria-invalid`/`aria-describedby` at `ContactForm.tsx:170-172`, `201-203`, `231-236`; live region at `ContactForm.tsx:294`; alert/status roles at `ContactForm.tsx:248`, `300`, `311`. |
| `components/layout/Footer.tsx`, `app/(site)/contact/page.tsx` | PR #70: interactive controls have labels | PASS | Social links carry `aria-label` at `Footer.tsx:57` and `contact/page.tsx:105`. |
| `app/globals.css` | PR #70: keyboard-visible focus styling globally | PASS | Focus-visible styles for links/buttons/inputs/selects at `app/globals.css:43-51`. |
| `components/sections/InteractiveTimeline.tsx` | PR #70/#71: keyboard navigation support | PASS | Tablist semantics and key handlers at `InteractiveTimeline.tsx:165-178`, `85-109`, `170`. |
| `app/(site)/media/page.tsx` | PR #70 broad accessibility audit claim | FLAG | Gallery cards use `cursor-pointer` on non-interactive `div` (`media/page.tsx:39`) without button/link semantics; mouse-affordance suggests clickability but keyboard users get no equivalent action. |
| `app/error.tsx` | PR #71 accessibility hardening breadth | FLAG | Error digest uses `text-gray-600` on dark background (`app/error.tsx:63`) and may be low-contrast for small text. |
| `components/sections/contact/ContactForm.tsx` | PR #70 contrast improvements claim | FLAG | Hint text uses `text-gray-500` (`ContactForm.tsx:244`) and placeholders use `placeholder:text-gray-600` (`ContactForm.tsx:127`) on dark surfaces; likely borderline contrast. |

---

## Reduced Motion

| Component/File | Claim from PR | Finding | Evidence |
|---|---|---|---|
| `app/globals.css` | PR #69/#70: reduced-motion safeguards | PASS | Global `@media (prefers-reduced-motion: reduce)` disables animation/transition durations at `globals.css:173-184`. |
| `components/motion/Reveal.tsx` | PR #69: shared animation primitives respect reduced motion | PASS | `useReducedMotion` gates initial/transition behavior at `Reveal.tsx:29`, `39-41`, `58-59`. |
| `components/motion/StaggerContainer.tsx` | PR #69: shared animation primitives respect reduced motion | PASS | `useReducedMotion` disables stagger/duration at `StaggerContainer.tsx:17`, `23`, `54`. |
| `components/layout/Header.tsx` | PR #70/#71 reduced motion coverage | PASS | Mobile menu transition durations are zeroed when reduced motion is enabled at `Header.tsx:155-159`, `167`. |
| `components/sections/story/StoryHero.tsx` | PR #69/#70: reduced motion support audited/fixed broadly | FAIL | Framer transition is always animated (`StoryHero.tsx:14`) and component does not use `useReducedMotion`. |
| `components/sections/story/SuccessStories.tsx` | PR #69/#70 broad reduced-motion claim | FAIL | Hover/whileInView animations are always active (`SuccessStories.tsx:70`, `117-121`) with no reduced-motion branch. |
| `components/sections/home/TrainingPreview.tsx` | PR #69 broad reduced-motion claim | FAIL | `whileHover={{ y: -10 }}` and long transitions (`TrainingPreview.tsx:52`, `55-56`, `63`) have no reduced-motion guard. |
| `components/sections/training/TrainingPrograms.tsx` | PR #69 broad reduced-motion claim | FAIL | `whileHover`/timed transitions (`TrainingPrograms.tsx:65`, `68-69`) are not reduced-motion aware. |
| `components/sections/home/LayerStack.tsx` | PR #69 broad reduced-motion claim | FAIL | Extensive `motion` transitions/animate usage (`LayerStack.tsx:86-89`, `159-171`, `187-191`, etc.) with no `useReducedMotion`. |
| `components/sections/home/TrophyShowcase.tsx` | PR #69 broad reduced-motion claim | FAIL | Infinite rotating decorative rings (`TrophyShowcase.tsx:150-163`) not gated by reduced-motion preference. |
| `components/shared/LoadingSkeleton.tsx` | PR #70 reduced-motion verification claim | FLAG | Loading bar/dots are guarded (`LoadingSkeleton.tsx:31`, `46-48`) but intro fade-in remains animated (`LoadingSkeleton.tsx:12-14`). Partial compliance. |
| PR #69 mention of GSAP/ScrollTrigger checks | PR #69: GSAP motion audited | FLAG | No `gsap`/`ScrollTrigger` invocations in touched frontend files; only a CSP comment reference in `next.config.js:24-26`. Claim is not directly verifiable in touched implementation scope. |

---

## Responsive

| Component/File | Claim from PR | Finding | Evidence |
|---|---|---|---|
| `app/(site)/*` hero/content pages | PR #69: breakpoint fixes across pages | PASS | Consistent responsive utility usage (`sm:`, `md:`, `lg:`) in representative pages: `contact/page.tsx:47-49`, `legacy/page.tsx:61-63`, `media/page.tsx:20-23`, `training/page.tsx:21`, `story/StoryHero.tsx:17`. |
| `components/layout/Header.tsx` | PR #69: mobile navigation behavior improved | PASS | Desktop/mobile split uses media query hook and conditional menu UX (`Header.tsx:17`, `103-140`, `147-183`). |
| `components/sections/home/LayerStack.tsx` | PR #69: responsive improvements in heavy sections | FLAG | Desktop layout locks center column widths (`LayerStack.tsx:155`, `173`) and hardcodes section height `300vh` (`LayerStack.tsx:74`); can be brittle across uncommon viewport heights/zoom settings. |
| `components/sections/home/TrophyShowcase.tsx` | PR #69: responsive section hardening | FLAG | Large absolute decorative elements (`w-[500px]`, `w-[400px]`, `w-[550px]`) at `TrophyShowcase.tsx:65-66`, `160`; overflow hidden mitigates most risk, but these are still fixed-pixel constructs. |
| `components/layout/Footer.tsx`, `components/sections/home/FinalCTA.tsx`, `components/sections/home/MediaPreview.tsx` | PR #69: cards/sections responsive cleanup | PASS | Uses fluid grids and responsive breakpoints (`Footer.tsx:37`, `122`; `FinalCTA.tsx:36-37`; `MediaPreview.tsx:118`, `136`). |

---

## SEO

| Component/File | Claim from PR | Finding | Evidence |
|---|---|---|---|
| `app/layout.tsx` | PR #71: SEO metadata hardening | PASS | Root metadata defines title template, description, keywords, OpenGraph, Twitter, robots (`app/layout.tsx:20-76`). |
| `app/layout.tsx` | PR #71: JSON-LD structured data added | PASS | JSON-LD Person schema object at `app/layout.tsx:78-91`, injected via script at `app/layout.tsx:101-104`. |
| `app/(site)/page.tsx`, `story/page.tsx`, `training/page.tsx`, `contact/page.tsx`, `media/page.tsx`, `legacy/page.tsx` | Verify page-level title uniqueness | PASS | Each route exports distinct `metadata.title` values (e.g., `page.tsx:7`, `story/page.tsx:8`, `training/page.tsx:8`, `contact/page.tsx:10`, `media/page.tsx:8`, `legacy/page.tsx:9`) while root uses title template (`app/layout.tsx:22-25`). |
| `app/sitemap.ts` | PR #71: sitemap domain configurability | PASS | Uses `NEXT_PUBLIC_SITE_URL` fallback (`app/sitemap.ts:4`) and includes key routes (`app/sitemap.ts:6-43`). |
| `app/layout.tsx` | Canonical URL presence check | FLAG | No `alternates.canonical` (or equivalent canonical metadata) in root metadata object (`app/layout.tsx:20-76`). |

---

## CWV Patterns

| Component/File | Claim from PR | Finding | Evidence |
|---|---|---|---|
| `app/layout.tsx` | Verify render-blocking scripts in head | PASS | Only JSON-LD script (`type="application/ld+json"`) in `<head>` at `app/layout.tsx:101-104`; no blocking third-party runtime script tags found in touched frontend files. |
| Touched frontend files | Verify image optimization patterns | PASS | No raw `<img>` tags found in touched files; image-heavy components use Next `<Image>` with `fill/sizes/priority` where applicable (`PremiumHero.tsx:315-323`, `MediaPreview.tsx:132-138`, `InteractiveTimeline.tsx:262-268`). |
| `app/(site)/page.tsx` dynamic imports | Verify layout-shift sensitive patterns | FLAG | Above-the-fold dynamic chunks use full-viewport fallback placeholders (`h-screen`) at `app/(site)/page.tsx:16`, `21`, `26`; this can still induce perceived visual jank when replaced by different final section geometry. |
| `components/layout/Header.tsx` | Verify fixed overlays reserve behavior safely | PASS | Mobile overlay is intentional fixed layer (`Header.tsx:159`) with body scroll lock (`Header.tsx:30-38`), reducing scroll-jump risk when menu is open. |

---

## Full touched-file inventory from PRs #69/#70/#71

### Frontend (audited)

- `app/(site)/contact/page.tsx`
- `app/(site)/layout.tsx`
- `app/(site)/legacy/page.tsx`
- `app/(site)/media/page.tsx`
- `app/(site)/not-found.tsx`
- `app/(site)/page.tsx`
- `app/(site)/story/page.tsx`
- `app/(site)/training/page.tsx`
- `app/error.tsx`
- `app/global-error.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/sitemap.ts`
- `components/layout/Footer.tsx`
- `components/layout/Header.tsx`
- `components/motion/Reveal.tsx`
- `components/motion/StaggerContainer.tsx`
- `components/sections/InteractiveTimeline.tsx`
- `components/sections/contact/ContactForm.tsx`
- `components/sections/hero/PremiumHero.tsx`
- `components/sections/home/Discipline.tsx`
- `components/sections/home/FinalCTA.tsx`
- `components/sections/home/LayerStack.tsx`
- `components/sections/home/MediaPreview.tsx`
- `components/sections/home/TrainingPreview.tsx`
- `components/sections/home/TrophyShowcase.tsx`
- `components/sections/story/StoryContent.tsx`
- `components/sections/story/StoryHero.tsx`
- `components/sections/story/SuccessStories.tsx`
- `components/sections/training/TrainingPrograms.tsx`
- `components/shared/LoadingSkeleton.tsx`
- `next.config.js`

### Non-frontend touched files (out-of-scope for this frontend audit brief)

- `README.md`
- `lib/contact/mail.ts`
- `tsconfig.json`

---

## QA conclusion

- Accessibility claim set is **partially validated**: key form/menu patterns are strong, but there are remaining interaction and contrast risks.
- Reduced-motion claim set is **not fully validated**: multiple Framer Motion-heavy components still animate without `useReducedMotion` gating.
- Responsive claim set is **mostly validated** with a few fixed-pixel structural risks.
- SEO claim set is **mostly validated** (metadata + JSON-LD + sitemap), but canonical metadata is still missing.
- CWV-sensitive patterns are **generally acceptable**, with dynamic fallback placeholders as the main residual risk.
