import Link from "next/link"
import Image from "next/image"
import { SOCIAL_LINKS, NAV_LINKS } from "@/lib/constants"

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  twitter: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  facebook: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-main">
      {/* Top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-800/60 to-transparent" />

      {/* ——— Partners strip ——— */}
      <div className="border-b border-gray-800/30">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-600 text-center mb-8">
            Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-400"
              >
                <Image
                  src={`/assets/img_${num}.svg`}
                  alt={`Partner ${num}`}
                  width={110}
                  height={50}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ——— Main footer ——— */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand — spans 5 cols */}
          <div className="md:col-span-5">
            <h2 className="text-2xl font-black font-raleway tracking-tight mb-4">
              <span className="text-yellow">MARKUS</span>
              <span className="text-white ml-2">RÜHL</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
              The official brand experience of bodybuilding legend Markus Rühl.
              Discipline. Power. Legacy.
            </p>

            {/* Social icons row */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-lg border border-gray-800/60 flex items-center justify-center text-gray-500 hover:text-yellow hover:border-yellow/30 transition-all duration-300"
                >
                  {SOCIAL_ICONS[social.icon] ?? (
                    <span className="text-xs font-bold">{social.name[0]}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation — spans 3 cols */}
          <div className="md:col-span-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-gray-600 mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-yellow transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / CTA — spans 4 cols */}
          <div className="md:col-span-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-gray-600 mb-5">
              Get In Touch
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              For business inquiries, coaching, and event bookings.
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 text-sm font-bold text-yellow hover:text-white transition-colors duration-300"
            >
              <span className="w-8 h-8 rounded-full border border-yellow/40 flex items-center justify-center group-hover:bg-yellow group-hover:text-main transition-all duration-300">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* ——— Bottom bar ——— */}
      <div className="border-t border-gray-800/30">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-700 text-xs font-mono">
            &copy; {currentYear} Markus Rühl. All rights reserved.
          </p>
          <p className="text-gray-800 text-[10px] font-mono uppercase tracking-[0.3em]">
            Discipline &middot; Power &middot; Legacy
          </p>
        </div>
      </div>
    </footer>
  )
}
