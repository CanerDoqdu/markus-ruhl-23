"use client"

import { useState, useRef, useCallback, FormEvent } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Reveal from "@/components/motion/Reveal"

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateFields(data: { name: string; email: string; message: string }): FieldErrors {
  const errors: FieldErrors = {}
  if (!data.name.trim()) errors.name = "Name is required."
  else if (data.name.trim().length < 2) errors.name = "Name must be at least 2 characters."
  else if (data.name.trim().length > 100) errors.name = "Name must be at most 100 characters."

  if (!data.email.trim()) errors.email = "Email is required."
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = "Please enter a valid email address."

  if (!data.message.trim()) errors.message = "Message is required."
  else if (data.message.trim().length < 10) errors.message = "Message must be at least 10 characters."
  else if (data.message.trim().length > 5000) errors.message = "Message must be at most 5000 characters."

  return errors
}

export default function ContactForm() {
  const shouldReduceMotion = useReducedMotion()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const statusRef = useRef<HTMLDivElement>(null)
  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const handleBlur = useCallback(
    (field: "name" | "email" | "message") => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const errors = validateFields(formData)
      setFieldErrors((prev) => ({
        ...prev,
        [field]: errors[field] || undefined,
      }))
    },
    [formData]
  )

  const handleChange = useCallback(
    (field: "name" | "email" | "message", value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear field error on change if user already touched the field
      if (touched[field]) {
        const updated = { ...formData, [field]: value }
        const errors = validateFields(updated)
        setFieldErrors((prev) => ({
          ...prev,
          [field]: errors[field] || undefined,
        }))
      }
    },
    [formData, touched]
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")

    // Validate all fields
    const errors = validateFields(formData)
    setFieldErrors(errors)
    setTouched({ name: true, email: true, message: true })

    if (Object.keys(errors).length > 0) {
      // Focus the first field with an error
      const firstField = (["name", "email", "message"] as const).find((f) => errors[f])
      if (firstField) {
        const el = document.getElementById(firstField)
        if (el) (el as HTMLElement).focus()
      }
      return
    }

    setStatus("loading")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Surface per-field validation errors from the API
        if (data?.error?.fields) {
          setFieldErrors(data.error.fields)
          setStatus("error")
          setErrorMessage(data.error.message || "Validation failed.")
          return
        }
        throw new Error(data?.error?.message || "Something went wrong")
      }

      setStatus("success")
      setFormData({ name: "", email: "", message: "" })
      setFieldErrors({})
      setTouched({})

      // Scroll status message into view
      setTimeout(() => statusRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100)

      // Reset success message after 8 seconds
      setTimeout(() => setStatus("idle"), 8000)
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message")
    }
  }

  const inputClassName = (field: keyof FieldErrors) =>
    `w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder:text-gray-600 focus:outline-none transition-colors motion-reduce:transition-none ${
      fieldErrors[field]
        ? "border-red-500 focus:border-red-400"
        : "border-gray-800 focus:border-yellow"
    }`

  return (
    <section
      className="relative py-24 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-main via-blue/5 to-main"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2
            id="contact-heading"
            className="text-4xl font-bold text-center text-white mb-12"
          >
            Send a Message
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
            aria-label="Contact form"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Name <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                aria-required="true"
                aria-invalid={fieldErrors.name ? "true" : undefined}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                autoComplete="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={inputClassName("name")}
                placeholder="Your name"
              />
              {fieldErrors.name && (
                <p id="name-error" className="mt-1.5 text-sm text-red-400" role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Email <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                aria-required="true"
                aria-invalid={fieldErrors.email ? "true" : undefined}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={inputClassName("email")}
                placeholder="your@email.com"
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-red-400" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Message <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                aria-required="true"
                aria-invalid={fieldErrors.message ? "true" : undefined}
                aria-describedby={
                  [fieldErrors.message && "message-error", "message-hint"]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                rows={6}
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                onBlur={() => handleBlur("message")}
                className={`${inputClassName("message")} resize-none`}
                placeholder="Tell us about your inquiry..."
              />
              <p id="message-hint" className="mt-1 text-xs text-gray-500">
                {formData.message.length}/5000 characters
              </p>
              {fieldErrors.message && (
                <p id="message-error" className="mt-1 text-sm text-red-400" role="alert">
                  {fieldErrors.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={shouldReduceMotion ? undefined : { scale: status === "loading" ? 1 : 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: status === "loading" ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-yellow to-blue text-main font-bold rounded-lg hover:shadow-glow-yellow transition-shadow motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={status === "loading"}
            >
              {status === "loading" ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </motion.button>

            {/* Status Messages — live region for screen readers */}
            <div ref={statusRef} aria-live="polite" aria-atomic="true">
              {status === "success" && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center"
                  role="status"
                >
                  <strong>Message sent successfully!</strong> We&apos;ll get back to you soon.
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center"
                  role="alert"
                >
                  {errorMessage || "Failed to send message. Please try again."}
                </motion.div>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
