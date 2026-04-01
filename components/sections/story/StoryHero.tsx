"use client"

import { motion } from "framer-motion"

export default function StoryHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-main via-blue/10 to-main overflow-hidden px-4 sm:px-6">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,103,182,0.1),transparent_70%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black mb-6 leading-none">
          <span className="text-white">THE</span>
          <br />
          <span className="text-yellow glow-text-yellow">STORY</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg md:text-2xl max-w-2xl mx-auto">
          From factory worker to bodybuilding legend. The journey of discipline, sacrifice, and unwavering determination.
        </p>
      </motion.div>
    </section>
  )
}
