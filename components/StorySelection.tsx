"use client";
import { useMemo, useState } from "react";
import StoryCard from "@/components/StoryCard";
import { STORIES } from "@/data/stories";
import type { AgeBucket, Language } from "@/types/story";
import { useParental } from "@/context/ParentalSettingsProvider";

const AGE_ORDER: AgeBucket[] = ["2-4", "5-8", "9-12"];

export default function StorySelection() {
  const [lang, setLang] = useState<Language>("en");
  const [age, setAge] = useState<AgeBucket | "all">("all");
  const [query, setQuery] = useState("");
  const { isStoryVisible, lockedLang } = useParental();
  const effectiveLang = lockedLang(lang);

  const filtered = useMemo(() => {
    return STORIES
      .filter((s) => isStoryVisible(s.slug, s.age))
      .filter((s) => (age === "all" ? true : s.age.includes(age)))
      .filter((s) => {
        const t = (effectiveLang === "es" ? s.title_es : s.title_en).toLowerCase();
        return t.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        const aIdx = Math.min(...a.age.map((x) => AGE_ORDER.indexOf(x)));
        const bIdx = Math.min(...b.age.map((x) => AGE_ORDER.indexOf(x)));
        return aIdx - bIdx;
      });
  }, [age, query, lang]);

  return (
    <section className="relative bg-[#0B1E4A] text-white py-10 md:py-14">
      {/* subtle starry backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              {effectiveLang === "es" ? "Elige una Historia" : "Choose a Story"}
            </h2>
            <p className="text-blue-100">
              {effectiveLang === "es"
                ? "Filtra por edad, busca por título y empieza a escuchar."
                : "Filter by age, search by title, and start listening."}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Language pills */}
            <div className="rounded-2xl bg-[#122C66] p-1 ring-1 ring-white/10">
              {(["en", "es"] as Language[]).map((L) => (
                <button
                  key={L}
                  onClick={() => setLang(L)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                    effectiveLang === L
                      ? "bg-amber-300 text-[#0C2657]"
                      : "text-amber-100"
                  }`}
                >
                  {L.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Age chips */}
            <div className="rounded-2xl bg-[#122C66] p-1 ring-1 ring-white/10">
              {(["all", ...AGE_ORDER] as const).map((A) => (
                <button
                  key={A}
                  onClick={() => setAge(A as any)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                    age === A
                      ? "bg-amber-300 text-[#0C2657]"
                      : "text-amber-100"
                  }`}
                >
                  {A === "all" ? (lang === "es" ? "Todas" : "All Ages") : A}
                </button>
              ))}
            </div>

            {/* Search box */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={effectiveLang === "es" ? "Buscar historias..." : "Search stories..."}
              className="h-10 rounded-xl bg-[#122C66] px-3 text-sm placeholder:text-blue-200/70
                         ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>

        {/* Grid (taller cards, equal height) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((s) => (
            <StoryCard key={s.id} story={s} lang={effectiveLang} />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl bg-[#122C66] p-6 text-center ring-1 ring-white/10">
            <p className="text-blue-100">
              {effectiveLang === "es"
                ? "No hay historias que coincidan con tu búsqueda."
                : "No stories match your search."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
