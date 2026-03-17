"use client"

import { useEffect, useRef, ReactNode } from "react"
import { motion, useInView, useAnimation, useReducedMotion, Variants } from "framer-motion"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  once?: boolean
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 20,
  once = true,
}: RevealProps) {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { once, margin: "-100px" })
  const controls = useAnimation()

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    if (shouldReduceMotion) {
      controls.start("visible")
      return
    }

    if (isInView) {
      controls.start("visible")
    } else {
      controls.start("hidden")
    }
  }, [controls, isInView, shouldReduceMotion])

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate={controls}
      variants={variants}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
