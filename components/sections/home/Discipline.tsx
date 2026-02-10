"use client"

import Reveal from "@/components/motion/Reveal"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

const PRINCIPLES = [
  "NO SHORTCUTS",
  "ONLY RESULTS",
  "PURE POWER",
  "TOTAL COMMITMENT",
]

export default function Discipline() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-32 px-6 bg-main">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,103,182,0.05),transparent_70%)]" />
      
      <div className="relative max-w-7xl mx-auto w-full">
        <Reveal className="mb-20 text-center">
          <h2 className="text-cinematic text-white mb-6">
            THE CODE
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow to-blue mx-auto" />
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {PRINCIPLES.map((principle, index) => (
            <StaggerItem key={principle}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue/10 to-purple/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative p-12 border border-blue/20 rounded-2xl bg-main/50 backdrop-blur-sm hover:border-yellow/50 transition-all duration-500">
                  <span className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-800 absolute top-8 left-8">
                    0{index + 1}
                  </span>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-16 tracking-tight leading-none">
                    {principle}
                  </h3>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <Reveal delay={0.6} className="mt-20 text-center">
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-raleway">
            "Success isn't given. It's earned through discipline, sacrifice, and 
            an unwavering commitment to excellence. Every rep, every meal, every 
            moment counts."
          </p>
          <p className="text-yellow font-bold mt-6 text-lg">— Markus Rühl</p>
        </Reveal>
      </div>
    </section>
  )
}
