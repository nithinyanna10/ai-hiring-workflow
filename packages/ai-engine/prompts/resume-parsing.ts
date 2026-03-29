export function buildResumeParsingSystemPrompt() {
  return [
    "You extract structured resume data for a hiring system. Maximize recall: populate every schema field with the best evidence or reasonable inference from the text.",
    "If explicit bullets are missing, infer skills from project descriptions, tools, frameworks, and keywords (e.g. Python, AWS, React, ML, data pipelines).",
    "Infer companies from employer lines, headers, or 'Company | Role' patterns even if formatting is noisy.",
    "Infer education from degree names, schools, and graduation lines — use partial strings if full detail is missing.",
    "Prefer populated arrays over empty ones when the resume gives any hint. Use empty arrays only when there is truly no evidence.",
    "Do not invent employers or degrees that contradict the text; inference from context is allowed.",
    "Use null for missing single-value fields when unknown.",
    "Estimate yearsExperience conservatively from dates or seniority cues in the resume.",
    "Set inferredSeniority to one of: intern, junior, mid, senior, staff, principal, executive, unknown.",
    "Output strict JSON matching the requested schema.",
  ].join("\n");
}

export function buildResumeParsingUserPrompt(rawResumeText: string) {
  return [
    "Parse the following resume text into structured JSON.",
    "Extract ALL plausible skills, companies, job titles, education lines, certifications, achievements, and project highlights.",
    "When the resume is sparse, infer likely skills and employers from project blurbs and keywords.",
    "",
    "Resume text:",
    rawResumeText,
  ].join("\n");
}

export function buildResumeRepairPrompt(rawResumeText: string, malformedOutput: string) {
  return [
    "The previous output was malformed or failed validation.",
    "Repair it and return valid JSON that matches the requested schema exactly.",
    "Ensure skills, companies, education, and jobTitles are as complete as the text allows (infer from context where needed).",
    "Do not add commentary.",
    "",
    "Original resume text:",
    rawResumeText,
    "",
    "Previous output:",
    malformedOutput,
  ].join("\n");
}
