"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid"
import { NAV_LINKS } from "@/lib/constants"
import useMediaQuery from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const shouldReduceMotion = useReducedMotion()
  const menuRef = useRef<HTMLElement>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null)

  // Close on desktop resize
  useEffect(() => {
    if (isDesktop && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [isDesktop, isMenuOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  // Close on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Escape key handler
  useEffect(() => {
    if (!isMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false)
        toggleBtnRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen])

  // Focus trap inside mobile menu
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !menuRef.current) return

    const focusable = menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  // Auto-focus first menu link when menu opens
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      first?.focus()
    }
  }, [isMenuOpen])

  const isActive = (href: string) => {
    if (href === "/#home") return pathname === "/"
    return pathname.startsWith(href.replace("/#", "/"))
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-gradient-to-b from-main via-main/95 to-transparent backdrop-blur-sm border-b border-blue/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
              <Link href="/" className="text-xl sm:text-2xl font-bold font-raleway tracking-tighter">
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
                      "text-sm font-semibold tracking-wide transition-all duration-300 motion-reduce:transition-none hover:text-yellow relative group",
                      isActive(link.href) ? "text-yellow" : "text-gray-300"
                    )}
                  >
                    {link.name}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-0.5 bg-yellow transition-all duration-300 motion-reduce:transition-none",
                        isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                      )}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              /* Mobile Menu Button */
              <button
                ref={toggleBtnRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-gradient-to-r from-blue to-purple hover:shadow-glow-blue transition-all motion-reduce:transition-none"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
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
          <motion.nav
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            onKeyDown={handleMenuKeyDown}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
            className="fixed inset-x-0 top-[72px] bottom-0 bg-main/98 backdrop-blur-lg z-40 overflow-y-auto"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8 pb-20">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "text-2xl font-bold tracking-wide transition-all duration-300 motion-reduce:transition-none hover:text-yellow",
                      isActive(link.href) ? "text-yellow" : "text-white"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
