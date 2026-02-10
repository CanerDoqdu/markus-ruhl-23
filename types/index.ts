export enum SelectedPage {
  HOME = "home",
  STORY = "story",
  TRAINING = "training",
  MEDIA = "media",
  LEGACY = "legacy",
  CONTACT = "contact",
}

export interface BenefitType {
  icon: JSX.Element
  title: string
  description: string
}

export interface TrainingProgram {
  title: string
  description: string
  features: string[]
  intensity: "Beginner" | "Intermediate" | "Advanced"
}

export interface Achievement {
  year: string
  title: string
  description: string
  icon?: string
}

export interface Testimonial {
  name: string
  quote: string
  image?: string
  rating: number
}
