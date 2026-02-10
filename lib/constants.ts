export const NAV_LINKS = [
  { name: "Home", href: "/#home" },
  { name: "Story", href: "/story" },
  { name: "Training", href: "/training" },
  { name: "Media", href: "/media" },
  { name: "Legacy", href: "/legacy" },
  { name: "Contact", href: "/contact" },
] as const

export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
  { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
  { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
] as const

export const HERO_STATS = [
  { label: "Height", value: "178 cm" },
  { label: "Weight (Off-Season)", value: "145 kg" },
  { label: "Weight (Competition)", value: "130 kg" },
  { label: "Pro Debut", value: "1988" },
] as const

export const TIMELINE_EVENTS = [
  {
    title: "Rise",
    year: "1980s - 1990s",
    description: "From factory worker to bodybuilding champion. The German Giant emerges.",
  },
  {
    title: "Peak",
    year: "2000s",
    description: "Dominating the stage with unprecedented mass and conditioning. A legend at his height.",
  },
  {
    title: "Legacy",
    year: "Present",
    description: "Inspiring millions worldwide. The discipline continues, the legacy grows.",
  },
] as const

export const SITE_CONFIG = {
  name: "Markus Rühl",
  title: "Markus Rühl | Discipline. Power. Legacy.",
  description: "The official brand experience of bodybuilding legend Markus Rühl. Discipline. Power. Legacy.",
  url: "https://markusruhl.com",
  ogImage: "/og-image.jpg",
} as const
