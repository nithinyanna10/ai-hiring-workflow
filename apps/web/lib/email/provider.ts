import { env } from "../env";
import { MockEmailProvider } from "./providers/mock-email-provider";
import { ResendEmailProvider } from "./providers/resend-email-provider";
import type { EmailProvider } from "./types";

let providerInstance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (providerInstance) {
    return providerInstance;
  }

  providerInstance =
    env.EMAIL_PROVIDER === "resend"
      ? new ResendEmailProvider()
      : new MockEmailProvider();

  return providerInstance;
}
