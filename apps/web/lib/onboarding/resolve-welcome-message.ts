import {
  buildTemplateOnboardingWelcome,
  generateOnboardingWelcomeWithAI,
  OpenAIClient,
} from "@hiring-workflow/ai-engine";

import { env } from "../env";

export type WelcomeMessageSource = "openai" | "template";

export async function resolveOnboardingWelcomeMessage(input: {
  firstName: string;
  jobTitle: string;
  team: string;
  managerName: string | null;
}): Promise<{ message: string; source: WelcomeMessageSource }> {
  if (!env.OPENAI_API_KEY) {
    const { welcomeMessage } = buildTemplateOnboardingWelcome(input);
    return { message: welcomeMessage, source: "template" };
  }

  const provider = new OpenAIClient({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  });

  const { welcomeMessage } = await generateOnboardingWelcomeWithAI(provider, input);
  return { message: welcomeMessage, source: "openai" };
}
