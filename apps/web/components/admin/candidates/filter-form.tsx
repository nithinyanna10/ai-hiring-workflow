import type { AdminCandidateFilterOption, AdminCandidateFilters } from "../../../types";

type CandidateFilterFormProps = {
  filters: AdminCandidateFilters;
  roleOptions: AdminCandidateFilterOption[];
  statusOptions: AdminCandidateFilterOption[];
};

export function CandidateFilterForm({
  filters,
  roleOptions,
  statusOptions,
}: CandidateFilterFormProps) {
  return (
    <form className="grid gap-4 rounded-lg border border-border bg-white p-5 md:grid-cols-4">
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Role</span>
        <select
          name="role"
          defaultValue={filters.role}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Status</span>
        <select
          name="status"
          defaultValue={filters.status}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">From</span>
        <input
          type="date"
          name="dateFrom"
          defaultValue={filters.dateFrom}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">To</span>
        <input
          type="date"
          name="dateTo"
          defaultValue={filters.dateTo}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="md:col-span-4 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          Apply filters
        </button>
        <a href="/admin/candidates" className="rounded border border-slate-300 px-4 py-2 text-sm no-underline">
          Reset
        </a>
      </div>
    </form>
  );
}
