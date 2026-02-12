"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import Image from "next/image"

const LAYERS = [
  {
    number: "01",
    title: "Rise",
    subtitle: "The Foundation Era",
    description:
      "From factory worker to bodybuilding champion. Started at 54.5kg, driven by pure obsession. Every rep was a step toward greatness.",
    features: [
      { icon: "⚡", label: "NATURAL FOUNDATION", sublabel: "Raw strength built from zero" },
      { icon: "🏋️", label: "TRAINING DISCIPLINE", sublabel: "6 days/week, no excuses" },
      { icon: "🎯", label: "COMPETITIVE DEBUT", sublabel: "Amateur stage domination" },
    ],
    accentColor: "#FFFF92",
    statueImage: "/assets/images/vecteezy_golden-statue-of-a-muscular-bodybuilder-standing-on-a-rock_58066742.png",
  },
  {
    number: "02",
    title: "Peak",
    subtitle: "The Mass Monster Era",
    description:
      "Dominating the IFBB stage with unprecedented mass. 129.5kg of pure muscle at competition weight. The most extraordinary physique in history.",
    features: [
      { icon: "🏆", label: "IFBB PRO CAREER", sublabel: "14 years of dominance" },
      { icon: "💪", label: "NIGHT OF CHAMPIONS", sublabel: "Victory at peak mass" },
      { icon: "📊", label: "MR. OLYMPIA TOP 5", sublabel: "Elite-tier competitor" },
    ],
    accentColor: "#5867B6",
    statueImage: "/assets/images/vecteezy_golden-statue-of-a-muscular-male-bodybuilder-figure-on-a_58066702.png",
  },
  {
    number: "03",
    title: "Legacy",
    subtitle: "The Icon Era",
    description:
      "Inspiring millions worldwide. The discipline continues, the legacy grows. From competitor to global fitness icon and content creator.",
    features: [
      { icon: "🌍", label: "GLOBAL INFLUENCE", sublabel: "Millions of followers" },
      { icon: "🎬", label: "CONTENT CREATOR", sublabel: "YouTube & Social Media" },
      { icon: "📖", label: "MENTOR & COACH", sublabel: "Passing the torch" },
    ],
    accentColor: "#FFFF92",
    statueImage: "/assets/images/vecteezy_golden-statue-of-a-muscular-male-figure-on-marble-base_58066721.png",
  },
]

