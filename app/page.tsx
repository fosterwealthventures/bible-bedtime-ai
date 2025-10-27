"use client";
import Link from "next/link";
import { useUI } from "@/lib/ui-state";
import { STORIES } from "@/data/stories";
import { StoryCard } from "@/components/StoryCard";
import BrandProbe from "@/components/BrandProbe";

export default function HomePage() {
  const { lang } = useUI();
  const featured = STORIES.slice(0, 3);
  return (
    <main className="pb-14">
      <section className="container mt-6 mb-6">
        <BrandProbe />
      </section>
      <section className="container grid md:grid-cols-2 gap-8 items-center mt-6 mb-12">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-3 leading-tight">
            {lang === "en" ? "End the day with peace, Scripture, and a gentle story." : "Termina el día con paz, Escritura y una historia suave."}
          </h1>
          <p className="text-gray-600 mb-6">
            {lang === "en"
              ? "Age-appropriate Bible stories with soothing narration, a sleep timer, and a short prayer & verse."
              : "Historias bíblicas apropiadas para la edad con narración suave, temporizador de sueño y una breve oración y versículo."}
          </p>
          <div className="flex gap-3">
            <Link href="/bible-bedtime-stories" className="btn-primary">Play a sample</Link>
            <Link href="/bible-bedtime-stories" className="btn-outline">Browse stories</Link>
          </div>
        </div>
        <div className="rounded-2xl p-6 bg-white border border-purple-100 shadow-soft">
          <div className="badge mb-3">{lang === "en" ? "Soothing narration" : "Narración suave"}</div>
          <img src={featured[0].image} alt="" className="w-full h-auto rounded-xl" />
        </div>
      </section>
      <section className="container">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{lang === "en" ? "Featured Stories" : "Historias destacadas"}</h2>
          <Link href="/bible-bedtime-stories" className="text-brand-plum hover:underline">{lang === "en" ? "See all" : "Ver todas"}</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(s => <StoryCard key={s.id} id={s.id} />)}
        </div>
      </section>
    </main>
  );
}