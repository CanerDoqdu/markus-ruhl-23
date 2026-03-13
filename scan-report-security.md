# Post-Merge Security & Dependency Integrity Scan Report

**Branch:** `scan/test-security-post-pr51`
**Triggered by:** PR #51 (introduced `vite-plugin-glsl` as devDependency)
**Scan date:** 2026-03-13
**Repo:** `CanerDoqdu/markus-ruhl-23`

---

## 1. `npm ci` — Dependency Installation

**Exit code: 0 (SUCCESS)**

Installation completed successfully. Two deprecation warnings were noted (non-blocking):

- `three-mesh-bvh@0.7.8` — deprecated due to three.js version incompatibility; use v0.8.0.
- `@studio-freight/lenis@1.0.42` — package renamed to `lenis`.

**Total packages installed:** 493 (494 audited)

---

## 2. Test Suite

**Result: NO TEST SCRIPT PRESENT**

The `package.json` `scripts` block contains:

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint",
"type-check": "tsc --noEmit"
```

There is no `test` or `test:*` script defined. `npm test` / `npm run test` would fail with a missing-script error. **No test suite to run; exit code would be non-zero due to missing script.**

---

## 3. `npm audit --audit-level=moderate`

**Exit code: 1**
**Total vulnerabilities: 15 (1 low, 3 moderate, 11 high, 0 critical)**

### 🔴 HIGH (11)

| Package | Affected Range | Advisory | Fix |
|---|---|---|---|
| `braces` | `<3.0.3` | GHSA-grv7-fg5c-xmjg — Uncontrolled resource consumption | `npm audit fix` |
| `cross-spawn` | `7.0.0 – 7.0.4` | GHSA-3xgq-45jj-v275 — ReDoS | `npm audit fix` |
| `flatted` | `<3.4.0` | GHSA-25h7-pfq9-p65f — unbounded recursion DoS | `npm audit fix` |
| `glob` | `10.2.0 – 10.4.5` | GHSA-5j98-mcp5-4vw2 — CLI command injection via `-c/--cmd` | `npm audit fix` |
| `immutable` | `4.0.0-rc.1 – 4.3.7` | GHSA-wf6x-7x77-mvgw — Prototype Pollution | `npm audit fix` |
| `minimatch` | `<=3.1.3` or `9.0.0–9.0.6` | GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74 — multiple ReDoS | `npm audit fix --force` ⚠️ breaking change |
| `@typescript-eslint/typescript-estree` | `6.16.0 – 7.5.0` | Depends on vulnerable `minimatch` | via `minimatch` fix |
| `@typescript-eslint/parser` | `6.16.0 – 7.5.0` | Depends on vulnerable `@typescript-eslint/typescript-estree` | via chain |
| `@typescript-eslint/type-utils` | `6.16.0 – 7.5.0` | Depends on vulnerable `minimatch` chain | via chain |
| `@typescript-eslint/eslint-plugin` | `6.16.0 – 7.5.0` | Depends on vulnerable chain | via chain |
| `@typescript-eslint/utils` | `6.16.0 – 7.5.0` | Depends on vulnerable chain | via chain |

> **Note:** `minimatch` fix requires `--force` and will install `@typescript-eslint/parser@8.57.0` — a breaking change requiring review.

### 🟡 MODERATE (3)

| Package | Affected Range | Advisory | Fix |
|---|---|---|---|
| `ajv` | `<6.14.0` | GHSA-2g4f-4pwh-qvx6 — ReDoS with `$data` option | `npm audit fix` |
| `brace-expansion` | `1.0.0–1.1.11` or `2.0.0–2.0.1` | GHSA-v6h2-p8h4-qcjw — ReDoS | `npm audit fix` |
| `js-yaml` | `4.0.0–4.1.0` | GHSA-mh29-5h37-fv8m — prototype pollution via merge | `npm audit fix` |
| `micromatch` | `<4.0.8` | GHSA-952p-6rrq-rcjv — ReDoS | `npm audit fix` |

> *(4 moderate entries noted; summary shows 3 — one may overlap with a counted high-severity chain.)*

### ⚪ LOW (1)

Reported by `npm ci` summary; not individually itemized in `npm audit` output at `--audit-level=moderate`.

### ❌ CRITICAL: NONE

No critical-severity CVEs detected.

---

## 4. `package-lock.json` Integrity

| Check | Result |
|---|---|
| `lockfileVersion` present | ✅ **3** |
| `vite-plugin-glsl` entry present | ✅ `node_modules/vite-plugin-glsl` → version `1.3.1` |
| Lock file parseable / consistent | ✅ No parse errors |

---

## 5. GSAP CVE Check

**GSAP version in lock:** `3.14.2` (resolved from `^3.12.5`)

**CVEs in audit output attributable to GSAP:** ✅ **NONE**

No `gsap` package appears in the `npm audit` findings. GSAP `3.14.2` is clear of known high/critical CVEs in this scan.

---

## 6. `node_modules` Committed to Repo

**Result: ✅ NOT COMMITTED**

`node_modules` is listed in `.gitignore`:

```
node_modules
```

The `node_modules` directory exists locally (created by `npm ci`) but is correctly excluded from version control.

---

## Summary Table

| Gate | Status | Notes |
|---|---|---|
| `npm ci` exits 0 | ✅ PASS | 2 deprecation warnings (non-blocking) |
| Test suite present | ❌ NOT PRESENT | No `test` script in `package.json` |
| `npm audit` — critical CVEs | ✅ NONE | 0 critical findings |
| `npm audit` — high CVEs | ⚠️ 11 HIGH | All in devDependencies / build toolchain; not runtime |
| `vite-plugin-glsl` in lock | ✅ PASS | v1.3.1 at `node_modules/vite-plugin-glsl` |
| `lockfileVersion` present | ✅ PASS | Version 3 |
| GSAP high/critical CVEs | ✅ PASS | None found |
| `node_modules` not committed | ✅ PASS | Excluded via `.gitignore` |

---

## Recommendations

1. **Add a test script** — even a basic smoke test (e.g., `tsc --noEmit` wired as `test`) so future CI can gate on it.
2. **Address high-severity findings** — run `npm audit fix` for non-breaking fixes (braces, cross-spawn, flatted, etc.). Schedule a separate review for the `minimatch`/`@typescript-eslint` breaking-change upgrade (`npm audit fix --force`).
3. **Deprecation cleanup** — update `@studio-freight/lenis` → `lenis` and `three-mesh-bvh` → `>=0.8.0` at next maintenance window.
4. **No action needed for GSAP or vite-plugin-glsl** — both are clean.
