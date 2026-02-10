"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid"
import { NAV_LINKS } from "@/lib/constants"
import useMediaQuery from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const isActive = (href: string) => {
    if (href === "/#home") return pathname === "/"
    return pathname.startsWith(href.replace("/#", "/"))
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-gradient-to-b from-main via-main/95 to-transparent backdrop-blur-sm border-b border-blue/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold font-raleway tracking-tighter">
              <span className="text-yellow">MARKUS</span>
              <span className="text-white ml-2">RÜHL</span>
            </Link>

            {/* Desktop Navigation */}
            {isDesktop ? (
              <div className="flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-sm font-semibold tracking-wide transition-all duration-300 hover:text-yellow relative group",
                      isActive(link.href) ? "text-yellow" : "text-gray-300"
                    )}
                  >
                    {link.name}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-0.5 bg-yellow transition-all duration-300",
                        isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                      )}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              /* Mobile Menu Button */
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-gradient-to-r from-blue to-purple hover:shadow-glow-blue transition-all"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-white" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-white" />
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {!isDesktop && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[72px] bg-main/98 backdrop-blur-lg z-40"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8 pb-20">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "text-2xl font-bold tracking-wide transition-all duration-300 hover:text-yellow",
                      isActive(link.href) ? "text-yellow" : "text-white"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
