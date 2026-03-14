/**
 * Standardized API response helpers.
 *
 * All API routes MUST use these helpers to guarantee a consistent response
 * envelope across the surface. Never return raw NextResponse.json() with
 * ad-hoc shapes from route handlers.
 *
 * Success envelope:
 *   { success: true, data?: T }
 *
 * Error envelope:
 *   { success: false, error: { code: string, message: string, fields?: FieldErrors } }
 */

import { NextResponse } from "next/server"
import type { ValidationError } from "./validation"

// ---------------------------------------------------------------------------
// Typed response shapes
// ---------------------------------------------------------------------------

export type FieldErrors = Record<string, string>

export type ApiSuccess<T = undefined> = T extends undefined
  ? { success: true }
  : { success: true; data: T }

export type ApiError = {
  success: false
  error: {
    /** Machine-readable error code. */
    code: ErrorCode
    /** Human-readable description (safe to surface to clients). */
    message: string
    /** Per-field validation messages, present only on VALIDATION_ERROR. */
    fields?: FieldErrors
  }
}

export type ApiResponse<T = undefined> = ApiSuccess<T> | ApiError

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "INTERNAL_ERROR"

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

/** 200 success with optional data payload. */
export function ok<T>(data?: T, status = 200): NextResponse<ApiSuccess<T>> {
  const body = data !== undefined ? { success: true as const, data } : { success: true as const }
  return NextResponse.json(body as ApiSuccess<T>, { status })
}

/** 400 validation failure with per-field detail. */
export function validationError(
  errors: ValidationError[]
): NextResponse<ApiError> {
  const fields: FieldErrors = {}
  for (const e of errors) {
    // Only keep first error per field for concise client feedback.
    if (!(e.field in fields)) fields[e.field] = e.message
  }
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR" as const,
        message: "Request validation failed.",
        fields,
      },
    },
    { status: 422 }
  )
}

/** Generic client error (400 by default). */
export function clientError(
  message: string,
  code: ErrorCode = "BAD_REQUEST",
  status = 400
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  )
}

/** 500 internal server error. Never expose raw error details. */
export function serverError(
  err?: unknown
): NextResponse<ApiError> {
  // Log internally but never leak stack traces to the client.
  if (err !== undefined) console.error("[api] internal error:", err)
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR" as const,
        message: "An unexpected error occurred. Please try again later.",
      },
    },
    { status: 500 }
  )
}
