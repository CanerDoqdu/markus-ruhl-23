import type { Metadata } from "next"
import Heading from "@/components/shared/Heading"
import ScrollProgress from "@/components/motion/ScrollProgress"
import Reveal from "@/components/motion/Reveal"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

export const metadata: Metadata = {
  title: "Legacy",
  description:
    "The enduring legacy of Markus Rühl. Achievements, influence, and lasting impact on bodybuilding.",
}

const ACHIEVEMENTS = [
  {
    year: "1988",
    title: "Professional Debut",
    description:
      "Started professional bodybuilding career after injury redirected life path",
    icon: "🏋️",
  },
  {
    year: "2000s",
    title: "Mass Monster Era",
    description:
      "Redefined muscle mass possibilities, inspiring a generation of bodybuilders",
    icon: "💪",
  },
  {
    year: "2008",
    title: "Ultimate Nutrition",
    description:
      "Major sponsorship deal, cementing status as industry icon",
    icon: "🤝",
  },
  {
    year: "2018",
    title: "Rühl's Bestes",
    description:
      "Launched own supplement company, sharing decades of knowledge",
    icon: "⭐",
  },
]

const QUOTES = [
  {
    quote: "The pain you feel today will be the strength you feel tomorrow.",
    context: "On training philosophy",
  },
  {
    quote:
      "Success isn't given. It's earned through discipline and sacrifice.",
    context: "On achieving greatness",
  },
  {
    quote:
      "Every rep, every meal, every moment counts. There are no shortcuts.",
    context: "On consistency",
  },
]

const STATS = [
  { value: "30+", label: "Years in Bodybuilding" },
  { value: "7", label: "Pro Show Wins" },
  { value: "1M+", label: "Followers Worldwide" },
  { value: "285", label: "lbs Stage Weight" },
]

export default function LegacyPage() {
  return (
    <>
      <ScrollProgress />
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-6 pt-32">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-main via-purple/10 to-main" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow/[0.04] rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-main to-transparent" />

          <Reveal className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow/50" />
              <span className="text-[11px] font-mono text-yellow/60 uppercase tracking-[0.5em]">
                Markus Rühl
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow/50" />
            </div>
            <h1 className="text-7xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tight">
              <span className="text-white">THE</span>
              <br />
              <span className="text-yellow glow-text-yellow">LEGACY</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              More than competitions. More than titles.
              <br className="hidden md:block" />
              A lasting impact on the sport and those who follow.
            </p>

            {/* Scroll indicator */}
            <div className="mt-16 flex flex-col items-center gap-2">
              <div className="w-px h-12 bg-gradient-to-b from-yellow/40 to-transparent" />
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.3em]">
                Scroll
              </span>
            </div>
          </Reveal>
        </section>

        {/* ── Stats Bar ── */}
        <section className="relative py-16 px-6 bg-main border-y border-gray-800/30">
          <div className="max-w-5xl mx-auto">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {STATS.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center group">
                    <p className="text-4xl md:text-5xl font-black text-yellow mb-2 tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[11px] font-mono text-gray-500 uppercase tracking-[0.25em]">
                      {stat.label}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── Milestones – Vertical Timeline ── */}
        <section className="relative py-32 px-6 bg-main overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-yellow/[0.03] rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-24">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow/40" />
                  <span className="text-[10px] font-mono text-yellow/50 uppercase tracking-[0.4em]">
                    Journey
                  </span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow/40" />
                </div>
                <Heading className="text-center" underline={false}>
                  MILESTONES
                </Heading>
              </div>
            </Reveal>

            {/* Timeline */}
            <div className="relative">
              {/* Center line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-yellow/30 via-blue/20 to-transparent md:-translate-x-px" />

              <div className="space-y-20">
                {ACHIEVEMENTS.map((achievement, idx) => {
                  const isLeft = idx % 2 === 0
                  return (
                    <Reveal key={achievement.year} delay={idx * 0.15}>
                      <div className="relative flex items-start md:items-center">
                        {/* Dot on line */}
                        <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-yellow/60 bg-main z-10 mt-1 md:mt-0" />
                        <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow/10 blur-sm z-0 mt-1 md:mt-0" />

                        {/* Card */}
                        <div
                          className={`
                            ml-16 md:ml-0 md:w-[calc(50%-40px)]
                            ${isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}
                          `}
                        >
                          <div className="group relative p-6 md:p-8 rounded-2xl border border-gray-800/60 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-sm hover:border-yellow/30 transition-all duration-500">
                            {/* Hover glow */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow/[0.04] to-blue/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                              <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl">{achievement.icon}</span>
                                <span className="text-yellow font-mono font-bold text-sm tracking-wider">
                                  {achievement.year}
                                </span>
                              </div>
                              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                                {achievement.title}
                              </h3>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Quotes ── */}
        <section className="relative py-32 px-6 bg-gradient-to-b from-main via-blue/[0.03] to-main overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/[0.04] rounded-full blur-[150px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-24">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue/40" />
                  <span className="text-[10px] font-mono text-blue/60 uppercase tracking-[0.4em]">
                    Philosophy
                  </span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue/40" />
                </div>
                <Heading className="text-center" underline={false}>
                  WORDS OF WISDOM
                </Heading>
              </div>
            </Reveal>

            <div className="space-y-12">
              {QUOTES.map((item, index) => (
                <Reveal key={index} delay={index * 0.2}>
                  <div className="group relative p-8 md:p-12 rounded-2xl border border-gray-800/40 bg-gradient-to-br from-white/[0.02] to-transparent hover:border-blue/30 transition-all duration-500">
                    {/* Large quote mark */}
                    <span className="absolute top-4 left-6 text-6xl md:text-8xl font-serif text-yellow/10 leading-none select-none">
                      &ldquo;
                    </span>
                    <div className="relative z-10 text-center pt-8 md:pt-4">
                      <blockquote className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-relaxed mb-6">
                        &ldquo;{item.quote}&rdquo;
                      </blockquote>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-yellow/30" />
                        <p className="text-yellow/60 text-xs font-mono uppercase tracking-[0.3em]">
                          {item.context}
                        </p>
                        <div className="h-px w-8 bg-yellow/30" />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Partners ── */}
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
                <Heading className="text-center" underline={false}>
                  PARTNERS & SPONSORS
                </Heading>
                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mt-4">
                  Backed by the industry&apos;s most respected brands — the
                  same standard of excellence, no compromises.
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
                        {/* Placeholder: replace with actual partner logo */}
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-yellow/20 to-blue/20 flex items-center justify-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                          <span className="text-2xl font-black text-white/60">P{num}</span>
                        </div>
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
                    <p className="text-2xl font-black text-white">
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mt-1">
                      {stat.label}
                    </p>
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
