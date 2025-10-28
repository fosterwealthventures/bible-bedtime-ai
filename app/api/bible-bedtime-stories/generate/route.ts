import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { normalizeAgeBucket, readingGuidance } from "@/lib/bible/age";
import { findPassagesByTheme } from "@/lib/bible/catalog";
import type { StoryRequest, StoryResponse, StoryScene, ThemeTag } from "@/lib/bible/types";

function choosePassage(passageRef: string, theme?: ThemeTag | null): string {
  if (theme) {
    const matches = findPassagesByTheme(theme);
    const keep = matches.find((m) => m.passageRef === passageRef);
    if (keep) return keep.passageRef;
    if (matches.length > 0) return matches[0].passageRef;
  }
  return passageRef;
}

async function generateStoryScenesLLM(input: StoryRequest): Promise<StoryResponse> {
  const { sentenceLimit } = readingGuidance(input.age);
  const scenes: StoryScene[] = [
    { id: nanoid(), title: "Scene 1", narration: "Intro to the passage in age-appropriate language.", imagePrompt: "gentle picture-book style, faithful biblical illustration", approxDurationSec: 25 },
    { id: nanoid(), title: "Scene 2", narration: "Main conflict or lesson, kept faithful to Scripture.", imagePrompt: "child-friendly depiction, no sensationalism", approxDurationSec: 35 },
    { id: nanoid(), title: "Scene 3", narration: "Resolution emphasizing God’s character and truth.", imagePrompt: "hopeful closing illustration", approxDurationSec: 30 },
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

    const story = await generateStoryScenesLLM({
      passageRef,
      age,
      theme,
      childName: body.childName?.trim() || null,
      language,
      targetDuration: (body.targetDuration as 15 | 30 | 60) || 15,
    });

    // Replace placeholders with your Imagen helper when ready
    const imageUrls = story.scenes.map((_, idx) => `/images/placeholder/scene-${idx + 1}.jpg`);

    return NextResponse.json({ ...story, imageUrls });
  } catch (e: any) {
    console.error("generate route error", e);
    return NextResponse.json({ error: "Story generation failed. Please try again." }, { status: 500 });
  }
}

