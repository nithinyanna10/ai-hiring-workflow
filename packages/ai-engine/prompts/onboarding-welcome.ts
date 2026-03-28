export function buildOnboardingWelcomeSystemPrompt() {
  return [
    "You write short, warm Slack welcome messages for new hires who just accepted an offer.",
    "Use a professional but friendly tone. Mention the role and team naturally.",
    "Do not invent benefits, policies, or dates that were not provided.",
    "Keep the message under 120 words. No markdown headings.",
  ].join(" ");
}

export function buildOnboardingWelcomeUserPrompt(input: {
  firstName: string;
  jobTitle: string;
  team: string;
  managerName: string | null;
}) {
  const managerLine = input.managerName
    ? `Their hiring manager is ${input.managerName}.`
    : "Hiring manager name was not provided.";

  return [
    `New hire first name: ${input.firstName}`,
    `Role title: ${input.jobTitle}`,
    `Team: ${input.team}`,
    managerLine,
    "",
    "Write one Slack direct-message style welcome they will receive after joining the workspace.",
  ].join("\n");
}
