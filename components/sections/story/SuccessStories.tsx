"use client"

import { StarIcon } from "@heroicons/react/24/solid"
import { motion } from "framer-motion"
import Heading from "@/components/shared/Heading"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

const TESTIMONIALS = [
  {
    name: "John Mitchell",
    role: "Fitness Enthusiast",
    avatar: "👨‍💼",
    quote: "Started at 250 lbs with no weightlifting experience. After 6 months following the program, gained 30 lbs of pure muscle.",
    results: ["Lost 15% Body Fat", "Gained 30 lbs Muscle", "50 lbs Bench Press Increase"],
    rating: 5,
    progress: 85,
    timeframe: "6 months",
  },
  {
    name: "Sarah Johnson",
    role: "Professional Athlete",
    avatar: "👩‍⚕️",
    quote: "Competitive bodybuilder who needed advanced training techniques. Qualified for Mr. Olympia after implementing new protocols.",
    results: ["Qualified for Olympia", "Added 25 lbs Mass", "Peak Conditioning"],
    rating: 5,
    progress: 95,
    timeframe: "8 months",
  },
  {
    name: "Marcus Davis",
    role: "Corporate Employee",
    avatar: "👨‍💻",
    quote: "Time-constrained professional who achieved visible results with optimized 4-day split. Completely transformed physique.",
    results: ["4-Day Routine Mastery", "45 lbs Muscle Gain", "Injury-Free Training"],
    rating: 5,
    progress: 78,
    timeframe: "5 months",
  },
  {
    name: "Amanda Chen",
    role: "Fitness Coach",
    avatar: "👩‍🏫",
    quote: "Implemented principles with her clients and achieved 100% satisfaction rate. Now coaches pro athletes.",
    results: ["100% Client Satisfaction", "Teaches Pro Athletes", "Certified Trainer"],
    rating: 5,
    progress: 100,
    timeframe: "3 months",
  },
]

export default function SuccessStories() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-main via-blue/5 to-main">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,146,0.05),transparent_60%)]" />
      
      <div className="relative max-w-7xl mx-auto">
        <Heading className="text-center mb-16">
          <span className="text-white">SUCCESS</span>
          <span className="text-yellow ml-4">STORIES</span>
        </Heading>

        <p className="text-center text-gray-400 text-xl max-w-3xl mx-auto mb-16">
          Real transformations from people who embraced the discipline and commitment required for greatness.
        </p>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((story, index) => (
            <StaggerItem key={story.name}>
              <motion.div
                whileHover={{ y: -5 }}
                className="relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue/10 to-purple/10 rounded-2xl blur-xl" />
                <div className="relative p-8 border border-gray-800 rounded-2xl bg-main/90 backdrop-blur-sm hover:border-yellow/50 transition-all duration-500 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-5xl">{story.avatar}</div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {story.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{story.role}</p>
                      <div className="flex gap-0.5 mt-2">
                        {[...Array(story.rating)].map((_, i) => (
                          <StarIcon key={i} className="w-4 h-4 text-yellow" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue bg-blue/20 px-3 py-1 rounded-full">
                      {story.timeframe}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-gray-300 leading-relaxed mb-6 flex-grow">
                    "{story.quote}"
                  </p>

                  {/* Results */}
                  <div className="space-y-3 mb-6">
                    {story.results.map((result) => (
                      <div key={result} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow rounded-full" />
                        <span className="text-gray-400 text-sm">{result}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Transformation Progress</span>
                      <span className="text-xs font-bold text-yellow">{story.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${story.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-yellow to-blue rounded-full"
                      />
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
