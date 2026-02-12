"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Heading from "@/components/shared/Heading"
import Button from "@/components/shared/Button"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

const PROGRAMS = [
  {
    title: "MASS BUILDER",
    description: "High-volume training for maximum muscle growth",
    intensity: "Advanced",
    features: ["6 days/week", "Heavy compounds", "Progressive overload"],
    image: "/assets/images/magazine 2.jpg",
  },
  {
    title: "POWER CORE",
    description: "Build foundational strength and power",
    intensity: "Intermediate",
    features: ["4 days/week", "Strength focus", "Compound movements"],
    image: "/assets/images/images.jpeg",
  },
  {
    title: "BEGINNER PATH",
    description: "Master the fundamentals of bodybuilding",
    intensity: "Beginner",
    features: ["3 days/week", "Form mastery", "Build base strength"],
    image: "/assets/images/i.webp",
  },
]

export default function TrainingPreview() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-main via-gray-900 to-main">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(88,103,182,0.08),transparent_60%)]" />
      
      <div className="relative max-w-7xl mx-auto">
        <Heading className="text-center">
          <span className="text-white">TRAINING</span>
          <span className="text-yellow ml-4">PHILOSOPHY</span>
        </Heading>

        <p className="text-center text-gray-400 text-xl max-w-3xl mx-auto mb-16">
          Proven methods from decades of experience. No gimmicks, just results.
        </p>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PROGRAMS.map((program) => (
            <StaggerItem key={program.title}>
              <motion.div
                whileHover={{ y: -10 }}
                className="relative group h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow/10 to-blue/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative h-full border border-gray-800 rounded-2xl bg-main/80 backdrop-blur-sm group-hover:border-yellow/50 transition-all duration-500 flex flex-col overflow-hidden">
                  {/* Card image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-main via-main/40 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-xs font-bold text-yellow tracking-widest">
                      {program.intensity.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {program.title}
                  </h3>
                  <p className="text-gray-400 mb-6 flex-grow">
                    {program.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {program.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                        <div className="w-1.5 h-1.5 bg-yellow rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="text-center">
          <Button href="/training" variant="primary">
            Explore All Programs
          </Button>
        </div>
      </div>
    </section>
  )
}
