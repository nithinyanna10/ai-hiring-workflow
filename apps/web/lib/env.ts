import { z } from "zod";

/** `.env` often uses `KEY=`; treat blank as unset so Zod optional fields work. */
function emptyToUndefined(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  return value.trim().length === 0 ? undefined : value;
}

const optionalNonEmptyString = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: optionalNonEmptyString,
  NEXT_PUBLIC_APP_URL: z.string().url(),
  /** Omit or leave unset to auto-pick Resend when `RESEND_API_KEY` is set, else mock. */
  EMAIL_PROVIDER: z.preprocess(emptyToUndefined, z.enum(["mock", "resend"]).optional()),
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().email().optional()),
  RESEND_API_KEY: optionalNonEmptyString,
  OPENAI_API_KEY: optionalNonEmptyString,
  OPENAI_MODEL: optionalNonEmptyString,
  SCREENING_SCORE_THRESHOLD: z.coerce.number().min(0).max(100).default(75),
  SLACK_PROVIDER: z.enum(["mock", "slack_api"]).default("mock"),
  SLACK_BOT_TOKEN: optionalNonEmptyString,
  /** Channel ID for HR onboarding alerts (e.g. C0123ABC). */
  SLACK_HR_CHANNEL_ID: optionalNonEmptyString,
  /** Fallback channel to post candidate welcome when DM is not available (stub). */
  SLACK_WELCOME_CHANNEL_ID: optionalNonEmptyString,
  /** Workspace ID for admin.users.invite when using slack_api (enterprise setups). */
  SLACK_TEAM_ID: optionalNonEmptyString,
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  EMAIL_FROM: process.env.EMAIL_FROM,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  SCREENING_SCORE_THRESHOLD: process.env.SCREENING_SCORE_THRESHOLD,
  SLACK_PROVIDER: process.env.SLACK_PROVIDER,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_HR_CHANNEL_ID: process.env.SLACK_HR_CHANNEL_ID,
  SLACK_WELCOME_CHANNEL_ID: process.env.SLACK_WELCOME_CHANNEL_ID,
  SLACK_TEAM_ID: process.env.SLACK_TEAM_ID,
});

/** Resend when key exists and not explicitly `mock`; otherwise mock. */
export function resolveEmailDeliveryMode(): "mock" | "resend" {
  if (env.EMAIL_PROVIDER === "mock") {
    return "mock";
  }
  if (env.EMAIL_PROVIDER === "resend") {
    return "resend";
  }
  return env.RESEND_API_KEY ? "resend" : "mock";
}
