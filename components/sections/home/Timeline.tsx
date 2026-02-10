"use client"

import { useRef, useLayoutEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TIMELINE_EVENTS } from "@/lib/constants"

gsap.registerPlugin(ScrollTrigger)

export default function Timeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const cards = cardsRef.current

    if (!section || !cards) return

    const ctx = gsap.context(() => {
      // Pin the section while scrolling through cards
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=3000",
          scrub: 1,
          pin: true,
        },
      })

      // Animate cards horizontally
      tl.to(cards, {
        x: () => -(cards.scrollWidth - window.innerWidth),
        ease: "none",
      })

      // Fade in/out each card
      gsap.utils.toArray(".timeline-card").forEach((card, index) => {
        gsap.fromTo(
          card as HTMLElement,
          { opacity: 0.3, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: section,
              start: () => `top+=${index * 1000} top`,
              end: () => `top+=${(index + 1) * 1000} top`,
              scrub: 1,
            },
          }
        )
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-gradient-to-b from-main via-gray-900 to-main"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,146,0.03),transparent_60%)]" />
      
      {/* Progress indicator */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 z-20">
        {TIMELINE_EVENTS.map((_, index) => (
          <div
            key={index}
            className="w-2 h-12 bg-gray-800 rounded-full overflow-hidden"
          >
            <div className="timeline-progress bg-gradient-to-b from-yellow to-blue h-0" />
          </div>
        ))}
      </div>

      {/* Cards container */}
      <div ref={cardsRef} className="flex h-full items-center gap-12 pl-[10vw]">
        {TIMELINE_EVENTS.map((event, index) => (
          <div
            key={event.title}
            className="timeline-card flex-shrink-0 w-[80vw] md:w-[60vw] lg:w-[40vw] h-[70vh] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue/20 to-purple/20 rounded-3xl blur-2xl" />
            <div className="relative h-full p-12 border border-gray-800 rounded-3xl bg-main/80 backdrop-blur-md flex flex-col justify-between">
              {/* Number */}
              <div className="text-9xl font-black text-gray-800 absolute top-8 right-8">
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-6xl md:text-7xl font-bold text-white mb-4">
                  {event.title}
                </h3>
                <p className="text-yellow text-xl font-semibold mb-8">
                  {event.year}
                </p>
              </div>

              <p className="text-gray-300 text-xl md:text-2xl leading-relaxed relative z-10">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
