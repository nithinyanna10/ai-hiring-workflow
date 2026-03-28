import { resolveEmailDeliveryMode } from "../env";
import { MockEmailProvider } from "./providers/mock-email-provider";
import { ResendEmailProvider } from "./providers/resend-email-provider";
import type { EmailProvider } from "./types";

let providerInstance: EmailProvider | null = null;
let cachedMode: "mock" | "resend" | null = null;

export function getEmailProvider(): EmailProvider {
  const mode = resolveEmailDeliveryMode();
  if (providerInstance && cachedMode === mode) {
    return providerInstance;
  }

  cachedMode = mode;
  providerInstance =
    mode === "resend" ? new ResendEmailProvider() : new MockEmailProvider();

  return providerInstance;
}
