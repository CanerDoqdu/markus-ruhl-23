"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[app] Unhandled error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-main flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4 font-raleway">
          Something Went Wrong
        </h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          An unexpected error occurred. This has been logged and we&apos;re
          working on it. You can try again or return to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-gradient-to-r from-yellow to-blue text-main font-bold rounded-lg hover:shadow-glow-yellow transition-shadow motion-reduce:transition-none"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-yellow/50 hover:text-white transition-colors motion-reduce:transition-none"
          >
            Go Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-600">
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
