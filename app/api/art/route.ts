import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ placeholder: true }, { status: 200 });
  }
  // TODO: integrate Imagen 3 when ready.
  return NextResponse.json({ placeholder: true }, { status: 200 });
}