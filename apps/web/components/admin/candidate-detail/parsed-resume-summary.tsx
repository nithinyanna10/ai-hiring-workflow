import { DetailGridItem } from "./detail-grid";
import { StringList } from "./string-list";

type ParseMeta = {
  enrichmentApplied: boolean;
  skillsInferred: boolean;
  companiesInferred: boolean;
  educationInferred: boolean;
  parseEnrichmentConfidence: "low" | "medium" | "high";
};

type ParsedResumeSummaryProps = {
  parsedResumeJson: unknown;
  /** e.g. LinkedIn + portfolio from the application form (not always in parsed resume). */
  profileLinks?: { label: string; href: string }[];
  parseMeta?: ParseMeta | null;
};

type ParsedResumeShape = Partial<{
  fullName: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  yearsExperience: number | null;
  education: string[];
  companies: string[];
  jobTitles: string[];
  achievements: string[];
  certifications: string[];
  projectHighlights: string[];
  inferredSeniority: string;
}>;

function getParsedResume(value: unknown): ParsedResumeShape | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as ParsedResumeShape;
}

export function ParsedResumeSummary({
  parsedResumeJson,
  profileLinks = [],
  parseMeta,
}: ParsedResumeSummaryProps) {
  const parsedResume = getParsedResume(parsedResumeJson);

  if (!parsedResume) {
    return <p className="text-sm text-slate-500">Parsed resume data is not available yet.</p>;
  }

  return (
    <div className="space-y-6">
      {profileLinks.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-900">Profile links (from application)</h3>
          <ul className="space-y-1 text-sm">
            {profileLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-blue-700 underline" target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailGridItem label="Full name" value={parsedResume.fullName ?? "Not available"} />
        <DetailGridItem label="Email" value={parsedResume.email ?? "Not available"} />
        <DetailGridItem label="Phone" value={parsedResume.phone ?? "Not available"} />
        <DetailGridItem
          label="Years experience"
          value={parsedResume.yearsExperience ?? "Not available"}
        />
        <DetailGridItem
          label="Inferred seniority"
          value={parsedResume.inferredSeniority ?? "Not available"}
        />
      </dl>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-slate-900">Skills / technologies</h3>
            {parseMeta?.skillsInferred ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                Inferred · enrichment {parseMeta.parseEnrichmentConfidence}
              </span>
            ) : null}
          </div>
          <StringList
            items={parsedResume.skills ?? []}
            emptyLabel="No skills captured — try a text-based PDF or DOCX."
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-900">Recent job titles</h3>
          <StringList items={parsedResume.jobTitles ?? []} emptyLabel="No job titles captured." />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-slate-900">Companies</h3>
            {parseMeta?.companiesInferred ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                Inferred
              </span>
            ) : null}
          </div>
          <StringList items={parsedResume.companies ?? []} emptyLabel="No companies captured." />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-slate-900">Education</h3>
            {parseMeta?.educationInferred ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                Inferred
              </span>
            ) : null}
          </div>
          <StringList items={parsedResume.education ?? []} emptyLabel="No education captured." />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-900">Certifications</h3>
          <StringList
            items={parsedResume.certifications ?? []}
            emptyLabel="No certifications captured."
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-900">Project highlights</h3>
          <StringList
            items={parsedResume.projectHighlights ?? []}
            emptyLabel="No project highlights captured."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-sm font-medium text-slate-900">Achievements</h3>
          <StringList
            items={parsedResume.achievements ?? []}
            emptyLabel="No achievements captured by the parser."
          />
        </div>
      </div>
    </div>
  );
}
