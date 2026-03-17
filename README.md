# Markus Rühl - Premium Brand Experience

Professional portfolio project showcasing advanced web development skills through a premium brand website for bodybuilding legend Markus Rühl. Features enterprise-level architecture, cinematic 3D graphics, and highly optimized performance.

---

## 🎯 Project Highlights

**Premium personal brand website** built with cutting-edge web technologies, demonstrating expertise in modern React ecosystem, 3D graphics programming, and performance optimization. Designed for seamless user experience across all devices with sophisticated animations and interactive elements.

### Key Technical Features

- **Custom WebGL 3D Graphics**: Self-implemented shader materials for trophy visualization with dynamic lighting, particle effects, and optimized rendering pipeline
- **Algorithm-Style UI Design**: Innovative code-inspired interface with SVG connection flows and advanced CSS animations for training system visualization
- **GSAP-Driven Scroll Narratives**: Complex timeline orchestration with ScrollTrigger, parallax effects, and scroll-linked animations
- **Performance-First Architecture**: Aggressive optimization with lazy loading, code splitting, dynamic imports, and mobile-specific feature flagging
- **Full TypeScript Implementation**: Strict type safety with zero `any` types, comprehensive interfaces, and proper error handling
- **Responsive & Adaptive**: Mobile-first design with device-specific component rendering and touch-optimized interactions

---

## 💻 Technology Stack

**Frontend Framework**
- Next.js 15 (App Router, Server Components, Edge Runtime)
- React 18 (Concurrent Features, Suspense)
- TypeScript 5.3 (Strict Mode)

**Styling & UI**
- Tailwind CSS 3.4 (Custom Design System)
- Framer Motion 11 (Advanced Animations)
- GSAP 3 + ScrollTrigger (Timeline Animations)

**3D Graphics**
- Three.js 0.182 (WebGL, Custom Shaders)
- React Three Fiber 8 (React Renderer)
- Custom GLSL Shaders (PBR Materials)

**Performance**
- Dynamic Imports (Code Splitting)
- Next.js Image Optimization
- Loading Skeleton Pattern
- Mobile Feature Detection

---

## 🚀 Technical Achievements

### Advanced 3D Implementation
- Custom shader materials with gradient-based vertex coloring
- Dynamic lighting system with dual point lights
- GLTF model loading and optimization
- Conditional 3D rendering (desktop-only for performance)

### Animation Engineering
- Scroll-driven timeline with GSAP ScrollTrigger
- Framer Motion spring physics and gesture controls
- SVG connection flow animations
- Scanline and conic gradient effects

### Performance Optimization
- Lazy-loaded heavy components (3D, Timeline)
- Mobile-optimized rendering (disabled 3D on mobile)
- Intelligent loading states with minimum display time
- Image optimization and lazy loading

### Architecture Patterns
- Component composition and reusability
- Custom hooks for media queries and scroll
- Type-safe API routes with edge runtime
- Modular section-based architecture


## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or **yarn** 1.22.x

### Installation

```bash
git clone https://github.com/CanerDoqdu/markus-ruhl-23.git
cd markus-ruhl-23
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (e.g., `https://markusruhl.com`) |
| `RESEND_API_KEY` | No* | Resend API key for email delivery |
| `SMTP_HOST` | No* | SMTP server hostname (fallback transport) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP authentication username |
| `SMTP_PASS` | No | SMTP authentication password |
| `CONTACT_EMAIL` | Yes | Recipient email for contact form submissions |
| `CSRF_SECRET` | Yes | Secret for CSRF token generation (min 32 chars) |
| `RATE_LIMIT_MAX` | No | Max contact submissions per IP per window (default: 5) |

\* At least one mail transport (`RESEND_API_KEY` or `SMTP_HOST`) should be configured in production. Without either, emails are logged to the console.

### Development

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run lint      # Run ESLint
npm run type-check # TypeScript strict check
npm test          # Run unit tests (Vitest)
npm run test:e2e  # Run end-to-end tests (Playwright)
```

### Production Build

```bash
npm run build     # Create optimized production build
npm start         # Start production server
```

---

## 📡 API Endpoints

> Full contract details, response schemas, and structured log specifications
> are in [`docs/api-contracts.md`](./docs/api-contracts.md).

### `GET /api/health`

Returns service health. Always responds **HTTP 200** — read the body `status`
field to determine health state.

**Response schema (stable — wave-1 contract):**

```json
{
  "status": "ok" | "degraded",
  "dependencies": { "redis": "ok" | "unavailable" },
  "version": "string",
  "timestamp": "ISO-8601"
}
```

`status: "degraded"` means Redis is unavailable but the service is still
accepting requests (fail-open). See [`docs/api-contracts.md`](./docs/api-contracts.md) for full semantics.

### `POST /api/contact`

Submit a contact form message. Protected by CSRF validation, rate limiting, and input sanitization.

**Request Body:**

```json
{
  "name": "string (2-100 chars, required)",
  "email": "string (valid email, required)",
  "message": "string (10-5000 chars, required)"
}
```

**Response (success):**

```json
{ "success": true, "data": { "message": "Message received successfully! We'll get back to you soon." } }
```

**Response (validation error):**

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed.", "fields": { "email": "Invalid email address." } } }
```

**Rate Limit:** 5 requests per IP per 60-second window (configurable via `CONTACT_RATE_LIMIT_MAX` / `CONTACT_RATE_LIMIT_WINDOW_MS`). Redis-backed sliding window; falls back to in-memory on Redis failure.

---

## 📬 Mail Provider Setup

### Option 1: Resend (Recommended)

1. Create a free account at [resend.com](https://resend.com)
2. Verify your sending domain
3. Generate an API key and set `RESEND_API_KEY` in `.env.local`

### Option 2: SMTP (Gmail, SendGrid, etc.)

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in `.env.local`. Example for Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
```

### Option 3: Console Fallback (Development)

If neither `RESEND_API_KEY` nor `SMTP_HOST` is set, emails are logged to `stdout` as structured JSON. This is suitable for local development only.

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Docker

```bash
docker build -t markus-ruhl-23 .
docker run -p 3000:3000 --env-file .env.local markus-ruhl-23
```

### Self-Hosted (PM2)

```bash
npm run build
pm2 start npm --name "markus-ruhl" -- start
```

### Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] `NEXT_PUBLIC_SITE_URL` points to the production domain
- [ ] DNS records are configured (A/CNAME)
- [ ] SSL/TLS is active (HTTPS)
- [ ] Mail transport is verified (send a test via `/contact`)
- [ ] Sitemap is accessible at `/sitemap.xml`
- [ ] Open Graph image loads correctly when URL is shared
- [ ] Lighthouse score targets: Performance ≥90, Accessibility 100, Best Practices 100, SEO 100

