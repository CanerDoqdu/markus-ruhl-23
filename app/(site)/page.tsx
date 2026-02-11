import PremiumHero from "@/components/sections/hero/PremiumHero"
import Discipline from "@/components/sections/home/Discipline"
import LayerStack from "@/components/sections/home/LayerStack"
import InteractiveTimeline from "@/components/sections/InteractiveTimeline"
import TrainingPreview from "@/components/sections/home/TrainingPreview"
import MediaPreview from "@/components/sections/home/MediaPreview"
import TrophyShowcase from "@/components/sections/home/TrophyShowcase"
import FinalCTA from "@/components/sections/home/FinalCTA"
import ScrollProgress from "@/components/motion/ScrollProgress"

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <main>
        <PremiumHero />
        <Discipline />
        <InteractiveTimeline />
        <LayerStack />
        <TrophyShowcase />
        <TrainingPreview />
        <MediaPreview />
        <FinalCTA />
      </main>
    </>
  )
}
