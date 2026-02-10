"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Heading from "@/components/shared/Heading"
import Button from "@/components/shared/Button"
import Reveal from "@/components/motion/Reveal"

const MEDIA_ITEMS = [
  { id: 1, type: "image", alt: "Training moment" },
  { id: 2, type: "image", alt: "Competition" },
  { id: 3, type: "image", alt: "Posing" },
  { id: 4, type: "image", alt: "Gym session" },
  { id: 5, type: "image", alt: "Event" },
  { id: 6, type: "image", alt: "Legacy" },
]

export default function MediaPreview() {
  return (
    <section className="relative py-32 px-6 bg-main">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,146,0.03),transparent_70%)]" />
      
      <div className="relative max-w-7xl mx-auto">
        <Reveal>
          <Heading className="text-center">
            <span className="text-white">THE</span>
            <span className="text-yellow ml-4">GALLERY</span>
          </Heading>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-center text-gray-400 text-xl max-w-3xl mx-auto mb-16">
            Moments captured through decades of dominance. The power, the passion, the legacy.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {MEDIA_ITEMS.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square overflow-hidden rounded-xl border border-gray-800 bg-gray-900 group cursor-pointer"
              >
                {/* Placeholder - User will add images */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue/20 to-purple/20 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">
                    Add image {item.id}
                  </span>
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-main via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white font-semibold">{item.alt}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <Button href="/media" variant="outline">
            View Full Gallery
          </Button>
        </div>
      </div>
    </section>
  )
}
