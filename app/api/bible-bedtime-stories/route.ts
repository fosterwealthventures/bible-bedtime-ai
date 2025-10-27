import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AgeBucket = "2-4" | "5-8" | "9-12";

function minutesToTargetWords(mins: number) {
  // bedtime pace ~ 75–100 wpm; we aim mid ~ 85 wpm
  const wpm = 85;
  const words = Math.max(150, Math.round(mins * wpm));
  return { wordsMin: Math.round(words * 0.9), wordsMax: Math.round(words * 1.1) };
}

function ageStyle(age: AgeBucket) {
  if (age === "2-4")
    return "very short, simple sentences; comforting rhythm; gentle imagery; no scary details; read-aloud friendly.";
  if (age === "5-8")
    return "short sentences; friendly dialogue; vivid but simple imagery; clear moral; read-aloud friendly.";
  return "richer vocabulary; a bit more adventure; reflective close; read-aloud friendly.";
}

export async function POST(req: Request) {
  try {
    const { title, minutes, age }: { title: string; minutes: number; age: AgeBucket } = await req.json();
    if (!title || !minutes || !age) {
      return NextResponse.json({ ok: false, error: "Missing title, minutes, or age." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY!;
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    if (!apiKey) return NextResponse.json({ ok: false, error: "No GEMINI_API_KEY set." }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const { wordsMin, wordsMax } = minutesToTargetWords(minutes);

    const prompt = `
You are a compassionate children's Bible storyteller.
Write a full bedtime story titled "${title}" ${ageStyle(age)}
Target length: between ${wordsMin} and ${wordsMax} words (approx. ${minutes} minutes read-aloud).
Make the tone calming and hopeful. End with a single-sentence blessing prayer for the child.
Return ONLY the story text (no markdown, no headings).
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text) {
      return NextResponse.json({ ok: false, error: "Model returned empty story." }, { status: 502 });
    }

    // Provide a suggested image prompt (stub)
    const imagePrompt = `A gentle, kid-friendly illustration for "${title}" in soft pastels, warm lighting, simple shapes.`;

    return NextResponse.json({
      ok: true,
      title,
      minutes,
      age,
      text,
      imagePrompt,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Story generation failed." }, { status: 500 });
  }
}