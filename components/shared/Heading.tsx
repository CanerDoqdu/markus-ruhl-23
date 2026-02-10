import { cn } from "@/lib/utils"

interface HeadingProps {
  children: React.ReactNode
  className?: string
  underline?: boolean
}

export default function Heading({ children, className = "", underline = true }: HeadingProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-raleway tracking-tight">
        {children}
      </h2>
      {underline && (
        <div className="mt-4 w-20 h-1 bg-gradient-to-r from-yellow to-blue rounded-full" />
      )}
    </div>
  )
}
