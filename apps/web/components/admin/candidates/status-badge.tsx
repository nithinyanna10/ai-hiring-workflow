type StatusBadgeProps = {
  status: string;
};

const badgeClasses: Record<string, string> = {
  APPLIED: "border-slate-300 bg-slate-100 text-slate-700",
  SCREENED: "border-blue-200 bg-blue-50 text-blue-700",
  SHORTLISTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  PHONE_SCREEN: "border-violet-200 bg-violet-50 text-violet-700",
  INTERVIEW_SCHEDULED: "border-cyan-200 bg-cyan-50 text-cyan-700",
  INTERVIEWING: "border-indigo-200 bg-indigo-50 text-indigo-700",
  OFFER_DRAFT: "border-orange-200 bg-orange-50 text-orange-700",
  OFFER_SENT: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  OFFER_SIGNED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  HIRED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  WITHDRAWN: "border-slate-300 bg-slate-100 text-slate-700",
  ONBOARDING: "border-teal-200 bg-teal-50 text-teal-700",
  ONBOARDED: "border-green-200 bg-green-50 text-green-800",
};

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const className = badgeClasses[status] ?? "border-slate-300 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
