import type { Metadata } from "next"
import Heading from "@/components/shared/Heading"
import TrainingPrograms from "@/components/sections/training/TrainingPrograms"
import ScrollProgress from "@/components/motion/ScrollProgress"
import Reveal from "@/components/motion/Reveal"

export const metadata: Metadata = {
  title: "Training",
  description: "Proven training methodologies from bodybuilding legend Markus Rühl. Build muscle, strength, and achieve your peak potential.",
}

export default function TrainingPage() {
  return (
    <>
      <ScrollProgress />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-main via-blue/10 to-main px-6 pt-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,103,182,0.1),transparent_70%)]" />
          <Reveal className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
              <span className="text-white">TRAINING</span>
              <br />
              <span className="text-yellow glow-text-yellow">PHILOSOPHY</span>
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl mb-8">
              Decades of experience distilled into proven methodologies.
            </p>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Success in bodybuilding isn't about magic formulas or secret techniques.
              It's about consistency, discipline, and unwavering commitment to excellence.
            </p>
          </Reveal>
        </section>

        {/* Core Principles */}
        <section className="relative py-32 px-6 bg-main">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <Heading className="text-center mb-16">
                CORE PRINCIPLES
              </Heading>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { num: "01", title: "Progressive Overload", desc: "Continuously challenge your muscles beyond their comfort zone." },
                { num: "02", title: "Time Under Tension", desc: "Quality reps with controlled movements build real muscle." },
                { num: "03", title: "Recovery is Sacred", desc: "Growth happens outside the gym. Prioritize rest and nutrition." },
                { num: "04", title: "Consistency Over Intensity", desc: "Show up every day. The compound effect of consistent work is unbeatable." },
              ].map((principle, index) => (
                <Reveal key={principle.num} delay={index * 0.1}>
                  <div className="p-6 border border-gray-800 rounded-xl bg-gradient-to-br from-blue/5 to-transparent hover:border-yellow/50 transition-all duration-300">
                    <span className="text-5xl font-black text-gray-800">{principle.num}</span>
                    <h3 className="text-xl font-bold text-white mt-4 mb-2">{principle.title}</h3>
                    <p className="text-gray-400">{principle.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <TrainingPrograms />

        {/* Quote Section */}
        <section className="relative py-32 px-6 bg-gradient-to-b from-main to-gray-900">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="text-3xl md:text-4xl font-bold text-white leading-relaxed mb-6">
                "The weights don't get lighter. You get stronger."
              </blockquote>
              <p className="text-yellow font-semibold text-xl">— Markus Rühl</p>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  )
}
