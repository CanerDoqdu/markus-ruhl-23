/**
 * Minimal schema-based request validator.
 *
 * No external dependencies — uses TypeScript types and runtime checks only.
 * If Zod is added to package.json in the future, replace this module and
 * update callers to use z.parse() — the ApiError / ApiSuccess contracts remain.
 *
 * NOTE (Elijah coordination): Contact schema defined here. If Elijah's security
 * hardening changes the accepted input shape, update ContactSchema below and
 * bump field constraints accordingly.
 */

export type FieldRule = {
  type: "string" | "email"
  required?: boolean
  minLength?: number
  maxLength?: number
  /** Label used in error messages (defaults to field key). */
  label?: string
}

export type Schema = Record<string, FieldRule>

export type ValidationError = {
  field: string
  code: string
  message: string
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ValidationError[] }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates a plain object against a schema definition.
 * Returns all field errors at once (not short-circuit).
 */
export function validate(data: unknown, schema: Schema): ValidationResult {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return {
      ok: false,
      errors: [
        {
          field: "_body",
          code: "INVALID_BODY",
          message: "Request body must be a JSON object.",
        },
      ],
    }
  }

  const record = data as Record<string, unknown>
  const errors: ValidationError[] = []

  for (const [key, rule] of Object.entries(schema)) {
    const label = rule.label ?? key
    const raw = record[key]

    if (rule.required && (raw === undefined || raw === null || raw === "")) {
      errors.push({
        field: key,
        code: "REQUIRED",
        message: `${label} is required.`,
      })
      continue
    }

    if (raw === undefined || raw === null || raw === "") continue

    if (typeof raw !== "string") {
      errors.push({
        field: key,
        code: "INVALID_TYPE",
        message: `${label} must be a string.`,
      })
      continue
    }

    if (rule.minLength !== undefined && raw.length < rule.minLength) {
      errors.push({
        field: key,
        code: "TOO_SHORT",
        message: `${label} must be at least ${rule.minLength} characters.`,
      })
    }

    if (rule.maxLength !== undefined && raw.length > rule.maxLength) {
      errors.push({
        field: key,
        code: "TOO_LONG",
        message: `${label} must be at most ${rule.maxLength} characters.`,
      })
    }

    if (rule.type === "email" && !EMAIL_RE.test(raw)) {
      errors.push({
        field: key,
        code: "INVALID_EMAIL",
        message: `${label} must be a valid email address.`,
      })
    }
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true }
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/** Schema for POST /api/contact — align with Elijah's sanitisation layer. */
export const ContactSchema: Schema = {
  name: {
    type: "string",
    required: true,
    minLength: 2,
    maxLength: 100,
    label: "Name",
  },
  email: {
    type: "email",
    required: true,
    maxLength: 254,
    label: "Email",
  },
  message: {
    type: "string",
    required: true,
    minLength: 10,
    maxLength: 2000,
    label: "Message",
  },
}
