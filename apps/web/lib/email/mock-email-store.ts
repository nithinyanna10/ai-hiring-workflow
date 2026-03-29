import type { SendEmailInput } from "./types";

export type MockEmailRecord = {
  id: string;
  at: string;
  flow: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const MAX = 80;
const entries: MockEmailRecord[] = [];

function id() {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function recordMockEmail(input: SendEmailInput): MockEmailRecord {
  const rec: MockEmailRecord = {
    id: id(),
    at: new Date().toISOString(),
    flow: input.flow ?? "email",
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  };
  entries.unshift(rec);
  while (entries.length > MAX) {
    entries.pop();
  }
  return rec;
}

export function getMockEmailRecords(): MockEmailRecord[] {
  return [...entries];
}

export function clearMockEmailRecords() {
  entries.length = 0;
}
