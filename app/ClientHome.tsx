"use client";
import Link from "next/link";
import { useUI } from "@/lib/ui-state";
import { ALL_TOPICS } from "@/lib/content";
import { StoryCard } from "@/components/StoryCard";
import AgeToggle from "@/components/AgeToggle";
import { AgeBucket } from "@/lib/bible/types";
import ThemeChips from "@/components/ThemeChips";
import { ThemeKey } from "@/lib/content";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ClientHome() {
  const { lang } = useUI();
  const params = useSearchParams();
  const [age, setAge] = useState<AgeBucket>("2-4");
  const theme = (params?.get?.("theme") as ThemeKey) || "";
  
  // Sync age from URL params on initial load and when params change
  useEffect(() => {
    const ageParam = params?.get?.("age") as AgeBucket;
    if (ageParam && ageParam !== age) {
      setAge(ageParam);
    }
  }, [params]);
  
  // Filter stories by theme (age filtering is not implemented in the new content system yet)
  const filteredStories = ALL_TOPICS
    .filter((s: any) => {
      if (!theme) return true;
      return s.theme === theme;
    });
  const featured = filteredStories.slice(0, 3);
  
  return (
    <main className="pb-14">
      <section className="container grid md:grid-cols-2 gap-8 items-center mt-6 mb-12">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-tight">
            Bible Bedtime Stories
          </h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            by Foster Wealth Ventures
          </p>
          {/* (demo strip removed) */}
        </div>
        <div className="rounded-2xl p-6 bg-white border border-purple-100 shadow-soft">
          <div className="badge mb-3">{lang === "en" ? "Soothing narration" : "Narración suave"}</div>
          <img src={`https://via.placeholder.com/400x300?text=${encodeURIComponent(featured[0]?.title || "Bible Story")}`} alt="" className="w-full h-auto rounded-xl" />
        </div>
      </section>
      <section className="container mt-6">
        <h3 className="text-sm font-medium text-slate-600 mb-2">Themes</h3>
        <ThemeChips />
      </section>
      <section className="container mt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{lang === "en" ? "Featured Stories" : "Historias destacadas"}</h2>
          <Link href="/bible-bedtime-stories" className="text-brand-plum hover:underline">{lang === "en" ? "See all" : "Ver todas"}</Link>
        </div>
        <div className="mb-6">
          <AgeToggle value={age} onChange={setAge} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(s => <StoryCard key={s.id} id={s.id} />)}
        </div>
      </section>
    </main>
  );
}