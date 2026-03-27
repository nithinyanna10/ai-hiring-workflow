import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-slate-600">{description}</p> : null}
      </header>
      {children}
    </main>
  );
}
