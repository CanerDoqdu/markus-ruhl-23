import { NextRequest } from "next/server"
import { validate, ContactSchema } from "@/lib/api/validation"
import { ok, validationError, clientError, serverError } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return clientError("Request body must be valid JSON.")
  }

  const result = validate(body, ContactSchema)
  if (!result.ok) {
    return validationError(result.errors)
  }

  // Safe cast — validation guarantees these fields are present strings.
  const { name, email, message } = body as { name: string; email: string; message: string }

  // TODO: Implement email sending logic here
  // Options:
  // 1. Use Resend: https://resend.com/docs
  // 2. Use SendGrid: https://sendgrid.com/
  // 3. Use Nodemailer with SMTP

  // NOTE (Elijah coordination): If sanitisation is applied upstream before
  // reaching this handler, remove the console.log or ensure sanitised values
  // are what gets logged — never log raw user input in production.
  console.log("Contact form submission:", {
    name,
    email,
    timestamp: new Date().toISOString(),
  })

  try {
    // Simulate processing delay (remove when real email sender is wired up)
    await new Promise((resolve) => setTimeout(resolve, 500))

    return ok({ message: "Message received successfully! We'll get back to you soon." })
  } catch (err) {
    return serverError(err)
  }
}
