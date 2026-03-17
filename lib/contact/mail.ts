export type ContactMailPayload = {
  name: string
  email: string
  message: string
}

/**
 * Send a contact-form email using the configured transport.
 *
 * Priority order:
 *   1. Resend (if RESEND_API_KEY is set)
 *   2. SMTP via Nodemailer (if SMTP_HOST is set)
 *   3. Console-log fallback (dev / preview deploys)
 *
 * The transport boundary is intentionally thin: the route handler owns
 * validation, rate-limiting, and sanitization. This function only sends.
 */
export async function sendContactMail(payload: ContactMailPayload): Promise<void> {
  const { name, email, message } = payload

  const to = process.env.CONTACT_MAIL_TO || "contact@markusruhl.com"
  const from = process.env.CONTACT_MAIL_FROM || "noreply@markusruhl.com"
  const subject = `New contact from ${name}`

  // ─── Resend transport ──────────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        reply_to: email,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          "",
          "Message:",
          message,
        ].join("\n"),
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#FFFF92;background:#0a0c13;padding:16px;border-radius:8px 8px 0 0;margin:0">
              New Contact Form Submission
            </h2>
            <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <p><strong>Message:</strong></p>
              <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "unknown")
      throw new Error(`Resend API error ${res.status}: ${body}`)
    }

    return
  }

  // ─── SMTP transport (Nodemailer) ───────────────────────────────────────────
  if (process.env.SMTP_HOST) {
    // Dynamic require keeps nodemailer out of the webpack bundle.
    // It's loaded at runtime only when SMTP_HOST is configured.
    let nodemailer
    try {
      // @ts-expect-error — nodemailer is an optional peer dependency
      nodemailer = await import(/* webpackIgnore: true */ "nodemailer")
    } catch {
      console.warn("[mail] nodemailer is not installed — skipping SMTP transport. Install it with: npm i nodemailer")
      // Fall through to console fallback below
    }

    if (nodemailer) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: (Number(process.env.SMTP_PORT) || 587) === 465,
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      })

      await transporter.sendMail({
        from,
        to,
        replyTo: email,
        subject,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#FFFF92;background:#0a0c13;padding:16px;border-radius:8px 8px 0 0;margin:0">
              New Contact Form Submission
            </h2>
            <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <p><strong>Message:</strong></p>
              <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
            </div>
          </div>
        `,
      })

      return
    }
  }

  // ─── Fallback: structured console log (dev / preview) ──────────────────────
  // PII POLICY: name, email, and message are NEVER logged — they are redacted
  // here so the fallback path cannot accidentally leak user data to log
  // aggregators even when no mail transport is configured.
  console.warn(
    "[mail] No mail provider configured (set RESEND_API_KEY or SMTP_HOST). " +
    "Logging contact submission to console."
  )
  console.info(JSON.stringify({
    event: "contact_submission_fallback",
    to,
    from,
    subject: "New contact from [REDACTED]",
    replyTo: "[REDACTED]",
    name: "[REDACTED]",
    messageLength: message.length,
    timestamp: new Date().toISOString(),
  }))
}

/** Escape HTML entities to prevent injection in email HTML body. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
