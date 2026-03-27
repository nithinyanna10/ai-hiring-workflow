import type { ReactNode } from "react";

type JobsSectionProps = {
  title: string;
  children: ReactNode;
};

export function JobsSection({ title, children }: JobsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="rounded-lg border border-border bg-white p-6">{children}</div>
    </section>
  );
}
