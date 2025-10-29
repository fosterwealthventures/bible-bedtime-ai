import type { AgeBucket, Language } from "@/types/story";

export interface LibraryItem {
  slug: string;
  title: string;
  image?: string;
  age: AgeBucket;
  minutes: number;
  lang: Language;
  favorite?: boolean;
  progressSec?: number;
  lastPlayedAt?: number; // epoch ms
  createdAt?: number; // epoch ms
}

