import Link from "next/link"
import Image from "next/image"
import { SOCIAL_LINKS, NAV_LINKS } from "@/lib/constants"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-b from-main to-gray-900 border-t border-blue/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Sponsors Section */}
        <div className="mb-16">
          <h3 className="text-center text-2xl font-bold mb-8 text-gray-300">
            PARTNERS
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
              >
                <Image
                  src={`/assets/img_${num}.svg`}
                  alt={`Partner ${num}`}
                  width={120}
                  height={60}
                  className="object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-bold font-raleway mb-4">
              <span className="text-yellow">MARKUS</span>
              <span className="text-white ml-2">RÜHL</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Discipline. Power. Legacy.
              <br />
              The official brand of bodybuilding legend Markus Rühl.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-yellow transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue to-purple flex items-center justify-center hover:shadow-glow-blue transition-all hover:scale-110"
                  aria-label={social.name}
                >
                  <span className="text-white text-sm font-bold">
                    {social.icon.charAt(0).toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            © {currentYear} Markus Rühl. All rights reserved.
            <span className="mx-2">|</span>
            Built with discipline and precision.
          </p>
        </div>
      </div>
    </footer>
  )
}
