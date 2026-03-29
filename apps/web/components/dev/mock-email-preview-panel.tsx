"use client";

import { useCallback, useEffect, useState } from "react";

type MockEmailRecord = {
  id: string;
  at: string;
  flow: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export function MockEmailPreviewPanel() {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<MockEmailRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch("/api/dev/mock-emails", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { emails: MockEmailRecord[] };
      setEmails(data.emails ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchEmails();
    const t = setInterval(() => void fetchEmails(), 2000);
    return () => clearInterval(t);
  }, [fetchEmails]);

  useEffect(() => {
    if (open) void fetchEmails();
  }, [open, fetchEmails]);

  const clearAll = async () => {
    await fetch("/api/dev/mock-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    });
    void fetchEmails();
    setExpanded(null);
  };

  const count = emails.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 shadow-lg transition hover:bg-amber-100"
        aria-label="Open mock email preview"
      >
        <span aria-hidden>📧</span>
        Mock emails
        {count > 0 ? (
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs tabular-nums">{count}</span>
        ) : null}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[110] flex justify-end bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-email-panel-title"
        >
          <button
            type="button"
            className="h-full flex-1 cursor-default"
            aria-label="Close panel"
            onClick={() => setOpen(false)}
          />
          <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 id="mock-email-panel-title" className="text-lg font-semibold text-slate-900">
                  Mock email preview
                </h2>
                <p className="text-xs text-slate-500">
                  Nothing is sent externally. With a verified domain + Resend, this is what would go
                  out.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 border-b border-slate-100 px-4 py-2">
              <button
                type="button"
                onClick={() => void fetchEmails()}
                className="text-xs font-medium text-slate-600 underline hover:text-slate-900"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => void clearAll()}
                className="text-xs font-medium text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {emails.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No mock emails yet. Submit an application, run screening, or send from the admin
                  candidate view — previews appear here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {emails.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-xs text-slate-800">
                          {e.flow}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(e.at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 font-medium text-slate-900">{e.subject}</p>
                      <p className="text-xs text-slate-600">
                        To: <span className="font-mono">{e.to}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                        className="mt-2 text-xs font-medium text-amber-800 underline"
                      >
                        {expanded === e.id ? "Hide body" : "Show body"}
                      </button>
                      {expanded === e.id ? (
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-700">Text</p>
                            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-xs text-slate-800">
                              {e.text}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">HTML</p>
                            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-xs text-slate-800">
                              {e.html}
                            </pre>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
