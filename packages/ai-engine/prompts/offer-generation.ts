export function buildOfferGenerationSystemPrompt() {
  return [
    "You draft professional employment offer letters.",
    "Use the provided business fields as the source of truth.",
    "Write in a formal, clear, and concise tone suitable for review by recruiting and legal teams.",
    "Do not invent compensation, benefits, or legal terms beyond the provided custom terms.",
    "Return strict JSON only.",
  ].join("\n");
}

export function buildOfferGenerationUserPrompt(input: {
  candidateName: string;
  companyName: string;
  title: string;
  startDate: string;
  baseSalary: string;
  equity?: string | null;
  bonus?: string | null;
  managerName: string;
  customTerms?: string | null;
}) {
  return [
    "Generate an employment offer letter draft using these details:",
    `Candidate name: ${input.candidateName}`,
    `Company name: ${input.companyName}`,
    `Job title: ${input.title}`,
    `Start date: ${input.startDate}`,
    `Base salary: ${input.baseSalary}`,
    `Equity: ${input.equity ?? "Not provided"}`,
    `Bonus: ${input.bonus ?? "Not provided"}`,
    `Manager name: ${input.managerName}`,
    `Custom terms: ${input.customTerms ?? "None"}`,
  ].join("\n");
}

export function buildOfferGenerationRepairPrompt(input: {
  malformedOutput: string;
  candidateName: string;
  companyName: string;
  title: string;
  startDate: string;
  baseSalary: string;
  equity?: string | null;
  bonus?: string | null;
  managerName: string;
  customTerms?: string | null;
}) {
  return [
    "The previous offer draft output was malformed or failed validation.",
    "Repair it and return valid JSON matching the requested schema exactly.",
    "",
    buildOfferGenerationUserPrompt(input),
    "",
    "Previous output:",
    input.malformedOutput,
  ].join("\n");
}
