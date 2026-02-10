"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface TimelinePhase {
  year: number
  phase: string
  title: string
  description: string
  image?: string
}

const TIMELINE_PHASES: TimelinePhase[] = [
  {
    year: 1990,
    phase: "The Beginning",
    title: "Started Weight Training",
    description: "After a knee injury from football, Markus began training at age 18. Started at 54.5kg with intense dedication.",
    image: "/assets/images/ffac99825c53710daea7d833ee0b3b8c.jpg",
  },
  {
    year: 1997,
    phase: "Pro Status",
    title: "IFBB Pro Card",
    description: "Won Hessen State Champion & Germany Champion. Earned his IFBB Professional status at age 25.",
    image: "/assets/images/Markus_Ruhl_ce73e683-0b72-458d-bdc1-baa6c9d192c6.webp",
  },
  {
    year: 2000,
    phase: "Rising Star",
    title: "Toronto Pro Victory",
    description: "Won Toronto Pro and finished 2nd at Night of Champions. Established himself as an elite mass monster.",
    image: "/assets/images/wp4704738.jpg",
  },
  {
    year: 2002,
    phase: "PEAK - ZENITH",
    title: "Night of Champions Victory",
    description: "His greatest achievement. Competed at 129.5kg stage weight. Considered the most extraordinary mass physique in history.",
  },
  {
    year: 2004,
    phase: "Elite Competitor",
    title: "Mr. Olympia 5th Place",
    description: "Achieved his best Mr. Olympia finish at 5th place. Faced heavy competition from other elite bodybuilders.",
    image: "/assets/images/Markus_Ruhl_ce73e683-0b72-458d-bdc1-baa6c9d192c6.webp",
  },
  {
    year: 2009,
    phase: "Farewell",
    title: "Final Competition",
    description: "New York Pro 3rd Place. Ended his legendary 14-year professional career at age 37.",
    image: "/assets/images/ffac99825c53710daea7d833ee0b3b8c.jpg",
  },
]

export default function InteractiveTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(Math.floor(TIMELINE_PHASES.length / 2))
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    
    const handleMouseDown = () => setIsDragging(true)
    const handleMouseUp = () => setIsDragging(false)

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const index = Math.round(percentage * (TIMELINE_PHASES.length - 1))
      setCurrentIndex(index)
    }

    const handleTouchStart = () => setIsDragging(true)
    const handleTouchEnd = () => setIsDragging(false)

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !container) return
      const rect = container.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const index = Math.round(percentage * (TIMELINE_PHASES.length - 1))
      setCurrentIndex(index)
    }

    container?.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchend", handleTouchEnd)
    window.addEventListener("touchmove", handleTouchMove)

    return () => {
      container?.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [isDragging])

  const currentPhase = TIMELINE_PHASES[currentIndex]
  const percentage = (currentIndex / (TIMELINE_PHASES.length - 1)) * 100

  return (
    <section className="relative min-h-screen bg-main py-20 px-6 overflow-hidden">
      {currentPhase.image && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute inset-0"
        >
          <Image
            src={currentPhase.image}
            alt={currentPhase.phase}
            fill
            className="object-cover"
            quality={75}
          />
        </motion.div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl lg:text-7xl font-bold mb-4">
            <span className="text-yellow glow-text-yellow">CAREER</span>
            {" "}
            <span className="text-gray-200">EVOLUTION</span>
          </h2>
          <p className="text-gray-400 text-xl">Drag to explore the journey</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-6xl font-bold text-yellow mb-2">
              {currentPhase.year}
            </div>
            <div className="text-2xl text-blue font-bold mb-4">
              {currentPhase.phase}
            </div>
            <h3 className="text-3xl font-bold text-gray-200 mb-4">
              {currentPhase.title}
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              {currentPhase.description}
            </p>
          </motion.div>

          {currentPhase.image && (
            <motion.div
              key={`img-${currentIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="relative h-96 rounded-lg overflow-hidden"
            >
              <Image
                src={currentPhase.image}
                alt={currentPhase.phase}
                fill
                className="object-cover"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          )}
        </div>

        <div
          ref={containerRef}
          className="relative mt-20 py-12 cursor-pointer select-none"
        >
          <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow to-blue"
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow rounded-full shadow-lg cursor-grab active:cursor-grabbing border-2 border-blue hover:scale-125 transition-transform"
            animate={{ left: `${percentage}%` }}
            transition={{ duration: 0.1 }}
            style={{ marginLeft: "-16px" }}
          >
            <div className="absolute inset-1 bg-white/20 rounded-full animate-pulse" />
          </motion.div>

          <div className="absolute top-16 w-full flex justify-between text-xs text-gray-500 px-4">
            {TIMELINE_PHASES.map((phase) => (
              <span key={phase.year}>{phase.year}</span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 pt-12 border-t border-gray-700"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow mb-2">14</div>
            <p className="text-gray-400">Years Professional</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow mb-2">129.5kg</div>
            <p className="text-gray-400">Peak Stage Weight</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow mb-2">148kg</div>
            <p className="text-gray-400">Off-Season Weight</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow mb-2">171%</div>
            <p className="text-gray-400">Mass Increase</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
