# Markus Rühl - Cinematic Brand Experience

A premium, performance-focused Next.js website showcasing the legacy of bodybuilding legend Markus Rühl. Built with discipline and precision.

## 🎯 Project Overview

This is a complete refactor from Vite+React to Next.js 15, transforming a half-finished portfolio into a cinematic brand experience featuring:

- **Dark, powerful, minimal aesthetic** inspired by Markus Rühl's legendary presence
- **3D hero scene** with Three.js (desktop only for performance)
- **GSAP scroll choreography** for cinematic timeline animations
- **Framer Motion** for smooth reveals and transitions
- **Performance-first architecture** with lazy loading and optimized assets

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion + GSAP
- **3D:** Three.js via @react-three/fiber + @react-three/drei
- **Smooth Scroll:** Lenis (optional, test performance)

## 📂 Project Structure

```
app/
  (site)/           # Main site routes
    layout.tsx
    page.tsx        # Home page
    story/          # /story route
    training/       # /training route
    media/          # /media route
    legacy/         # /legacy route
    contact/        # /contact route
  api/              # API routes
    contact/        # Form submission endpoint
  layout.tsx        # Root layout
  globals.css       # Global styles

components/
  layout/           # Header, Footer
  sections/         # Page sections
    hero/
    home/
    story/
    training/
    media/
    legacy/
    contact/
  motion/           # Framer Motion wrappers
  three/            # 3D components
  shared/           # Reusable components

lib/
  constants.ts      # Site configuration
  utils.ts          # Utility functions

types/
  index.ts          # TypeScript types

hooks/
  useMediaQuery.ts
  useSmoothScroll.ts

public/
  assets/           # Static assets
    images/
    videos/
    3d/
    textures/
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd markus-ruhl-23
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### ⚠️ 3D Scene Currently Disabled

The 3D hero scene is disabled by default due to React Three Fiber compatibility issues with the current React 18.3.1 setup. The site works perfectly without it using gradient overlays instead.

**To enable 3D (experimental):**
1. Create `.env.local` file:
```bash
NEXT_PUBLIC_ENABLE_3D=true
```

2. Ensure React Three Fiber dependencies are compatible:
```bash
npm install @react-three/fiber@latest @react-three/drei@latest three@latest
```

**Alternative:** Remove Three.js dependencies entirely if you don't need 3D:
```bash
npm uninstall @react-three/fiber @react-three/drei three @types/three
```
Then delete `components/three/` directory.

### Build for Production

```bash
npm run build
npm run start
```

## 📦 Adding Assets

### 1. 3D Models

Place your 3D model (`.glb` or `.gltf`) in `public/assets/3d/`:
- Replace placeholder: `hero-model.glb.placeholder`
- Recommended: < 500KB, optimized with [glTF Transform](https://gltf-transform.donmccurdy.com/)
- Update path in `components/three/HeroScene.tsx` if needed

### 2. Images

Add photos to `public/assets/images/`:
- Use WebP format for best compression
- Compress images before uploading (use [Squoosh](https://squoosh.app/))
- Recommended max width: 1920px

Update image references in:
- `components/sections/home/MediaPreview.tsx`
- `app/(site)/media/page.tsx`

### 3. Videos

Add videos to `public/assets/videos/`:
- Use H.264 codec (MP4) for best compatibility
- Compress videos (use [HandBrake](https://handbrake.fr/))
- Recommended: < 10MB per video, 1080p max
- Add poster images for thumbnails

### 4. Grain Texture

Add subtle grain overlay:
- Place `grain.png` in `public/assets/textures/`
- 512x512px, low opacity noise texture
- Creates cinematic film grain effect

### 5. Favicon

Replace default favicon:
- Add `favicon.ico`, `favicon-16x16.png`, `apple-touch-icon.png` to `public/`

### 6. Open Graph Image

Add social media preview image:
- Add `og-image.jpg` to `public/` (1200x630px)

## ⚙️ Configuration

### Update Site Information

Edit `lib/constants.ts`:
- Social media links
- Contact information
- Site metadata

### Update Colors

Edit `tailwind.config.js`:
- Primary colors: yellow, blue, main
- Add custom gradients or effects

### Email Service Integration

Update `app/api/contact/route.ts`:
- Integrate with [Resend](https://resend.com/) or [SendGrid](https://sendgrid.com/)
- Add API keys to environment variables
- Create `.env.local` file (see `.env.example`)

## 🎨 Customization

### Change Fonts

Edit `app/layout.tsx`:
```typescript
import { YourFont } from "next/font/google"
```

### Modify 3D Scene

Edit `components/three/HeroScene.tsx`:
- Adjust lighting, camera position, rotation speed
- Disable 3D on mobile (already implemented)

### Adjust Animations

- **Framer Motion:** Edit `components/motion/Reveal.tsx`
- **GSAP Timeline:** Edit `components/sections/home/Timeline.tsx`
- **Scroll Progress:** Edit `components/motion/ScrollProgress.tsx`

## 🚀 Performance Notes

### Current Optimizations

✅ 3D scene lazy-loaded with dynamic import  
✅ 3D disabled on mobile (< 1024px)  
✅ Images lazy-loaded with `next/image`  
✅ GSAP plugins loaded on-demand  
✅ Smooth scroll is conditional  

### Testing Performance

1. Run Lighthouse audit:
```bash
npm run build
npm run start
# Open Chrome DevTools > Lighthouse
```

2. Target scores:
   - Performance: > 85
   - Accessibility: > 90
   - SEO: > 95

### If Performance Issues

- **Disable Lenis smooth scroll:** Remove `useSmoothScroll()` hook usage
- **Reduce 3D complexity:** Simplify model or lower poly count
- **Optimize images further:** Use smaller dimensions or lower quality
- **Remove animations:** Comment out heavy GSAP effects

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Configure environment variables if needed
4. Deploy automatically on push

### Other Platforms

- **Netlify:** Configure build command: `npm run build`, publish directory: `.next`
- **Self-hosted:** Use `npm run start` with PM2 or similar

## 🐛 Troubleshooting

### 3D Scene Not Loading

- Check browser console for errors
- Ensure 3D model path is correct
- Try on desktop (3D disabled on mobile)

### Smooth Scroll Laggy

- Disable Lenis in `app/(site)/layout.tsx`
- Use native CSS `scroll-behavior: smooth`

### Build Errors

- Run `npm run type-check` to find TypeScript issues
- Delete `.next` folder and rebuild
- Clear node_modules: `rm -rf node_modules && npm install`

### Images Not Showing

- Check file paths (case-sensitive)
- Ensure images are in `public/` directory
- Check Next.js Image configuration in `next.config.js`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)
- [GSAP Documentation](https://greensock.com/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

Markus Rühl Official  
Built with discipline and precision.

---

**Note:** This project uses placeholder content and assets. Replace with actual content, models, images, and videos before production deployment.
