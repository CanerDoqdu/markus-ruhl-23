"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface TimelinePhase {
  year: number
  phase: string
  title: string
  description: string
  image?: string
  highlights: string[]
  stat: { value: string; label: string }
}

const TIMELINE_PHASES: TimelinePhase[] = [
  {
    year: 1990,
    phase: "The Beginning",
    title: "Started Weight Training",
    description: "After a knee injury from football, Markus began training at age 18. Started at 54.5kg with intense dedication.",
    image: "/assets/images/ffac99825c53710daea7d833ee0b3b8c.jpg",
    highlights: ["First gym session at 18", "Started at 54.5kg bodyweight", "Immediate passion for iron"],
    stat: { value: "54.5kg", label: "Starting Weight" },
  },
  {
    year: 1997,
    phase: "Pro Status",
    title: "IFBB Pro Card",
    description: "Won Hessen State Champion & Germany Champion. Earned his IFBB Professional status at age 25.",
    image: "/assets/images/Markus-Ruhl.06-1.jpg",
    highlights: ["Hessen State Champion", "Germany Champion", "IFBB Pro Card earned"],
    stat: { value: "25", label: "Age at Pro Card" },
  },
  {
    year: 2000,
    phase: "Rising Star",
    title: "Toronto Pro Victory",
    description: "Won Toronto Pro and finished 2nd at Night of Champions. Established himself as an elite mass monster.",
    image: "/assets/images/wp4704738.jpg",
    highlights: ["Toronto Pro 1st Place", "Night of Champions 2nd", "Elite mass status"],
    stat: { value: "2nd", label: "Night of Champions" },
  },
  {
    year: 2002,
    phase: "Peak · Zenith",
    title: "Night of Champions Victory",
    description: "His greatest achievement. Competed at 129.5kg stage weight. Considered the most extraordinary mass physique in history.",
    image: "/assets/images/d46e04754cfeedcce04c2a2ca3594243.jpg",
    highlights: ["Night of Champions Winner", "129.5kg stage weight", "Peak mass physique"],
    stat: { value: "129.5kg", label: "Stage Weight" },
  },
  {
    year: 2004,
    phase: "Elite Competitor",
    title: "Mr. Olympia 5th Place",
    description: "Achieved his best Mr. Olympia finish at 5th place. Faced heavy competition from other elite bodybuilders.",
    image: "/assets/images/d9c3651c832578b57692ad479c2ea1a4.jpg",
    highlights: ["Mr. Olympia 5th Place", "Best Olympia result", "Elite-tier competitor"],
    stat: { value: "5th", label: "Mr. Olympia" },
  },
  {
    year: 2009,
    phase: "Farewell",
    title: "Final Competition",
    description: "New York Pro 3rd Place. Ended his legendary 14-year professional career at age 37.",
    image: "/assets/images/i.webp",
    highlights: ["New York Pro 3rd Place", "14-year pro career", "Legendary retirement"],
    stat: { value: "14", label: "Years Professional" },
  },
]

