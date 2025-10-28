export type AgeBucket = "2-4" | "5-8" | "9-12";
export type ThemeTag =
  | "God's Faithfulness"
  | "Courage"
  | "Obedience"
  | "Forgiveness"
  | "Prayer"
  | "Kindness"
  | "Wisdom"
  | "Trust in God";

export interface StoryScene {
  id: string;
  title: string;
  narration: string;
  imagePrompt: string;
  approxDurationSec: number;
}

export interface StoryRequest {
  passageRef: string;
  age: AgeBucket;
  theme?: ThemeTag | null;
  childName?: string | null;
  language?: "en" | "es";
  targetDuration: 15 | 30 | 60;
}

export interface StoryResponse {
  passageRef: string;
  age: AgeBucket;
  language: "en" | "es";
  theme?: ThemeTag | null;
  title: string;
  summary: string;
  scenes: StoryScene[];
  disclaimers: string[];
}