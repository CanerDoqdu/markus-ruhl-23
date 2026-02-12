"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface GalleryCard {
  title: string
  image?: string
  stats: { label: string; value: string }[]
}

const GALLERY_ITEMS: GalleryCard[] = [
  {
    title: "Competition Posing",
    image: "/assets/images/wp4704738.jpg",
    stats: [
      { label: "SHOWS COMPETED", value: "50+" },
      { label: "PRO VICTORIES", value: "4" },
    ],
  },
  {
    title: "Training Sessions",
    image: "/assets/images/ffac99825c53710daea7d833ee0b3b8c.jpg",
    stats: [
      { label: "YEARS TRAINING", value: "35+" },
      { label: "DAYS PER WEEK", value: "6" },
    ],
  },
  {
    title: "Stage Presence",
    image: "/assets/images/d46e04754cfeedcce04c2a2ca3594243.jpg",
    stats: [
      { label: "STAGE WEIGHT", value: "129.5KG" },
      { label: "OFF-SEASON PEAK", value: "148KG" },
    ],
  },
  {
    title: "Mass Monster Era",
    image: "/assets/images/Markus-Ruhl.06-1.jpg",
    stats: [
      { label: "MASS INCREASE", value: "171%" },
      { label: "STARTING WEIGHT", value: "54.5KG" },
    ],
  },
  {
    title: "Mr. Olympia",
    image: "/assets/images/d9c3651c832578b57692ad479c2ea1a4.jpg",
    stats: [
      { label: "BEST PLACEMENT", value: "5TH" },
      { label: "OLYMPIA APPEARANCES", value: "6" },
    ],
  },
  {
    title: "Night of Champions",
    image: "/assets/images/i (1).webp",
    stats: [
      { label: "NOC VICTORIES", value: "1" },
      { label: "TOP 3 FINISHES", value: "3" },
    ],
  },
  {
    title: "Magazine Features",
    image: "/assets/images/magazine.jpg",
    stats: [
      { label: "COVER FEATURES", value: "50+" },
      { label: "GLOBAL REACH", value: "WORLDWIDE" },
    ],
  },
  {
    title: "Legacy & Coaching",
    image: "/assets/images/marcus image.jpeg",
    stats: [
      { label: "PRO CAREER", value: "14 YRS" },
      { label: "STATUS", value: "LEGEND" },
    ],
  },
]

export default function MediaPreview() {
  return (
    <section className="relative py-32 px-6 bg-[#0A0C13] overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,146,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,146,0.3) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6"
        >
          <div>
            <p className="text-xs font-mono text-[#FFFF92]/60 uppercase tracking-[0.3em] mb-4">
              The Archive
            </p>
            <h2 className="text-5xl lg:text-7xl font-black leading-[0.95]">
              <span className="block bg-gradient-to-r from-[#FFFF92] via-[#FFD700] to-[#FFFF92] bg-clip-text text-transparent">
                Gallery
              </span>
              <span className="block text-white">& Stats</span>
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed font-light lg:text-right">
            Decades of dominance captured in moments. The power, the passion, the legacy — all in numbers.
          </p>
        </motion.div>

        {/* Cards grid — 4 columns like ChainGPT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-800/30">
          {GALLERY_ITEMS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative bg-[#0A0C13] hover:bg-[#0e1017] transition-colors duration-300 flex flex-col"
            >
              {/* Image / Icon area */}
              <div className="relative h-52 overflow-hidden">
                {item.image ? (
                  <>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C13] via-[#0A0C13]/50 to-[#0A0C13]/20" />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/30 flex items-center justify-center group-hover:border-gray-600/50 transition-all duration-300 group-hover:scale-110">
                      <span className="text-3xl">
                        {index === 2 ? "💪" : index === 3 ? "📊" : index === 4 ? "🏆" : index === 5 ? "🥇" : index === 6 ? "🎬" : "⭐"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                  <h3 className="text-white font-bold text-lg group-hover:text-[#FFFF92] transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Stats rows — like ChainGPT pricing rows */}
              <div className="flex-1 flex flex-col">
                {item.stats.map((stat, sIndex) => (
                  <div
                    key={stat.label}
                    className={`flex items-center justify-between px-6 py-3.5 ${
                      sIndex === 0 ? "border-t border-gray-800/50" : ""
                    } border-b border-gray-800/30`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-2.5 h-2.5 text-gray-600" viewBox="0 0 8 8" fill="currentColor">
                        <path d="M0 4 L4 0 L8 4 L4 8 Z" />
                      </svg>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-end mt-4"
        >
          <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">
            Gallery
          </span>
        </motion.div>
      </div>
    </section>
  )
}
