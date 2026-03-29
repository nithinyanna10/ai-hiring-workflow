import type { StructuredResume } from "@hiring-workflow/ai-engine";

/** Stored alongside resume JSON for honest UI (“inferred” labels). */
export type ParseResumeMeta = {
  enrichmentApplied: boolean;
  skillsInferred: boolean;
  companiesInferred: boolean;
  educationInferred: boolean;
  /** Heuristic confidence in post-parse gap-fill (not the screening model). */
  parseEnrichmentConfidence: "low" | "medium" | "high";
};

const TECH_KEYWORDS = [
  "python",
  "javascript",
  "typescript",
  "react",
  "node.js",
  "nodejs",
  "next.js",
  "aws",
  "gcp",
  "azure",
  "kubernetes",
  "docker",
  "sql",
  "postgresql",
  "mongodb",
  "redis",
  "graphql",
  "pytorch",
  "tensorflow",
  "scikit-learn",
  "machine learning",
  "deep learning",
  "nlp",
  "llm",
  "openai",
  "data analysis",
  "pandas",
  "numpy",
  "spark",
  "kafka",
  "java",
  "kotlin",
  "go",
  "golang",
  "rust",
  "c++",
  "swift",
  "terraform",
  "ci/cd",
  "git",
  "linux",
  "tensorflow",
  "keras",
  "computer vision",
  "ml",
  "ai",
];

const EDU_PATTERN =
  /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|MBA|Bachelor|Master|Doctorate|Associate)\b[^.\n]{0,120}/gi;

function extractCompaniesFromLines(rawText: string): string[] {
  const out: string[] = [];
  for (const line of rawText.split("\n")) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length >= 2) {
      const right = parts[parts.length - 1];
      if (right && right.length > 2 && right.length < 80 && /^[A-Z]/.test(right)) {
        out.push(right.replace(/\s+/g, " "));
      }
    }
    const atMatch = line.match(/\bat\s+([A-Z][A-Za-z0-9&\-. ]{2,50})\b/);
    if (atMatch?.[1]) {
      out.push(atMatch[1].trim());
    }
  }
  return out;
}

function uniqSorted(items: string[]) {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/**
 * Second pass: fill empty structured fields from raw text using keywords + light patterns.
 * Does not replace model output when arrays are already populated.
 */
export function enrichParsedResumeFromRawText(
  parsed: StructuredResume,
  rawText: string,
): { resume: StructuredResume; meta: ParseResumeMeta } {
  const lower = rawText.toLowerCase();
  const meta: ParseResumeMeta = {
    enrichmentApplied: false,
    skillsInferred: false,
    companiesInferred: false,
    educationInferred: false,
    parseEnrichmentConfidence: "low",
  };

  let skills = [...parsed.skills];
  let education = [...parsed.education];
  let companies = [...parsed.companies];

  if (skills.length === 0) {
    const inferred: string[] = [];
    for (const kw of TECH_KEYWORDS) {
      if (lower.includes(kw.toLowerCase())) {
        inferred.push(
          kw
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        );
      }
    }
    if (inferred.length > 0) {
      skills = uniqSorted([...skills, ...inferred]);
      meta.skillsInferred = true;
      meta.enrichmentApplied = true;
    }
  }

  if (education.length === 0) {
    const found: string[] = [];
    const matches = rawText.matchAll(EDU_PATTERN);
    for (const m of matches) {
      const line = m[0]?.trim();
      if (line && line.length > 5 && line.length < 200) {
        found.push(line.replace(/\s+/g, " "));
      }
    }
    if (found.length > 0) {
      education = uniqSorted([...education, ...found.slice(0, 8)]);
      meta.educationInferred = true;
      meta.enrichmentApplied = true;
    }
  }

  if (companies.length === 0) {
    const found = extractCompaniesFromLines(rawText);
    if (found.length > 0) {
      companies = uniqSorted([...companies, ...found.slice(0, 12)]);
      meta.companiesInferred = true;
      meta.enrichmentApplied = true;
    }
  }

  if (meta.enrichmentApplied) {
    const parts = [meta.skillsInferred, meta.educationInferred, meta.companiesInferred].filter(
      Boolean,
    ).length;
    meta.parseEnrichmentConfidence = parts >= 2 ? "high" : parts === 1 ? "medium" : "low";
  }

  return {
    resume: {
      ...parsed,
      skills: uniqSorted(skills),
      education: uniqSorted(education),
      companies: uniqSorted(companies),
    },
    meta,
  };
}

export function mergeResumeJsonForStorage(
  resume: StructuredResume,
  meta: ParseResumeMeta,
): Record<string, unknown> {
  return {
    ...resume,
    _parseMeta: meta,
  };
}

export function extractParseMeta(value: unknown): ParseResumeMeta | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const o = value as Record<string, unknown>;
  const m = o._parseMeta;
  if (!m || typeof m !== "object") {
    return null;
  }
  const meta = m as Record<string, unknown>;
  return {
    enrichmentApplied: Boolean(meta.enrichmentApplied),
    skillsInferred: Boolean(meta.skillsInferred),
    companiesInferred: Boolean(meta.companiesInferred),
    educationInferred: Boolean(meta.educationInferred),
    parseEnrichmentConfidence:
      meta.parseEnrichmentConfidence === "high" || meta.parseEnrichmentConfidence === "medium"
        ? meta.parseEnrichmentConfidence
        : "low",
  };
}
