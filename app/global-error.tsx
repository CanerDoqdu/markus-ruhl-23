"use client"

import { useEffect } from "react"

/**
 * Global error boundary — catches errors that even the app-level error.tsx cannot.
 * This handles root layout rendering errors or streaming errors.
 * Must be a client component and must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[global-error] Root-level error:", error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: "#0a0c13", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ maxWidth: "32rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
              Critical Error
            </h1>
            <p style={{ color: "#9ca3af", marginBottom: "2rem", lineHeight: 1.6 }}>
              A critical error occurred while loading this page. Please try
              refreshing or return to the home page.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 2rem",
                  background: "linear-gradient(to right, #FFFF92, #5867B6)",
                  color: "#0a0c13",
                  fontWeight: 700,
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Link unavailable in root error boundary */}
              <a
                href="/"
                style={{
                  padding: "0.75rem 2rem",
                  border: "1px solid #374151",
                  color: "#d1d5db",
                  fontWeight: 600,
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                }}
              >
                Go Home
              </a>
            </div>
            {error.digest && (
              <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#4b5563" }}>
                Reference: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
