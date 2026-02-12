"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import PremiumHero from "@/components/sections/hero/PremiumHero"
import Discipline from "@/components/sections/home/Discipline"
import TrainingPreview from "@/components/sections/home/TrainingPreview"
import MediaPreview from "@/components/sections/home/MediaPreview"
import FinalCTA from "@/components/sections/home/FinalCTA"
import ScrollProgress from "@/components/motion/ScrollProgress"
import LoadingSkeleton from "@/components/shared/LoadingSkeleton"

// Heavy components - lazy load
const LayerStack = dynamic(() => import("@/components/sections/home/LayerStack"), {
  ssr: false,
  loading: () => <div className="h-screen bg-main" />,
})

const InteractiveTimeline = dynamic(() => import("@/components/sections/InteractiveTimeline"), {
  ssr: false,
  loading: () => <div className="h-screen bg-main" />,
})

const TrophyShowcase = dynamic(() => import("@/components/sections/home/TrophyShowcase"), {
  ssr: false,
  loading: () => <div className="h-screen bg-main" />,
})

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    const MINIMUM_LOADING_TIME = 2200 // Match progress bar animation (2s) + buffer
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Wait for actual page load AND minimum time
    const handleLoad = () => {
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsed)
      
      setTimeout(() => {
        setIsLoading(false)
      }, remainingTime)
    }

    if (document.readyState === "complete") {
      handleLoad()
    } else {
      window.addEventListener("load", handleLoad)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("load", handleLoad)
    }
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <>
      <ScrollProgress />
      <main>
        <PremiumHero />
        <Discipline />
        <LayerStack />
        {!isMobile && <InteractiveTimeline />}
        <TrophyShowcase />
        <TrainingPreview />
        <MediaPreview />
        <FinalCTA />
      </main>
    </>
  )
}
