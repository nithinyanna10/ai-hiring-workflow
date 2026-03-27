export function buildResumeScreeningSystemPrompt() {
  return [
    "You assess candidate fit against an exact job description.",
    "Compare the candidate only against the stated requirements and responsibilities in the job description.",
    "Do not infer missing qualifications as present.",
    "Score conservatively based on evidence in the parsed resume data.",
    "Use concise, professional language.",
    "Return strict JSON only.",
  ].join("\n");
}

export function buildResumeScreeningUserPrompt(
  parsedResumeJson: string,
  jobDescription: string,
) {
  return [
    "Evaluate candidate fit for the following role.",
    "",
    "Job description:",
    jobDescription,
    "",
    "Parsed resume JSON:",
    parsedResumeJson,
  ].join("\n");
}

export function buildResumeScreeningRepairPrompt(
  parsedResumeJson: string,
  jobDescription: string,
  malformedOutput: string,
) {
  return [
    "The previous screening output was malformed or failed validation.",
    "Repair it and return valid JSON that matches the requested schema exactly.",
    "Keep the evaluation grounded in the provided resume data and job description only.",
    "",
    "Job description:",
    jobDescription,
    "",
    "Parsed resume JSON:",
    parsedResumeJson,
    "",
    "Previous output:",
    malformedOutput,
  ].join("\n");
}
