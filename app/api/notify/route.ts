import { NextResponse } from "next/server";

type Body = { email?: string; plan?: "free" | "premium" };

function isValidEmail(e?: string) {
  if (!e) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const entry = {
      email: body.email!,
      plan: body.plan || "premium",
      at: Date.now(),
      ua: (req.headers as any).get?.("user-agent") || undefined,
    };
    // In-memory collection (ephemeral). Replace with DB or email service later.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = ((globalThis as any).__leads ||= [] as any[]);
    store.push(entry);
    console.log("notify-lead", entry);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

