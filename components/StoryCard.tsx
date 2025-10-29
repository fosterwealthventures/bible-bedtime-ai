"use client";
import Image from "next/image";
import Link from "next/link";
import { StoryMeta, Language } from "@/types/story";

export default function StoryCard({
  story,
  lang = "en",
}: { story: StoryMeta; lang?: Language }) {
  const title = lang === "es" ? story.title_es : story.title_en;

  return (
    <article
      className="group relative overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/10
                 bg-[#0C2657]"
      style={{
        background:
          `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(12,38,87,0.96) 45%),
           ${story.color ?? "#2C3E86"}`,
      }}
    >
      {/* Poster (3:4) with glow */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={story.image || "/stories/_placeholder.png"}
          alt={title}
          fill
          priority={false}
          sizes="(max-width: 768px) 50vw, 320px"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C2657]/85 via-[#0C2657]/40 to-transparent" />
        {/* Age badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1 pr-14">
          {story.age.map((a) => (
            <span
              key={a}
              className="rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-extrabold
                         text-[#0C2657] shadow"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className="text-[17px] font-extrabold leading-snug text-white"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-blue-100/90">
          <span className="rounded-full bg-[#122C66] px-2.5 py-1 ring-1 ring-white/10">
            {lang === "es" ? "Duraciones" : "Durations"}:{" "}
            {story.durationMin.join(" / ")}{" "}
            {lang === "es" ? "min" : "min"}
          </span>
          <span className="rounded-full bg-[#122C66] px-2.5 py-1 ring-1 ring-white/10">
            AI + Audio
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/bible-bedtime-stories?story=${story.slug}&age=${story.age[0]}&minutes=${story.durationMin[0]}&lang=${lang}`}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-4 py-2
                       font-semibold text-[#0C2657] shadow hover:translate-y-[1px] transition"
          >
            {lang === "es" ? "Comenzar" : "Start story"}
          </Link>
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("preview:play", { detail: story.slug })
              )
            }
            className="rounded-2xl border border-amber-300/60 px-3 py-2 text-amber-200
                       hover:bg-amber-300/10 transition"
            aria-label="Preview audio"
          >
            ▶ {lang === "es" ? "Vista previa" : "Preview"}
          </button>
        </div>
      </div>
    </article>
  );
}
