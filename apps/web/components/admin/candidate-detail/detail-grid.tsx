import type { ReactNode } from "react";

type DetailGridItemProps = {
  label: string;
  value: ReactNode;
};

export function DetailGridItem({ label, value }: DetailGridItemProps) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}
