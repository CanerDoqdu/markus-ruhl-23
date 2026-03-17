# Lighthouse Performance Baseline (Wave 4)

Date: 2026-03-17  
Environment: local production build (`next build` + `next start -p 3000`)  
Tool: Lighthouse CLI (`npx --yes lighthouse ... --only-categories=performance`)  

## Targets

- Performance score: **>= 80**
- LCP: **< 2.5s**
- CLS: **< 0.1**

INP/FID and TBT are tracked as supporting diagnostics.

## Baseline Results

| Surface | URL tested | Perf score | LCP (s) | INP/FID (ms) | CLS | TBT (ms) | Target status |
|---|---|---:|---:|---:|---:|---:|---|
| Home | `http://localhost:3000/` | 70 | 5.57 | 187 | 0.000 | 216 | ❌ score, ❌ LCP |
| Timeline | `http://localhost:3000/#timeline` | 69 | 6.01 | 114 | 0.000 | 163 | ❌ score, ❌ LCP |
| Contact | `http://localhost:3000/contact` | 93 | 2.73 | 143 | 0.000 | 136 | ✅ score, ❌ LCP |
| Training | `http://localhost:3000/training` | 94 | 2.71 | 92 | 0.000 | 42 | ✅ score, ❌ LCP |
| Media | `http://localhost:3000/media` | 94 | 2.71 | 106 | 0.000 | 69 | ✅ score, ❌ LCP |
| Legacy | `http://localhost:3000/legacy` | 94 | 2.87 | 89 | 0.000 | 20 | ✅ score, ❌ LCP |

## Notes

- `GET /timeline` returns `404`; timeline baseline was captured using the timeline section anchor (`/#timeline`) on home.
- Core layout stability is good (`CLS = 0` across sampled pages).
- LCP is the primary bottleneck across all pages.
- Home/timeline score drop aligns with heavy visual/animation payload and delayed first meaningful render.

## Command Pattern Used

```bash
npx --yes lighthouse <url> \
  --quiet \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance \
  --output=json \
  --output-path=docs/_lighthouse_tmp/<page>.json
```

