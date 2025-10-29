import { NextResponse } from "next/server";
import { normalizeAgeBucket, readingGuidance } from "@/lib/bible/age";
import { findPassagesByTheme } from "@/lib/bible/catalog";
import type { StoryRequest, StoryResponse, StoryScene, ThemeTag } from "@/lib/bible/types";
import { stableHashSync } from "@/lib/hash";

function choosePassage(passageRef: string, theme?: ThemeTag | null): string {
  if (theme) {
    const matches = findPassagesByTheme(theme);
    const keep = matches.find((m) => m.passageRef === passageRef);
    if (keep) return keep.passageRef;
    if (matches.length > 0) return matches[0].passageRef;
  }
  return passageRef;
}

function uid() {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return Math.random().toString(36).slice(2);
}

async function generateStoryScenesLLM(input: StoryRequest): Promise<StoryResponse> {
  const { sentenceLimit } = readingGuidance(input.age);
  const scenes: StoryScene[] = [
    { id: uid(), title: "Scene 1", narration: "Intro to the passage in age-appropriate language.", imagePrompt: "gentle picture-book style, faithful biblical illustration", approxDurationSec: 25 },
    { id: uid(), title: "Scene 2", narration: "Main conflict or lesson, kept faithful to Scripture.", imagePrompt: "child-friendly depiction, no sensationalism", approxDurationSec: 35 },
    { id: uid(), title: "Scene 3", narration: "Resolution emphasizing God’s character and truth.", imagePrompt: "hopeful closing illustration", approxDurationSec: 30 },
  ];

  return {
    passageRef: input.passageRef,
    age: input.age,
    language: input.language ?? "en",
    theme: input.theme ?? null,
    title: "Bible Bedtime Story",
    summary: "A faithful retelling for children, simplified without altering meaning.",
    scenes,
    disclaimers: [
      "Told carefully from Scripture for children; simplified without altering meaning.",
      "If a theme is selected, only passages that truly teach that theme are used.",
      "Any child name is for engagement after the story—never inserted into the biblical narrative.",
    ],
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<StoryRequest>;
    const age = normalizeAgeBucket(body.age || "5-8");
    const language = body.language === "es" ? "es" : "en";
    const theme = (body.theme as ThemeTag | null) ?? null;

    const requestedPassage = (body.passageRef || "1 Samuel 17").trim();
    const passageRef = choosePassage(requestedPassage, theme);

    const input: StoryRequest = {
      passageRef,
      age,
      theme,
      childName: body.childName?.trim() || null,
      language,
      targetDuration: (body.targetDuration as 15 | 30 | 60) || 15,
    };

    // cache key is defined by the story-requesting fields
    const cacheKey = `scenes:${stableHashSync({
      passageRef: input.passageRef,
      age: input.age,
      language: input.language,
      theme: input.theme,
      targetDuration: input.targetDuration,
    })}`;

    const now = Date.now();
    // simple in-memory cache with TTL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mem = (globalThis as any).__bb_cache || ((globalThis as any).__bb_cache = new Map());
    const hit = mem.get(cacheKey) as { at: number; data: any } | undefined;
    if (hit && now - hit.at < 10 * 60 * 1000) {
      return NextResponse.json(hit.data);
    }

    const story = await generateStoryScenesLLM(input);

    // Swap placeholders → call Imagen helper route for each scene
    const origin = new URL(req.url).origin;
    const images = await Promise.all(
      story.scenes.map(async (s) => {
        try {
          const r = await fetch(`${origin}/api/bible-bedtime-stories/image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: s.imagePrompt, size: "1024x1024", n: 1 }),
          });
          const j = await r.json();
          const b64 = j?.images?.[0];
          if (b64) return `data:image/png;base64,${b64}`;
        } catch {}
        return "/images/placeholder/scene-1.jpg"; // fallback
      })
    );

    const response = { ...story, imageUrls: images };
    mem.set(cacheKey, { at: now, data: response });

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("generate route error", e);
    return NextResponse.json({ error: "Story generation failed. Please try again." }, { status: 500 });
  }
}