export default function InteractiveTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activePhase = TIMELINE_PHASES[activeIndex]

  return (
    <section className="relative bg-main py-32 px-6 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,146,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,146,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FFFF92]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#5867B6]/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-20 gap-6"
        >
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-mono text-[#FFFF92]/60 uppercase tracking-[0.3em] mb-4"
            >
              The Journey
            </motion.p>
            <h2 className="text-5xl lg:text-7xl font-black leading-[0.95]">
              <span className="block bg-gradient-to-r from-[#FFFF92] via-[#FFD700] to-[#FFFF92] bg-clip-text text-transparent">
                Career
              </span>
              <span className="block text-white">
                Evolution
              </span>
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed font-light lg:text-right">
            From 54.5kg beginner to the most massive bodybuilder in history.
            A 14-year journey of relentless growth and dominance.
          </p>
        </motion.div>

        {/* Main content: 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">

          {/* LEFT — Numbered navigation list */}
          <div className="lg:col-span-4 lg:border-r lg:border-gray-800/50 lg:pr-8">
            <div className="space-y-1">
              {TIMELINE_PHASES.map((phase, index) => (
                <motion.button
                  key={phase.year}
                  onClick={() => setActiveIndex(index)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className={`w-full group flex items-center gap-4 py-4 px-4 rounded-lg text-left transition-all duration-300 ${
                    activeIndex === index
                      ? "bg-gradient-to-r from-[#FFFF92]/10 to-transparent border-l-2 border-[#FFFF92]"
                      : "hover:bg-white/[0.02] border-l-2 border-transparent"
                  }`}
                >
                  {/* Number */}
                  <span className={`text-xs font-mono w-6 transition-colors duration-300 ${
                    activeIndex === index ? "text-[#FFFF92]" : "text-gray-700"
                  }`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Year + Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold transition-colors duration-300 ${
                        activeIndex === index ? "text-[#FFFF92]" : "text-gray-500 group-hover:text-gray-300"
                      }`}>
                        {phase.year}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                        activeIndex === index ? "text-[#5867B6]" : "text-gray-700"
                      }`}>
                        {phase.phase}
                      </span>
                    </div>
                    <p className={`text-sm truncate transition-colors duration-300 ${
                      activeIndex === index ? "text-white" : "text-gray-600 group-hover:text-gray-400"
                    }`}>
                      {phase.title}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className={`w-4 h-4 transition-all duration-300 ${
                      activeIndex === index
                        ? "text-[#FFFF92] translate-x-0 opacity-100"
                        : "text-gray-700 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6 px-4">
              <div className="h-[2px] bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FFFF92] to-[#5867B6]"
                  animate={{ width: `${((activeIndex + 1) / TIMELINE_PHASES.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-mono text-gray-700">1990</span>
                <span className="text-[10px] font-mono text-gray-700">2009</span>
              </div>
            </div>
          </div>

          {/* CENTER — Image / Visual */}
          <div className="lg:col-span-4 flex items-center justify-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-sm"
              >
                {activePhase.image ? (
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                    <Image
                      src={activePhase.image}
                      alt={activePhase.title}
                      fill
                      className="object-cover"
                      quality={85}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C13] via-transparent to-[#0A0C13]/30" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[#FFFF92] rounded-full" />
                        <div>
                          <p className="text-white font-bold text-sm">{activePhase.title}</p>
                          <p className="text-gray-400 text-xs">{activePhase.year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* No image — decorative placeholder */
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0e1017] to-[#0A0C13] border border-gray-800/30">
                    {/* Animated rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="absolute w-48 h-48 rounded-full border border-[#FFFF92]/10"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute w-32 h-32 rounded-full border border-[#5867B6]/20"
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="text-center z-10">
                        <p className="text-5xl font-black bg-gradient-to-b from-[#FFFF92] to-[#FFFF92]/30 bg-clip-text text-transparent">
                          {activePhase.stat.value}
                        </p>
                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mt-2">
                          {activePhase.stat.label}
                        </p>
                      </div>
                    </div>
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage: `radial-gradient(rgba(255,255,146,0.5) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[#5867B6] rounded-full" />
                        <div>
                          <p className="text-white font-bold text-sm">{activePhase.title}</p>
                          <p className="text-gray-500 text-xs">{activePhase.year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT — Details panel */}
          <div className="lg:col-span-4 lg:border-l lg:border-gray-800/50 lg:pl-8 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Phase badge */}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-[#FFFF92]/10 border border-[#FFFF92]/20">
                    <span className="text-[10px] font-mono text-[#FFFF92] uppercase tracking-widest">
                      {activePhase.phase}
                    </span>
                  </div>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-gray-800 to-transparent" />
                </div>

                {/* Year + Title */}
                <div>
                  <p className="text-6xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent leading-none">
                    {activePhase.year}
                  </p>
                  <h3 className="text-xl font-bold text-white mt-2">
                    {activePhase.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {activePhase.description}
                </p>

                {/* Highlights */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                    Key Highlights
                  </p>
                  {activePhase.highlights.map((highlight, i) => (
                    <motion.div
                      key={highlight}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 bg-[#FFFF92]/60 rotate-45 flex-shrink-0" />
                      <span className="text-sm text-gray-400">{highlight}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stat card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFFF92]/5 to-transparent border border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-[#FFFF92]">
                        {activePhase.stat.value}
                      </p>
                      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                        {activePhase.stat.label}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#FFFF92]/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#FFFF92]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 pt-12 border-t border-gray-800/30"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "14", label: "Years Professional", suffix: "yrs" },
              { value: "129.5", label: "Peak Stage Weight", suffix: "kg" },
              { value: "148", label: "Off-Season Weight", suffix: "kg" },
              { value: "171", label: "Mass Increase", suffix: "%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center lg:text-left"
              >
                <div className="flex items-baseline gap-1 justify-center lg:justify-start">
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-sm font-mono text-[#FFFF92]">{stat.suffix}</span>
                </div>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
