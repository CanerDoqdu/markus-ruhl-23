"use client"

export default function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-main">
      <div className="relative">
        {/* Spinning ring */}
        <div className="w-16 h-16 border-4 border-gray-800 border-t-yellow rounded-full animate-spin" />
        {/* Inner glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-yellow/20 rounded-full blur-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