export default function LayerStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const lastIndexRef = useRef(0)
  
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const newIndex = Math.min(2, Math.floor(v * 3))
    if (newIndex !== lastIndexRef.current) {
      lastIndexRef.current = newIndex
      setActiveIndex(newIndex)
    }
  })

  const active = LAYERS[activeIndex]

  return (
    <section ref={containerRef} className="relative bg-main" style={{ height: '300vh' }}>
      {/* ——— DESKTOP: 3 columns, center sticky ——— */}
      <div className="hidden lg:flex">
        {/* LEFT — titles & descriptions */}
        <div className="flex-1 min-w-0 snap-y snap-mandatory">
          {LAYERS.map((layer) => (
            <div
              key={layer.number}
              className="min-h-screen flex items-center justify-end px-10 2xl:pl-16 2xl:pr-12 snap-start"
            >
              <div className="max-w-sm w-full py-20">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-mono font-bold"
                    style={{
                      background: `${layer.accentColor}15`,
                      color: layer.accentColor,
                      border: `1px solid ${layer.accentColor}30`,
                    }}
                  >
                    {layer.number}
                  </div>
                  <div
                    className="h-px flex-1 max-w-[60px]"
                    style={{ background: `${layer.accentColor}30` }}
                  />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl 2xl:text-7xl font-black leading-[0.85] tracking-tight mb-3"
                  style={{ color: layer.accentColor }}
                >
                  {layer.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-white/80 text-lg font-light mb-5"
                >
                  {layer.subtitle}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-500 text-sm leading-relaxed"
                >
                  {layer.description}
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-8 h-px w-full origin-left"
                  style={{
                    background: `linear-gradient(to right, ${layer.accentColor}40, transparent)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CENTER — sticky statue */}
        <div className="w-[380px] shrink-0">
          <div className="sticky top-0 h-screen flex items-center justify-center">
            <motion.div
              className="absolute w-[340px] h-[340px] rounded-full blur-[120px] opacity-[0.07]"
              animate={{ background: active.accentColor }}
              transition={{ duration: 0.3 }}
            />

            {LAYERS.map((layer, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{
                  opacity: i === activeIndex ? 1 : 0,
                  scale: i === activeIndex ? 1 : 0.88,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="relative w-[300px] h-[480px]">
                  <Image
                    src={layer.statueImage}
                    alt={layer.title}
                    fill
                    className="object-contain drop-shadow-[0_0_60px_rgba(255,215,0,0.15)]"
                    quality={90}
                    priority={i === 0}
                  />
                </div>
              </motion.div>
            ))}

            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.04, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute text-[200px] font-black leading-none select-none pointer-events-none"
              style={{ color: active.accentColor }}
            >
              {active.number}
            </motion.span>

            <div className="absolute bottom-14 flex gap-2">
              {LAYERS.map((layer, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  animate={{
                    width: i === activeIndex ? 24 : 8,
                    height: 8,
                    background: i === activeIndex ? layer.accentColor : "#374151",
                  }}
                  transition={{ duration: 0.25 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — features */}
        <div className="flex-1 min-w-0">
          {LAYERS.map((layer, index) => (
            <div
              key={layer.number}
              className="min-h-screen flex items-center px-10 2xl:pl-12 2xl:pr-16"
            >
              <div className="max-w-sm w-full py-20">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4 }}
                  className="text-[10px] font-mono uppercase tracking-[0.35em] text-gray-600 mb-6"
                >
                  Key Achievements
                </motion.p>

                <div className="space-y-3">
                  {layer.features.map((feature, fIndex) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.4, delay: fIndex * 0.1 }}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-gray-800/40 hover:border-gray-700/60 transition-all duration-300"
                    >
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `${layer.accentColor}08`,
                          border: `1px solid ${layer.accentColor}18`,
                        }}
                      >
                        <span className="text-lg">{feature.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold tracking-wide">
                          {feature.label}
                        </p>
                        {feature.sublabel && (
                          <p className="text-gray-600 text-[11px] font-mono mt-0.5 truncate">
                            {feature.sublabel}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="mt-8 flex items-center gap-3"
                >
                  <div className="flex gap-[3px]">
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        className="w-1 rounded-full transition-all duration-500"
                        style={{
                          height: j === index ? 28 : 14,
                          background: j === index ? layer.accentColor : "#1f293780",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.3em]">
                    Chapter {layer.number}
                  </span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ——— MOBILE ——— */}
      <div className="lg:hidden px-6 py-20 space-y-24">
        {LAYERS.map((layer) => (
          <div key={layer.number}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold"
                style={{
                  background: `${layer.accentColor}15`,
                  color: layer.accentColor,
                  border: `1px solid ${layer.accentColor}30`,
                }}
              >
                {layer.number}
              </div>
              <div
                className="h-px flex-1 max-w-[40px]"
                style={{ background: `${layer.accentColor}30` }}
              />
            </div>

            <h2
              className="text-5xl font-black leading-[0.85] tracking-tight mb-2"
              style={{ color: layer.accentColor }}
            >
              {layer.title}
            </h2>
            <p className="text-white/80 text-base font-light mb-3">
              {layer.subtitle}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {layer.description}
            </p>

            <div className="relative w-full h-[320px] mb-6">
              <Image
                src={layer.statueImage}
                alt={layer.title}
                fill
                className="object-contain"
                quality={85}
              />
            </div>

            <div className="space-y-3">
              {layer.features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-gray-800/40"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <div>
                    <p className="text-white text-xs font-bold tracking-wide">
                      {feature.label}
                    </p>
                    {feature.sublabel && (
                      <p className="text-gray-600 text-[11px] font-mono mt-0.5">
                        {feature.sublabel}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
