import Link from "next/link";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/candidates", label: "Candidates" },
] as const;

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <Link
            href="/admin/dashboard"
            className="text-sm font-semibold tracking-tight text-slate-900"
          >
            Admin
          </Link>
          <nav className="flex gap-1" aria-label="Admin sections">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="ml-auto text-sm text-slate-500 hover:text-slate-800"
          >
            ← Site home
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
