export type ContactMailPayload = {
  name: string
  email: string
  message: string
}

export async function sendContactMail(_payload: ContactMailPayload): Promise<void> {
  // Placeholder transport boundary. Real provider wiring should live here.
}
