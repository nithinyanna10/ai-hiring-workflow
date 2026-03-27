import type { EmailProvider, SendEmailInput, SendEmailResult } from "../types";

export class MockEmailProvider implements EmailProvider {
  readonly name = "mock";

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    console.info("[mock-email-provider] sending email", {
      to: input.to,
      subject: input.subject,
    });

    return {
      provider: this.name,
      messageId: `mock-${Date.now()}`,
    };
  }
}
