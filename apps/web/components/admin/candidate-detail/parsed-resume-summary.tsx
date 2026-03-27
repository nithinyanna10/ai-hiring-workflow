import { DetailGridItem } from "./detail-grid";
import { StringList } from "./string-list";

type ParsedResumeSummaryProps = {
  parsedResumeJson: unknown;
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

export function ParsedResumeSummary({ parsedResumeJson }: ParsedResumeSummaryProps) {
  const parsedResume = getParsedResume(parsedResumeJson);

  if (!parsedResume) {
    return <p className="text-sm text-slate-500">Parsed resume data is not available yet.</p>;
  }

  return (
    <div className="space-y-6">
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
          <h3 className="text-sm font-medium text-slate-900">Skills</h3>
          <StringList items={parsedResume.skills ?? []} emptyLabel="No skills captured." />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-900">Recent job titles</h3>
          <StringList items={parsedResume.jobTitles ?? []} emptyLabel="No job titles captured." />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-900">Companies</h3>
          <StringList items={parsedResume.companies ?? []} emptyLabel="No companies captured." />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-900">Education</h3>
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
      </div>
    </div>
  );
}
