/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content-Security-Policy: baseline policy aligned with the tech stack.
          // 'unsafe-inline' is required for:
          //   - Next.js inline hydration scripts
          //   - Framer Motion and GSAP inline style mutations
          //   - Tailwind CSS generated class-attribute styles
          // 'unsafe-eval' is intentionally absent — Three.js and GSAP do not
          // require it in production builds.  If a future dependency needs it,
          // add it here with a documented justification.
          // Image sources mirror next.config.js remotePatterns exactly.
          // worker-src blob: is required by Three.js for offloaded geometry work.
          // object-src 'none' eliminates the Flash/plugin attack surface entirely.
          // frame-ancestors 'none' reinforces X-Frame-Options: DENY at the CSP layer.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://img.youtube.com https://i.ytimg.com https://cdn.sanity.io https://res.cloudinary.com",
              "font-src 'self' data:",
              "connect-src 'self'",
              "media-src 'self' https://res.cloudinary.com",
              "worker-src blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
