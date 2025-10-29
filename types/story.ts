export type AgeBucket = "2-4" | "5-8" | "9-12";
export type Language = "en" | "es";

export interface StoryMeta {
  id: string;
  slug: string;
  title_en: string;
  title_es: string;
  age: AgeBucket[];
  durationMin: number[];
  image: string;   // /stories/<slug>.png
  color?: string;  // optional accent
}

