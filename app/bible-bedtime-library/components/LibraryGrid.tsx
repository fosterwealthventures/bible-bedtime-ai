"use client";
import StoryCard from "@/components/StoryCard";
import { StoryMeta, Language } from "@/types/story";

export default function LibraryGrid({
  stories,
  lang,
}: { stories: StoryMeta[]; lang: Language }) {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stories.map((s) => (
        <StoryCard key={s.id} story={s} lang={lang} />
      ))}
    </div>
  );
}

