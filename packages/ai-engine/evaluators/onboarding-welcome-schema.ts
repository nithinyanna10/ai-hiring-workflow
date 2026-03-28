import { z } from "zod";

export const onboardingWelcomeResultSchema = z.object({
  welcomeMessage: z
    .string()
    .min(20, "Welcome message should be substantive.")
    .max(4000, "Welcome message is too long for Slack."),
});

export type OnboardingWelcomeResult = z.infer<typeof onboardingWelcomeResultSchema>;

export const onboardingWelcomeResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["welcomeMessage"],
  properties: {
    welcomeMessage: {
      type: "string",
      description: "Personalized Slack welcome message for the new hire.",
    },
  },
} as const;
