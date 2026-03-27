import { SlotStatus } from "@prisma/client";

type SlotTableItem = {
  id: string;
  startTime: Date;
  endTime: Date;
  slotStatus: SlotStatus;
  holdExpiresAt: Date | null;
  timezone: string | null;
  interviewerName: string | null;
  meetingLocation: string | null;
  reservationToken: string | null;
  lockVersion: number;
};

type SlotTableProps = {
  slots: SlotTableItem[];
};

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function SlotTable({ slots }: SlotTableProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        No offered slots have been created yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-600">Time</th>
            <th className="px-4 py-3 font-medium text-slate-600">Status</th>
            <th className="px-4 py-3 font-medium text-slate-600">Hold expires</th>
            <th className="px-4 py-3 font-medium text-slate-600">Interviewer</th>
            <th className="px-4 py-3 font-medium text-slate-600">Location</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {slots.map((slot) => (
            <tr key={slot.id}>
              <td className="px-4 py-3 text-slate-700">
                {formatDateTime(slot.startTime)} to {formatDateTime(slot.endTime)}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatStatus(slot.slotStatus)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(slot.holdExpiresAt)}</td>
              <td className="px-4 py-3 text-slate-700">{slot.interviewerName ?? "TBD"}</td>
              <td className="px-4 py-3 text-slate-700">{slot.meetingLocation ?? "TBD"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
