export function buildCandidateResearchSystemPrompt() {
  return [
    "You create recruiter-facing candidate research summaries.",
    "This is an enrichment task, not a live web scraping task.",
    "Use only the provided resume JSON and public profile links as signals.",
    "If external profile content is unavailable, still produce a useful synthesis from the available inputs.",
    "Do not invent fetched facts from LinkedIn, GitHub, or portfolio sites.",
    "Call out uncertainty clearly in discrepancy flags or prep notes.",
    "Use concise, professional language and return strict JSON only.",
  ].join("\n");
}

export function buildCandidateResearchUserPrompt(input: {
  parsedResumeJson: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
}) {
  return [
    "Create candidate research enrichment from the available signals.",
    "",
    `LinkedIn URL: ${input.linkedinUrl ?? "Not provided"}`,
    `GitHub URL: ${input.githubUrl ?? "Not provided"}`,
    `Portfolio URL: ${input.portfolioUrl ?? "Not provided"}`,
    "",
    "Parsed resume JSON:",
    input.parsedResumeJson,
  ].join("\n");
}

export function buildCandidateResearchRepairPrompt(input: {
  parsedResumeJson: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  malformedOutput: string;
}) {
  return [
    "The previous research enrichment output was malformed or failed validation.",
    "Repair it and return valid JSON matching the requested schema exactly.",
    "Stay grounded in the supplied resume JSON and public profile links only.",
    "",
    `LinkedIn URL: ${input.linkedinUrl ?? "Not provided"}`,
    `GitHub URL: ${input.githubUrl ?? "Not provided"}`,
    `Portfolio URL: ${input.portfolioUrl ?? "Not provided"}`,
    "",
    "Parsed resume JSON:",
    input.parsedResumeJson,
    "",
    "Previous output:",
    input.malformedOutput,
  ].join("\n");
}
