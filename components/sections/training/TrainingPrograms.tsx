"use client"

import { motion } from "framer-motion"
import Heading from "@/components/shared/Heading"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

const PROGRAMS = [
  {
    title: "MASS BUILDING",
    duration: "12 Weeks",
    intensity: "High",
    level: "Advanced",
    description: "Intensive program focused on muscle growth and maximum size. Built on principles of progressive overload and high-volume training.",
    features: ["Heavy Lifting", "High Volume Training", "Protein Optimization", "Strategic Recovery"],
    principles: ["6 days per week", "Compound movements priority", "Time under tension focus"],
  },
  {
    title: "STRENGTH DEVELOPMENT",
    duration: "8 Weeks",
    intensity: "Maximum",
    level: "Advanced",
    description: "Advanced strength development with compound movement focus. Build raw power and foundational strength.",
    features: ["Power Lifts", "Low Rep Ranges", "Progressive Overload", "Core Stability Work"],
    principles: ["4-5 days per week", "Heavy compound lifts", "Strength progression tracking"],
  },
  {
    title: "PRE-CONTEST CONDITIONING",
    duration: "6-8 Weeks",
    intensity: "Very High",
    level: "Pro/Advanced",
    description: "Peak performance preparation and contest conditioning protocols. Precision nutrition and training.",
    features: ["Circuit Training", "Metabolic Conditioning", "Targeted Cardio", "Nutrient Timing"],
    principles: ["Daily training", "Calorie cycling", "Peak week protocols"],
  },
  {
    title: "LIFESTYLE MAINTENANCE",
    duration: "Ongoing",
    intensity: "Moderate",
    level: "All Levels",
    description: "Year-round sustainable training and lifestyle program. Longevity-focused approach.",
    features: ["Balanced Training", "Flexibility Work", "Injury Prevention", "Wellness Integration"],
    principles: ["3-4 days per week", "Sustainable intensity", "Health-first approach"],
  },
]

export default function TrainingPrograms() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-main via-blue/5 to-main">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(88,103,182,0.08),transparent_60%)]" />
      
      <div className="relative max-w-7xl mx-auto">
        <Heading className="text-center mb-16">
          TRAINING PROGRAMS
        </Heading>

        <p className="text-center text-gray-400 text-xl max-w-3xl mx-auto mb-20">
          Proven training methodologies based on decades of professional experience.
          No gimmicks, no shortcuts—just results.
        </p>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROGRAMS.map((program, index) => (
            <StaggerItem key={program.title}>
              <motion.div
                whileHover={{ y: -5 }}
                className="relative h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${index % 2 === 0 ? 'from-blue/10' : 'from-yellow/10'} to-transparent rounded-2xl blur-xl`} />
                <div className="relative h-full p-8 border border-gray-800 rounded-2xl bg-main/90 backdrop-blur-sm hover:border-yellow/50 transition-all duration-500 flex flex-col">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-bold text-yellow tracking-widest">
                        {program.level}
                      </span>
                      <span className="text-xs font-semibold text-blue bg-blue/20 px-3 py-1 rounded-full">
                        {program.duration}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{program.title}</h3>
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold">{program.intensity} Intensity</span>
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {program.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-yellow mb-3">KEY FEATURES</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {program.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow rounded-full flex-shrink-0" />
                          <span className="text-gray-400 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Principles */}
                  <div className="mt-auto pt-6 border-t border-gray-800">
                    <h4 className="text-xs font-bold text-gray-500 mb-2">PRINCIPLES</h4>
                    <div className="space-y-1">
                      {program.principles.map((principle) => (
                        <p key={principle} className="text-gray-400 text-xs">
                          • {principle}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
