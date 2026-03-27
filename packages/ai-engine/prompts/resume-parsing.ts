export function buildResumeParsingSystemPrompt() {
  return [
    "You extract structured resume data.",
    "Return only data grounded in the provided resume text.",
    "Do not invent experience, companies, dates, or credentials.",
    "Use null for missing single-value fields.",
    "Use empty arrays for missing list fields.",
    "Estimate yearsExperience conservatively from the evidence in the resume.",
    "Set inferredSeniority to one of: intern, junior, mid, senior, staff, principal, executive, unknown.",
    "Output strict JSON matching the requested schema.",
  ].join("\n");
}

export function buildResumeParsingUserPrompt(rawResumeText: string) {
  return [
    "Parse the following resume text into structured JSON.",
    "",
    "Resume text:",
    rawResumeText,
  ].join("\n");
}

export function buildResumeRepairPrompt(rawResumeText: string, malformedOutput: string) {
  return [
    "The previous output was malformed or failed validation.",
    "Repair it and return valid JSON that matches the requested schema exactly.",
    "Do not add commentary.",
    "",
    "Original resume text:",
    rawResumeText,
    "",
    "Previous output:",
    malformedOutput,
  ].join("\n");
}
