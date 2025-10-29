"use client";
import { useState } from "react";
import LibraryFilters from "./components/LibraryFilters";
import LibraryGrid from "./components/LibraryGrid";
import LibraryList from "./components/LibraryList";
import LibraryEmpty from "./components/LibraryEmpty";
import { STORIES } from "@/data/stories";
import { useLibrary } from "@/lib/library";
import type { StoryMeta } from "@/types/story";

export default function LibraryPage() {
  const { items, loading } = useLibrary();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [lang, setLang] = useState<"en" | "es">("en");
  const [filterAge, setFilterAge] = useState<"all" | "2-4" | "5-8" | "9-12">("all");

  const source: StoryMeta[] = (items && items.length > 0)
    ? items.map((it) => {
        const meta = STORIES.find(s => s.slug === it.slug);
        if (meta) return meta;
        return {
          id: it.slug,
          slug: it.slug,
          title_en: it.title,
          title_es: it.title,
          age: [it.age],
          durationMin: [it.minutes],
          image: it.image || "/stories/_placeholder.png",
          color: "#2C3E86",
        } satisfies StoryMeta;
      })
    : STORIES;

  const filtered = source.filter(s =>
    filterAge === "all" ? true : s.age.includes(filterAge)
  );

  return (
    <section className="relative min-h-screen bg-[#0B1E4A] text-white">
      <div className="absolute inset-0 pointer-events-none opacity-40 [background-image:radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {lang === "es" ? "Biblioteca de Historias" : "Story Library"}
            </h1>
            <p className="text-blue-100">
              {lang === "es"
                ? "Tus historias guardadas y favoritas de la hora de dormir."
                : "Your saved and favorite bedtime stories."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-2 rounded-lg ${
                view === "grid"
                  ? "bg-amber-300 text-[#0C2657]"
                  : "bg-[#122C66] text-amber-100"
              }`}
            >
              ⬚ Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 rounded-lg ${
                view === "list"
                  ? "bg-amber-300 text-[#0C2657]"
                  : "bg-[#122C66] text-amber-100"
              }`}
            >
              ☰ List
            </button>
          </div>
        </header>

        <LibraryFilters
          lang={lang}
          setLang={setLang}
          filterAge={filterAge}
          setFilterAge={setFilterAge}
        />

        {loading ? (
          <div className="mt-10 text-blue-100">Loading your library…</div>
        ) : filtered.length === 0 ? (
          <LibraryEmpty lang={lang} />
        ) : view === "grid" ? (
          <LibraryGrid stories={filtered} lang={lang} />
        ) : (
          <LibraryList stories={filtered} lang={lang} />
        )}
      </div>
    </section>
  );
}
