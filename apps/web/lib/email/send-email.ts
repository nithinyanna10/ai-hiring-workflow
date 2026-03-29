import { getEmailProvider } from "./provider";
import type { SendEmailInput, SendEmailResult } from "./types";

/** Single entry point for outbound mail; respects `EMAIL_PROVIDER` (mock vs Resend). */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  return getEmailProvider().send(input);
}
