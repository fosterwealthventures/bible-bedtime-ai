"use client";
import Link from "next/link";
import Image from "next/image";
import { StoryMeta, Language } from "@/types/story";

export default function LibraryList({
  stories,
  lang,
}: { stories: StoryMeta[]; lang: Language }) {
  return (
    <div className="mt-8 space-y-3">
      {stories.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-4 rounded-2xl bg-[#122C66] p-3 ring-1 ring-white/10 hover:bg-[#183672] transition"
        >
          <div className="relative h-16 w-12 overflow-hidden rounded-lg flex-shrink-0">
            <Image
              src={s.image}
              alt={lang === "es" ? s.title_es : s.title_en}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">
              {lang === "es" ? s.title_es : s.title_en}
            </h3>
            <p className="text-xs text-blue-200">
              {s.age.join(", ")} • {s.durationMin.join("/")} min
            </p>
          </div>
          <Link
            href={`/bible-bedtime-stories?story=${s.slug}&lang=${lang}`}
            className="rounded-xl bg-amber-300 px-3 py-1.5 text-[#0C2657] font-semibold text-xs"
          >
            {lang === "es" ? "Reproducir" : "Play"}
          </Link>
        </div>
      ))}
    </div>
  );
}

