const sections = [
  { id: "resume", label: "Resume" },
  { id: "screening", label: "AI Screening" },
  { id: "interview", label: "Interview notes" },
  { id: "research", label: "Research" },
  { id: "history", label: "Status History" },
  { id: "activity", label: "Activity Log" },
];

export function CandidateDetailSectionNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="rounded border border-slate-300 px-3 py-2 text-sm no-underline"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
