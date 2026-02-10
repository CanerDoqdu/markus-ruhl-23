"use client"

import { useState, useEffect } from "react"

export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    // Use the newer addEventListener API
    media.addEventListener("change", listener)
    
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}
