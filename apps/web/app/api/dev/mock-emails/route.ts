import { NextResponse } from "next/server";

import {
  clearMockEmailRecords,
  getMockEmailRecords,
} from "../../../../lib/email/mock-email-store";

function devOnly() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  return null;
}

export async function GET() {
  const block = devOnly();
  if (block) return block;
  return NextResponse.json({ emails: getMockEmailRecords() });
}

export async function POST(request: Request) {
  const block = devOnly();
  if (block) return block;
  try {
    const body = (await request.json()) as { action?: string };
    if (body.action === "clear") {
      clearMockEmailRecords();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
