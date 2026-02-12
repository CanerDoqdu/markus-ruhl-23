"use client"

import { motion } from "framer-motion"

export default function LoadingSkeleton() {
  return (
    <div className="fixed inset-0 bg-main z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            MARKUS RÜHL
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-2 font-mono">
            Loading Excellence...
          </p>
        </motion.div>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-[#5867B6] via-[#FFFF92] to-[#FF6B35]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>

        {/* Pulsing dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#FFFF92]"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
