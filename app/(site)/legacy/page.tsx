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
        <section className="relative py-32 px-6 bg-main">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <Heading className="text-center mb-16">
                PARTNERS
              </Heading>
            </Reveal>

            <div className="flex flex-wrap items-center justify-center gap-12">
              {[1, 2, 3, 4, 5].map((num) => (
                <Reveal key={num} delay={num * 0.1}>
                  <div className="grayscale hover:grayscale-0 transition-all duration-300">
                    <Image
                      src={`/assets/img_${num}.svg`}
                      alt={`Partner ${num}`}
                      width={120}
                      height={60}
                      className="object-contain opacity-60 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
