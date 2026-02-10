"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: "primary" | "ghost" | "outline"
  className?: string
  disabled?: boolean
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}: ButtonProps) {
  const baseStyles = "px-8 py-3 rounded-full font-semibold transition-all duration-300 inline-block text-center"
  
  const variants = {
    primary: "bg-gradient-to-r from-yellow to-blue text-main hover:shadow-glow-yellow",
    ghost: "bg-transparent border-2 border-yellow text-yellow hover:bg-yellow hover:text-main",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-main",
  }

  const buttonClasses = cn(
    baseStyles,
    variants[variant],
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  )

  if (href && !disabled) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <Link href={href} className={buttonClasses}>
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  )
}
