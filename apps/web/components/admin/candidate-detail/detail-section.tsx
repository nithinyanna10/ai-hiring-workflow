import type { ReactNode } from "react";

type DetailSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function CandidateDetailSection({ id, title, children }: DetailSectionProps) {
  return (
    <section id={id} className="space-y-4 scroll-mt-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="rounded-lg border border-border bg-white p-6">{children}</div>
    </section>
  );
}
