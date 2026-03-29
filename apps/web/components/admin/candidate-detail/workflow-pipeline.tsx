import { ApplicationStatus } from "@prisma/client";

type Step = {
  label: string;
  statuses: ApplicationStatus[];
};

/** Linear stages for recruiter orientation — one primary label per major phase. */
const STEPS: Step[] = [
  { label: "Applied", statuses: [ApplicationStatus.APPLIED] },
  {
    label: "Screened",
    statuses: [ApplicationStatus.SCREENED],
  },
  {
    label: "Shortlist / review",
    statuses: [ApplicationStatus.SHORTLISTED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.PHONE_SCREEN],
  },
  {
    label: "Interview",
    statuses: [
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEWING,
    ],
  },
  {
    label: "Offer",
    statuses: [
      ApplicationStatus.OFFER_DRAFT,
      ApplicationStatus.OFFER_SENT,
      ApplicationStatus.OFFER_SIGNED,
    ],
  },
  {
    label: "Hired / Onboarding",
    statuses: [
      ApplicationStatus.HIRED,
      ApplicationStatus.ONBOARDING,
      ApplicationStatus.ONBOARDED,
    ],
  },
];

function stepIndex(status: ApplicationStatus): number {
  const i = STEPS.findIndex((s) => s.statuses.includes(status));
  return i === -1 ? 0 : i;
}

export function WorkflowPipeline({ currentStatus }: { currentStatus: ApplicationStatus }) {
  if (
    currentStatus === ApplicationStatus.REJECTED ||
    currentStatus === ApplicationStatus.WITHDRAWN
  ) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <span className="font-medium">Pipeline ended:</span>{" "}
        {currentStatus === ApplicationStatus.REJECTED ? "Rejected" : "Withdrawn"}
      </div>
    );
  }

  const active = stepIndex(currentStatus);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Workflow progress
      </h3>
      <ol className="mt-3 flex flex-wrap gap-2">
        {STEPS.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={step.label} className="flex items-center gap-2">
              {i > 0 ? (
                <span className="text-slate-300" aria-hidden>
                  →
                </span>
              ) : null}
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  current
                    ? "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2"
                    : done
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-slate-500">
        Current status:{" "}
        <span className="font-mono text-slate-700">{currentStatus.replace(/_/g, " ")}</span>
      </p>
    </div>
  );
}
