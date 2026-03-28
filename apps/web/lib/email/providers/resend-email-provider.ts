import { env } from "../../env";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "../types";

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    // Resend allows this sender for testing without a verified domain.
    const from = env.EMAIL_FROM ?? "onboarding@resend.dev";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend request failed (${response.status}): ${errorBody}`);
    }

    const payload = (await response.json()) as { id?: string };

    return {
      provider: this.name,
      messageId: payload.id,
    };
  }
}
