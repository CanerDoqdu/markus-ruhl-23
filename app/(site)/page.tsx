import Hero from "@/components/sections/hero/Hero"
import Discipline from "@/components/sections/home/Discipline"
import Timeline from "@/components/sections/home/Timeline"
import InteractiveTimeline from "@/components/sections/InteractiveTimeline"
import TrainingPreview from "@/components/sections/home/TrainingPreview"
import MediaPreview from "@/components/sections/home/MediaPreview"
import FinalCTA from "@/components/sections/home/FinalCTA"
import ScrollProgress from "@/components/motion/ScrollProgress"

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <main className="overflow-x-hidden">
        <Hero />
        <Discipline />
        <InteractiveTimeline />
        <Timeline />
        <TrainingPreview />
        <MediaPreview />
        <FinalCTA />
      </main>
    </>
  )
}
