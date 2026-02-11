"use client"

import Reveal from "@/components/motion/Reveal"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"
import { motion } from "framer-motion"
import Image from "next/image"

const PRINCIPLES = [
  { title: "NO SHORTCUTS", desc: "Every rep earned, never given" },
  { title: "ONLY RESULTS", desc: "Numbers don't lie, neither does the mirror" },
  { title: "PURE POWER", desc: "Strength beyond limits, mass beyond measure" },
  { title: "TOTAL COMMITMENT", desc: "24 hours a day, 365 days a year" },
]

export default function Discipline() {
  return (
    <section className="relative min-h-screen bg-main overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,146,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,146,0.4) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left — Image + overlay text */}
        <div className="relative hidden lg:block">
          <div className="sticky top-0 h-screen">
            <Image
              src="/assets/images/Markus-Ruhl.06-1.jpg"
              alt="Markus Rühl"
              fill
              className="object-cover grayscale"
              quality={80}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-main/30 via-main/60 to-main" />
            <div className="absolute inset-0 bg-gradient-to-t from-main via-transparent to-main/80" />

            {/* Large "THE CODE" text */}
            <div className="absolute inset-0 flex flex-col justify-center px-12">
              <Reveal>
                <p className="text-xs font-mono uppercase tracking-[0.4em] text-yellow/70 mb-4">
                  Principles of Iron
                </p>
                <h2 className="text-7xl xl:text-8xl 2xl:text-9xl font-black text-white leading-[0.85] tracking-tighter">
                  THE
                  <br />
                  <span className="text-yellow glow-text-yellow">CODE</span>
                </h2>
                <div className="mt-6 flex gap-1">
                  <div className="w-12 h-1 bg-yellow rounded-full" />
                  <div className="w-6 h-1 bg-blue rounded-full" />
                  <div className="w-3 h-1 bg-gray-600 rounded-full" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Right — Principles */}
        <div className="relative flex flex-col justify-center py-24 lg:py-32 px-6 lg:px-16">
          {/* Mobile heading */}
          <Reveal className="lg:hidden mb-16 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.4em] text-yellow/70 mb-4">
              Principles of Iron
            </p>
            <h2 className="text-6xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter">
              THE <span className="text-yellow glow-text-yellow">CODE</span>
            </h2>
            <div className="mt-6 flex gap-1 justify-center">
              <div className="w-12 h-1 bg-yellow rounded-full" />
              <div className="w-6 h-1 bg-blue rounded-full" />
              <div className="w-3 h-1 bg-gray-600 rounded-full" />
            </div>
          </Reveal>

          <StaggerContainer className="space-y-0">
            {PRINCIPLES.map((principle, index) => (
              <StaggerItem key={principle.title}>
                <motion.div
                  whileHover={{ x: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="group relative border-b border-gray-800/50 hover:border-yellow/30 transition-colors duration-500"
                >
                  {/* Hover highlight bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-yellow scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                  <div className="py-10 lg:py-12 pl-6 lg:pl-10 pr-4 flex items-start gap-6 lg:gap-8">
                    {/* Number */}
                    <span
                      className="text-5xl lg:text-6xl font-black leading-none tabular-nums transition-colors duration-500"
                      style={{ color: index % 2 === 0 ? "#FFFF92" : "#5867B6" }}
                    >
                      0{index + 1}
                    </span>

                    {/* Text */}
                    <div className="flex-1 pt-1">
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none group-hover:text-yellow transition-colors duration-500">
                        {principle.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-3 font-raleway leading-relaxed group-hover:text-gray-400 transition-colors duration-500">
                        {principle.desc}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="pt-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <svg className="w-5 h-5 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Quote */}
          <Reveal delay={0.4} className="mt-16 lg:mt-20 pl-6 lg:pl-10 border-l-2 border-blue/30">
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-raleway italic">
              &ldquo;Success isn&apos;t given. It&apos;s earned through discipline, sacrifice,
              and an unwavering commitment to excellence.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-5">
              <div className="w-8 h-[1px] bg-yellow" />
              <p className="text-yellow font-bold text-sm tracking-wide uppercase">Markus Rühl</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
