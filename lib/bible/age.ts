import type { AgeBucket } from "./types";

export const AGE_BUCKETS: AgeBucket[] = ["2-4", "5-8", "9-12"];

export function normalizeAgeBucket(raw?: string | null): AgeBucket {
  const val = (raw ?? "").trim();
  if (val === "2-4" || val === "2–4") return "2-4";
  if (val === "5-8" || val === "5–8") return "5-8";
  return "9-12";
}

export function readingGuidance(
  age: AgeBucket
): { sentenceLimit: number; vocabLevel: "very-simple" | "simple" | "standard" } {
  switch (age) {
    case "2-4":
      return { sentenceLimit: 8, vocabLevel: "very-simple" };
    case "5-8":
      return { sentenceLimit: 14, vocabLevel: "simple" };
    default:
      return { sentenceLimit: 22, vocabLevel: "standard" };
  }
}

