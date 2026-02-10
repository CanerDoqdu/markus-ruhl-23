import type { Metadata } from "next"
import StoryHero from "@/components/sections/story/StoryHero"
import StoryContent from "@/components/sections/story/StoryContent"
import SuccessStories from "@/components/sections/story/SuccessStories"
import ScrollProgress from "@/components/motion/ScrollProgress"

export const metadata: Metadata = {
  title: "Story",
  description: "The journey of Markus Rühl from factory worker to bodybuilding legend. A story of discipline, sacrifice, and determination.",
}

export default function StoryPage() {
  return (
    <>
      <ScrollProgress />
      <main>
        <StoryHero />
        <StoryContent />
        <SuccessStories />
      </main>
    </>
  )
}
