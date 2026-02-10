import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function smoothScrollTo(targetId: string) {
  const element = document.getElementById(targetId)
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}
