"use client"

import Image from "next/image"
import Reveal from "@/components/motion/Reveal"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

export default function StoryContent() {
  return (
    <section className="relative py-32 px-6 bg-main">
      <div className="max-w-4xl mx-auto">
        {/* Main Story */}
        <Reveal>
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              The Beginning
            </h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                Markus Rühl (born 22 February 1972, in Darmstadt, Germany) is a
                retired IFBB professional bodybuilder who became one of the most
                iconic figures in bodybuilding history.
              </p>
              <p>
                Rühl began training at the age of 19 following a doctor's recommendation
                after sustaining a knee injury while playing football. At 120 pounds (54 kg),
                Rühl began training hard six days a week until deciding to compete on a
                professional level five years later.
              </p>
              <p>
                During this period, he worked as a used-car salesman, balancing his
                passion for bodybuilding with the demands of everyday life. His dedication
                was unmatched—training through pain, sacrifice, and doubt.
              </p>
              <p>
                Rühl signed a sponsorship deal with Ultimate Nutrition in late 2008.
                In 2018, he started his own supplement company, Rühl's Bestes, bringing
                his decades of experience to help others achieve their goals.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Stats Cards */}
        <Reveal delay={0.2}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">
            The Numbers
          </h2>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <StaggerItem>
            <div className="p-8 border border-blue/30 rounded-2xl bg-gradient-to-br from-blue/10 to-transparent backdrop-blur-sm hover:border-blue/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-yellow mb-6">
                Peak Stats (Competition)
              </h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span>Height</span>
                  <span className="font-bold text-white">1.78 m (5'10")</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span>Weight (Off-Season)</span>
                  <span className="font-bold text-white">145 kg (320 lbs)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span>Weight (Contest)</span>
                  <span className="font-bold text-white">130 kg (287 lbs)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span>Arm Size</span>
                  <span className="font-bold text-white">61 cm (24")</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span>Leg Size</span>
                  <span className="font-bold text-white">85-88 cm (33-35")</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Chest Size</span>
                  <span className="font-bold text-white">150 cm (59")</span>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-8 border border-yellow/30 rounded-2xl bg-gradient-to-br from-yellow/10 to-transparent backdrop-blur-sm hover:border-yellow/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-yellow mb-6">
                The Legacy
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Although Rühl only won two shows in his career, he is considered to be
                one of the biggest "mass monster" bodybuilders who ever lived.
              </p>
              <p className="text-gray-400 leading-relaxed">
                His impact transcends competition results. Markus Rühl redefined what
                was possible in terms of muscle mass and conditioning, inspiring
                countless athletes to push beyond perceived limits.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Philosophy */}
        <Reveal delay={0.4}>
          <div className="text-center py-20">
            <blockquote className="text-3xl md:text-4xl font-bold text-white leading-relaxed mb-6">
              "There are no shortcuts. Only hard work, dedication, and the will to never give up."
            </blockquote>
            <p className="text-yellow font-semibold text-xl">— Markus Rühl</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
