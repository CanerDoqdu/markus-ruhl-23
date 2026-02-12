import type { Metadata } from "next"
import Image from "next/image"
import Heading from "@/components/shared/Heading"
import ScrollProgress from "@/components/motion/ScrollProgress"
import Reveal from "@/components/motion/Reveal"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

export const metadata: Metadata = {
  title: "Legacy",
  description: "The enduring legacy of Markus Rühl. Achievements, influence, and lasting impact on bodybuilding.",
}

const ACHIEVEMENTS = [
  {
    year: "1988",
    title: "Professional Debut",
    description: "Started professional bodybuilding career after injury redirected life path",
    icon: "🏋️",
  },
  {
    year: "2000s",
    title: "Mass Monster Era",
    description: "Redefined muscle mass possibilities, inspiring a generation of bodybuilders",
    icon: "💪",
  },
  {
    year: "2008",
    title: "Ultimate Nutrition",
    description: "Major sponsorship deal, cementing status as industry icon",
    icon: "🤝",
  },
  {
    year: "2018",
    title: "Rühl's Bestes",
    description: "Launched own supplement company, sharing decades of knowledge",
    icon: "⭐",
  },
]

const QUOTES = [
  {
    quote: "The pain you feel today will be the strength you feel tomorrow.",
    context: "On training philosophy",
  },
  {
    quote: "Success isn't given. It's earned through discipline and sacrifice.",
    context: "On achieving greatness",
  },
  {
    quote: "Every rep, every meal, every moment counts. There are no shortcuts.",
    context: "On consistency",
  },
]

export default function LegacyPage() {
  return (
    <>
      <ScrollProgress />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-main via-purple/10 to-main px-6 pt-32">
          <Reveal className="text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
              <span className="text-white">THE</span>
              <br />
              <span className="text-yellow glow-text-yellow">LEGACY</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              More than competitions. More than titles. A lasting impact on the sport and those who follow.
            </p>
          </Reveal>
        </section>

        {/* Achievements */}
        <section className="relative py-32 px-6 bg-main">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <Heading className="text-center mb-20">
                MILESTONES
              </Heading>
            </Reveal>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ACHIEVEMENTS.map((achievement) => (
                <StaggerItem key={achievement.year}>
                  <div className="relative p-8 border border-gray-800 rounded-2xl bg-gradient-to-br from-blue/5 to-transparent hover:border-yellow/50 transition-all duration-300 group">
                    <div className="text-6xl mb-4">{achievement.icon}</div>
                    <span className="text-yellow font-bold text-lg">{achievement.year}</span>
                    <h3 className="text-2xl font-bold text-white mt-2 mb-4">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Quotes */}
        <section className="relative py-32 px-6 bg-gradient-to-b from-main via-blue/5 to-main">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <Heading className="text-center mb-20">
                WORDS OF WISDOM
              </Heading>
            </Reveal>

            <div className="space-y-16">
              {QUOTES.map((item, index) => (
                <Reveal key={index} delay={index * 0.2}>
                  <div className="text-center">
                    <blockquote className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-4">
                      "{item.quote}"
                    </blockquote>
                    <p className="text-gray-500 text-sm">{item.context}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="relative py-32 px-6 bg-main overflow-hidden">
          {/* Animated gradient orb backgrounds */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue/[0.04] rounded-full blur-[100px] pointer-events-none" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,146,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,146,0.4) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Header */}
            <Reveal>
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow/40" />
                  <span className="text-[10px] font-mono text-yellow/50 uppercase tracking-[0.4em]">
                    Trusted Worldwide
                  </span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow/40" />
                </div>
                <Heading className="mb-4">
                  PARTNERS & SPONSORS
                </Heading>
                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                  Backed by the industry&apos;s most respected brands — the same standard of excellence, no compromises.
                </p>
              </div>
            </Reveal>

            {/* Partner cards */}
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <StaggerItem key={num}>
                  <div className="group relative">
                    {/* Card */}
                    <div className="relative flex items-center justify-center aspect-square rounded-2xl border border-gray-800/50 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm hover:border-yellow/30 hover:from-yellow/[0.05] transition-all duration-500 overflow-hidden p-8">
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 w-20 h-20 flex items-center justify-center">
                        <Image
                          src={`/assets/img_${num}.svg`}
                          alt={`Partner ${num}`}
                          width={80}
                          height={80}
                          className="max-w-full max-h-full object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Bottom label */}
                    <div className="mt-3 text-center">
                      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em] group-hover:text-yellow/60 transition-colors duration-300">
                        Partner 0{num}
                      </span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Stats bar */}
            <Reveal delay={0.3}>
              <div className="mt-16 flex items-center justify-center gap-12 md:gap-20">
                {[
                  { value: "15+", label: "Years" },
                  { value: "10+", label: "Partners" },
                  { value: "Global", label: "Reach" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Bottom accent */}
            <div className="flex justify-center mt-16">
              <div className="flex items-center gap-2">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-700/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow/30" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-700/50" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
