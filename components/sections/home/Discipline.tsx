"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Reveal from "@/components/motion/Reveal"

const steps = [
  { step: "01", title: "MINDSET", desc: "Mental foundation", color: "#5867B6" },
  { step: "02", title: "TRAINING", desc: "Heavy compounds", color: "#FFFF92" },
  { step: "03", title: "NUTRITION", desc: "Fuel the machine", color: "#FF6B35" },
  { step: "04", title: "RECOVERY", desc: "Rebuild & grow", color: "#22d3ee" },
  { step: "05", title: "DISCIPLINE", desc: "Daily execution", color: "#5867B6" },
  { step: "06", title: "RESULTS", desc: "Champion physique", color: "#FFFF92" },
]

export default function Discipline() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  return (
    <section className="relative bg-main overflow-hidden py-16 lg:py-24">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,146,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,146,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Header */}

        <Reveal>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight">
            The Code
          </h2>
          <p className="text-gray-500 text-lg mb-16 max-w-xl">
            The systematic algorithm behind championship-level mass.
          </p>
        </Reveal>

        {/* Algorithm Grid with Arrows */}
        <div className="relative">
          {/* SVG Connection Arrows - Desktop only */}
          <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {/* Row 1: 01 -> 02 */}
            <path d="M 280 60 L 320 60 L 320 60 L 360 60" stroke="#4a4a5a" strokeWidth="1.5" fill="none" />
            <polygon points="358,56 368,60 358,64" fill="#4a4a5a" />
            
            {/* Row 1: 02 -> 03 */}
            <path d="M 640 60 L 680 60 L 680 60 L 720 60" stroke="#4a4a5a" strokeWidth="1.5" fill="none" />
            <polygon points="718,56 728,60 718,64" fill="#4a4a5a" />
            
            {/* Row 1 to Row 2: 03 -> 04 (corner arrow down) */}
            <path d="M 900 100 L 900 140 L 900 180" stroke="#4a4a5a" strokeWidth="1.5" fill="none" />
            <polygon points="896,178 900,188 904,178" fill="#4a4a5a" />
            
            {/* Row 2: 04 <- 05 (right to left) */}
            <path d="M 720 220 L 680 220 L 640 220" stroke="#4a4a5a" strokeWidth="1.5" fill="none" />
            <polygon points="642,224 632,220 642,216" fill="#4a4a5a" />
            
            {/* Row 2: 05 <- 06 */}
            <path d="M 360 220 L 320 220 L 280 220" stroke="#4a4a5a" strokeWidth="1.5" fill="none" />
            <polygon points="282,224 272,220 282,216" fill="#4a4a5a" />
          </svg>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 relative z-10">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group"
              >
                {/* Small Card with Code-style effect */}
                <div 
                  className="relative p-4 rounded-xl border border-gray-800/80 transition-all duration-300 group-hover:border-gray-600 overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, rgba(15,15,18,0.95) 0%, rgba(10,10,12,0.98) 100%)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                >
                  {/* Animated scanline effect - Desktop only */}
                  {!isMobile && (
                    <motion.div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `repeating-linear-gradient(
                          0deg,
                          transparent 0px,
                          transparent 2px,
                          ${item.color}08 2px,
                          ${item.color}08 3px
                        )`,
                      }}
                      animate={{ 
                        backgroundPosition: ["0px 0px", "0px 10px"],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}

                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm opacity-40 group-hover:opacity-60 transition-opacity" style={{ borderColor: item.color }} />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm opacity-40 group-hover:opacity-60 transition-opacity" style={{ borderColor: item.color }} />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm opacity-40 group-hover:opacity-60 transition-opacity" style={{ borderColor: item.color }} />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 rounded-br-sm opacity-40 group-hover:opacity-60 transition-opacity" style={{ borderColor: item.color }} />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Step number */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold mb-3 transition-all duration-300"
                      style={{
                        background: `${item.color}12`,
                        color: item.color,
                        border: `1px solid ${item.color}30`,
                        boxShadow: `0 0 10px ${item.color}20`
                      }}
                    >
                      {item.step}
                    </div>

                    {/* Title */}
                    <h3 
                      className="text-sm font-bold tracking-wide mb-1 font-mono"
                      style={{ color: item.color }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs font-mono">{item.desc}</p>
                  </div>

                  {/* Plus button */}
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-md border border-gray-700/50 bg-[#0a0a0c] flex items-center justify-center text-gray-600 text-xs cursor-pointer hover:border-gray-600 transition-all hover:bg-gray-800/50 z-20">
                    +
                  </div>

                  {/* Hover glow ring */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ 
                      boxShadow: `0 0 40px ${item.color}15, inset 0 0 20px ${item.color}05`,
                    }}
                  />

                  {/* Animated border gradient on hover - Desktop only */}
                  {!isMobile && (
                    <motion.div 
                      className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100"
                      style={{
                        background: `conic-gradient(from 0deg, ${item.color}40, ${item.color}00)`,
                        filter: "blur(8px)",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>

                {/* Mobile arrow */}
                {i < steps.length - 1 && (
                  <div className="flex md:hidden justify-center py-2">
                    <span className="text-gray-600 text-xs">↓</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <Reveal delay={0.2}>
          <div className="mt-16 flex justify-center">
            <div className="pl-5 border-l-2 border-[#5867B6]/40">
              <p className="text-gray-400 italic text-lg">&ldquo;No shortcuts. Only results.&rdquo;</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-6 h-px bg-[#FFFF92]/50" />
                <p className="text-[#FFFF92] font-bold text-sm uppercase tracking-wide">Markus Rühl</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
