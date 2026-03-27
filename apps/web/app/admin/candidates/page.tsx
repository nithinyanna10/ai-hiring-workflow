import { CandidatesEmptyState } from "../../../components/admin/candidates/candidates-empty-state";
import { CandidatesTable } from "../../../components/admin/candidates/candidates-table";
import { CandidateFilterForm } from "../../../components/admin/candidates/filter-form";
import {
  getAdminCandidateFilters,
  getAdminCandidates,
  parseAdminCandidateFilters,
} from "../../../lib/admin/candidates";
import type { PageSearchParams } from "../../../types";

export const dynamic = "force-dynamic";

export default async function AdminCandidatesPage({
  searchParams,
}: PageSearchParams<{
  role?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}>) {
  const resolvedSearchParams = await searchParams;
  const filters = parseAdminCandidateFilters(resolvedSearchParams);
  const [{ roleOptions, statusOptions }, applications] = await Promise.all([
    getAdminCandidateFilters(),
    getAdminCandidates(filters),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Admin
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Candidates</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Review all submitted applications with server-side filters for role, status, and date
          range.
        </p>
      </div>

      <div className="space-y-6">
        <CandidateFilterForm
          filters={filters}
          roleOptions={roleOptions}
          statusOptions={statusOptions}
        />

        {applications.length === 0 ? (
          <CandidatesEmptyState />
        ) : (
          <CandidatesTable applications={applications} />
        )}
      </div>
    </main>
  );
}
