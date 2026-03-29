import { env } from "../../env";
import { MockEmailProvider } from "./mock-email-provider";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "../types";

/** Resend only sends from verified domains (or their built-in test address). Consumer inboxes cannot be used as From. */
const RESEND_DEFAULT_FROM = "onboarding@resend.dev";

const CONSUMER_FROM_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
]);

/** Supports `user@x.com` and `Name <user@x.com>`. */
function extractEmailAddress(raw: string): string | null {
  const trimmed = raw.trim();
  const angle = trimmed.match(/<([^>]+@[^>]+)>/);
  if (angle?.[1]) {
    return angle[1].trim().toLowerCase();
  }
  const plain = trimmed.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
  return plain ? plain[0].trim().toLowerCase() : null;
}

function resolveResendFromAddress(): string {
  const raw = env.EMAIL_FROM?.trim();
  if (!raw) {
    return RESEND_DEFAULT_FROM;
  }
  const email = extractEmailAddress(raw);
  if (!email) {
    return RESEND_DEFAULT_FROM;
  }
  const at = email.lastIndexOf("@");
  if (at <= 0) {
    return RESEND_DEFAULT_FROM;
  }
  const domain = email.slice(at + 1).toLowerCase();
  if (CONSUMER_FROM_DOMAINS.has(domain)) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console -- intentional dev hint for Resend domain rules
      console.warn(
        `[email] EMAIL_FROM (${raw}) cannot be used as Resend "from" without a verified domain. Using ${RESEND_DEFAULT_FROM}. Add your domain at https://resend.com/domains or leave EMAIL_FROM unset.`,
      );
    }
    return RESEND_DEFAULT_FROM;
  }
  return raw.includes("<") ? raw : email;
}

function shouldFallback403ToMock(errorBody: string): boolean {
  const m = errorBody.toLowerCase();
  return (
    m.includes("gmail.com domain is not verified") ||
    m.includes("verify your domain") ||
    m.includes("only send testing emails") ||
    m.includes("verify a domain")
  );
}

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    let from = resolveResendFromAddress();
    if (/@gmail\.|@googlemail\.|@yahoo\.|@hotmail\.|@outlook\./i.test(from)) {
      from = RESEND_DEFAULT_FROM;
    }

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

    const responseBody = await response.text();

    if (!response.ok) {
      if (response.status === 403 && shouldFallback403ToMock(responseBody)) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console -- dev fallback path
          console.warn(
            "[email] Resend returned 403 (domain or sandbox limits). Delivering via mock provider so the workflow continues — check the Mock emails panel.",
          );
        }
        const mock = new MockEmailProvider();
        const result = await mock.send({
          ...input,
          flow: input.flow ?? "resend_fallback",
        });
        return {
          provider: "mock(resend_blocked)",
          messageId: result.messageId,
        };
      }

      let hint = "";
      try {
        const parsed = JSON.parse(responseBody) as { message?: string };
        const msg = parsed.message ?? "";
        if (
          response.status === 403 &&
          (msg.includes("only send testing emails") || msg.includes("verify a domain"))
        ) {
          hint =
            " Resend test mode: verify a domain at resend.com/domains or set EMAIL_PROVIDER=mock for local demos.";
        }
      } catch {
        // keep generic error below
      }
      throw new Error(`Resend request failed (${response.status}): ${responseBody}${hint}`);
    }

    const payload = JSON.parse(responseBody) as { id?: string };

    return {
      provider: this.name,
      messageId: payload.id,
    };
  }
}
