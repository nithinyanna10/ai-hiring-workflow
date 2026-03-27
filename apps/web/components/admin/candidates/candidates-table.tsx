import Link from "next/link";

import type { AdminCandidateListItem } from "../../../types";
import { StatusBadge } from "./status-badge";

type CandidatesTableProps = {
  applications: AdminCandidateListItem[];
};

function formatSubmissionDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatAiScore(value: number | null) {
  return value === null ? "Pending" : `${value}`;
}

export function CandidatesTable({ applications }: CandidatesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-600">Candidate name</th>
            <th className="px-4 py-3 font-medium text-slate-600">Role applied for</th>
            <th className="px-4 py-3 font-medium text-slate-600">Submission date</th>
            <th className="px-4 py-3 font-medium text-slate-600">AI score</th>
            <th className="px-4 py-3 font-medium text-slate-600">Current status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((application) => (
            <tr key={application.applicationId}>
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link
                  href={`/admin/candidates/${application.applicationId}`}
                  className="hover:underline"
                >
                  {application.candidateName}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">
                <Link href={`/careers/${application.roleSlug}`} className="hover:underline">
                  {application.roleTitle}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatSubmissionDate(application.submittedAt)}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatAiScore(application.aiScore)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={application.currentStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
