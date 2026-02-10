import type { Metadata } from "next"
import Heading from "@/components/shared/Heading"
import ScrollProgress from "@/components/motion/ScrollProgress"
import Reveal from "@/components/motion/Reveal"
import { motion } from "framer-motion"

export const metadata: Metadata = {
  title: "Media",
  description: "Explore the visual journey of Markus Rühl through photos and videos from decades of dominance.",
}

export default function MediaPage() {
  const mediaItems = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, type: i % 4 === 0 ? "video" : "image" }))

  return (
    <>
      <ScrollProgress />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-main via-yellow/5 to-main px-6 pt-32">
          <Reveal className="text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
              <span className="text-white">THE</span>
              <br />
              <span className="text-yellow glow-text-yellow">GALLERY</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Decades of discipline captured in moments. The journey, the battles, the victories.
            </p>
          </Reveal>
        </section>

        {/* Gallery */}
        <section className="relative py-32 px-6 bg-main">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaItems.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.05}>
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-blue/10 to-purple/10 group cursor-pointer hover:border-yellow/50 transition-all duration-300">
                    {/* Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-gray-600 text-sm block mb-2">
                          {item.type === "video" ? "📹" : "📷"}
                        </span>
                        <span className="text-gray-700 text-xs">
                          Add {item.type} {item.id}
                        </span>
                      </div>
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-main via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.8} className="mt-16 text-center">
              <p className="text-gray-500 text-sm">
                Media placeholders ready for your content. Replace with actual photos and videos.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  )
}
