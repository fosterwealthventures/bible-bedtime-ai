// app/api/story/route.ts
import { NextResponse } from "next/server";
import { AgeBucket } from "../../../lib/bible/types";
import { stableHashSync } from "@/lib/hash";

type Minutes = 5 | 10 | 15 | 20 | 30 | 45 | 60;

export type StoryPayload = {
  title: string;
  summary?: string;
  // NEW structured fields:
  story: string;
  prayer: string;
  scripture: {
    reference: string;
    verseText: string;
  };
  questions: string[];
  // LEGACY compatibility field:
  text?: string; // same content as `story` so older UIs keep working
};

function guidance(age: AgeBucket) {
  if (age === "2-4") return "very simple, toddler-friendly words; short sentences; gentle repetition";
  if (age === "5-8") return "early-reader friendly; simple sentences; warm and encouraging";
  return "upper elementary; clear, calm tone; simple but slightly richer vocabulary";
}

function targetLength(minutes: Minutes) {
  switch (minutes) {
    case 5:
      return "≈250–350 words";
    case 10:
      return "≈450–650 words";
    case 15:
      return "≈700–900 words";
    case 20:
      return "≈950–1200 words";
    case 30:
      return "≈1300–1600 words";
    case 45:
      return "≈1900–2300 words";
    case 60:
      return "≈2400–2800 words";
    default:
      return "≈700–900 words";
  }
}

function buildPrompt(p: {
  topic: string; age: AgeBucket; minutes: Minutes; theme?: string; lang?: "EN" | "ES";
}) {
  const langName = p.lang === "ES" ? "Spanish" : "English";
  const lvl = guidance(p.age);
  const len = targetLength(p.minutes);
  const theme = p.theme ?? "general comfort and God's care";

  return `
You are a bedtime story writer. Write in ${langName}.
Ages: ${p.age} (guidance: ${lvl}). Target length: ${len}.
Topic: ${p.topic}. Theme: ${theme}.
Tone: soothing, gentle, sleepy-time pace. Avoid violence, scary imagery, or complex theology.

Return JSON ONLY (no markdown) with:
{
  "title": "string",
  "summary": "string (1-2 sentences, optional)",
  "story": "string",
  "prayer": "string",
  "scripture": { "reference": "Book chapter:verse", "verseText": "public-domain short wording (prefer KJV)" },
  "questions": ["string","string","string"]
}
`.trim();
}

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    const { topic, age, minutes, theme, lang } = await req.json();

    // Cache by input parameters
    const cacheKey = `story:${stableHashSync({ topic, age, minutes, theme, lang })}`;
    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mem = (globalThis as any).__bb_cache || ((globalThis as any).__bb_cache = new Map());
    const hit = mem.get(cacheKey) as { at: number; data: any } | undefined;
    if (hit && now - hit.at < 10 * 60 * 1000) {
      return NextResponse.json(hit.data);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`;
    const body = {
      contents: [{ parts: [{ text: buildPrompt({ topic, age, minutes, theme, lang }) }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        // Ask the model for JSON
        response_mime_type: "application/json",
      },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!r.ok) {
      const err = await r.text();
      return NextResponse.json({ error: `Gemini error: ${r.status} ${err}` }, { status: 502 });
    }

    const data = await r.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Try strict JSON first
    try {
      const parsed = JSON.parse(raw) as StoryPayload;
      if (!parsed?.title || !parsed?.story || !parsed?.prayer || !parsed?.scripture?.reference) {
        throw new Error("Missing required fields");
      }
      // Add legacy field for backward compatibility
      parsed.text = parsed.story;
      mem.set(cacheKey, { at: now, data: parsed });
      return NextResponse.json(parsed);
    } catch {
      // Fallback: adapt legacy text
      const lines = String(raw).split("\n");
      const title = (lines.find((l) => l.trim()) || "Bedtime Story").trim();
      const fallback: StoryPayload = {
        title,
        story: raw || (lang === "ES"
          ? "Lo siento, no pude generar una historia en este momento."
          : "Sorry, I couldn't generate a story right now."),
        prayer: lang === "ES"
          ? "Jesús, gracias por cuidarme esta noche. Amén."
          : "Jesus, thank You for watching over me tonight. Amen.",
        scripture: {
          reference: "Psalm 4:8",
          verseText: lang === "ES"
            ? "En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado."
            : "I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.",
        },
        questions: [
          lang === "ES" ? "¿Qué parte te hizo sentir paz?" : "What part made you feel peaceful?",
          lang === "ES" ? "¿Dónde viste el amor de Dios en la historia?" : "Where did you see God’s love in the story?",
          lang === "ES" ? "¿Por qué podemos descansar sin miedo?" : "Why can we rest without fear?",
        ],
        text: raw, // legacy field for your existing UI
      };
      mem.set(cacheKey, { at: now, data: fallback });
      return NextResponse.json(fallback);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Story API failure" }, { status: 500 });
  }
}
