"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Image from "next/image"

const TrophyCanvas = dynamic(() => import("./TrophyCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-2 border-[#FFFF92]/20 border-t-[#FFFF92] rounded-full animate-spin" />
    </div>
  ),
})

// --- Feature list items ---
const FEATURES = [
  "NIGHT OF CHAMPIONS WINNER",
  "129.5KG STAGE WEIGHT",
  "IFBB PRO CAREER",
  "MR. OLYMPIA TOP 5",
  "TORONTO PRO VICTORY",
  "MASS MONSTER LEGACY",
]

export default function TrophyShowcase() {
  // Check if model exists — we use the fallback image if not
  // The Canvas version activates when a .glb is placed in the trophies folder

  return (
    <section className="relative min-h-screen bg-[#0A0C13] overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,146,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,146,0.3) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Vertical grid lines like ChainGPT */}
      <div className="absolute inset-0 flex">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-gray-800/20 last:border-r-0"
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#FFFF92]/[0.03] rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-[#5867B6]/[0.03] rounded-full blur-[120px]" />

      <div className="relative z-10 h-full min-h-screen flex items-center px-6 lg:px-16 py-32">
        <div className="max-w-[1400px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* LEFT — Title + Description (like $CGPT section) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Colored accent lines */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFFF92]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#5867B6]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Bracket decoration like ChainGPT $CGPT */}
                <div className="relative inline-block mb-4">
                  <div className="absolute -left-3 top-0 h-full w-[2px] bg-gradient-to-b from-[#FFFF92] via-[#5867B6] to-transparent" />
                  <div className="absolute -left-3 top-0 w-4 h-[2px] bg-[#FFFF92]" />
                  <h2 className="text-6xl lg:text-8xl font-black leading-none pl-4">
                    <span className="bg-gradient-to-r from-[#FFFF92] via-[#FFD700] to-[#FFFF92] bg-clip-text text-transparent">
                      2002
                    </span>
                  </h2>
                </div>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-[0.3em] mt-2">
                  Best Year · Peak Performance
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-gray-500 text-sm leading-relaxed max-w-sm"
              >
                The pinnacle of mass monster bodybuilding. Night of Champions Victory
                at 129.5kg — the most extraordinary physique ever presented on the
                IFBB professional stage. An achievement that defined an era.
              </motion.p>

              {/* Audited by / Achievements badge like ChainGPT */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="space-y-3"
              >
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">
                  Achievements
                </p>
                <div className="flex items-center gap-[1px]">
                  <div className="px-4 py-2.5 bg-gray-800/40 border border-gray-700/30 rounded-l-lg">
                    <span className="text-xs font-mono text-gray-400">🏆 NOC Winner</span>
                  </div>
                  <div className="px-4 py-2.5 bg-gray-800/40 border border-gray-700/30">
                    <span className="text-xs font-mono text-gray-400">💪 129.5kg</span>
                  </div>
                  <div className="px-4 py-2.5 bg-gray-800/40 border border-gray-700/30 rounded-r-lg">
                    <span className="text-xs font-mono text-gray-400">⭐ IFBB Pro</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CENTER — 3D Trophy (rotating GLB model) */}
            <div className="lg:col-span-4 h-[500px] lg:h-[600px] relative">
              {/* Glow rings behind trophy */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  className="absolute w-[350px] h-[350px] rounded-full border border-[#FFFF92]/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute w-[420px] h-[420px] rounded-full border border-[#5867B6]/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                <div
                  className="absolute w-[300px] h-[300px] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(255,255,146,0.06) 0%, transparent 70%)" }}
                />
              </div>
              <TrophyCanvas />
            </div>

            {/* RIGHT — Feature list (like ChainGPT token features) */}
            <div className="lg:col-span-4 space-y-2">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-[10px] font-mono text-[#FFFF92]/60 uppercase tracking-[0.3em] mb-6 text-right"
              >
                Highlights of the Year
              </motion.p>

              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group relative"
                >
                  <div className="flex items-center justify-end gap-4 py-3 px-4 rounded-lg hover:bg-white/[0.02] transition-colors duration-300 cursor-default">
                    {/* Connecting line */}
                    <motion.div
                      className="h-[1px] bg-gradient-to-r from-transparent to-gray-700/50 flex-1 max-w-[100px] group-hover:to-[#FFFF92]/20 transition-colors duration-300"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.08 + 0.2 }}
                    />
                    <span className="text-sm font-mono text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors duration-300">
                      {feature}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Right side label like ChainGPT */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex justify-end pt-6"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-[1px] bg-gray-700" />
                  <span className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.2em]">
                    Best Year
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
