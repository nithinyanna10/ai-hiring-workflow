import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  EMAIL_PROVIDER: z.enum(["mock", "resend"]).default("mock"),
  EMAIL_FROM: z.string().email().optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).optional(),
  CLAUDE_API_KEY: z.string().min(1).optional(),
  CLAUDE_MODEL: z.string().min(1).optional(),
  SCREENING_SCORE_THRESHOLD: z.coerce.number().min(0).max(100).default(75),
  SLACK_PROVIDER: z.enum(["mock", "slack_api"]).default("mock"),
  SLACK_BOT_TOKEN: z.string().min(1).optional(),
  /** Channel ID for HR onboarding alerts (e.g. C0123ABC). */
  SLACK_HR_CHANNEL_ID: z.string().min(1).optional(),
  /** Fallback channel to post candidate welcome when DM is not available (stub). */
  SLACK_WELCOME_CHANNEL_ID: z.string().min(1).optional(),
  /** Workspace ID for admin.users.invite when using slack_api (enterprise setups). */
  SLACK_TEAM_ID: z.string().min(1).optional(),
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
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  CLAUDE_MODEL: process.env.CLAUDE_MODEL,
  SCREENING_SCORE_THRESHOLD: process.env.SCREENING_SCORE_THRESHOLD,
  SLACK_PROVIDER: process.env.SLACK_PROVIDER,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_HR_CHANNEL_ID: process.env.SLACK_HR_CHANNEL_ID,
  SLACK_WELCOME_CHANNEL_ID: process.env.SLACK_WELCOME_CHANNEL_ID,
  SLACK_TEAM_ID: process.env.SLACK_TEAM_ID,
});
