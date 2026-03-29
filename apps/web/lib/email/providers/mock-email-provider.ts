import { recordMockEmail } from "../mock-email-store";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "../types";

export class MockEmailProvider implements EmailProvider {
  readonly name = "mock";

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const rec = recordMockEmail(input);

    console.info("[mock-email] EMAIL SENT (preview only — no external delivery)", {
      flow: rec.flow,
      to: rec.to,
      subject: rec.subject,
      id: rec.id,
    });

    return {
      provider: this.name,
      messageId: rec.id,
    };
  }
}
