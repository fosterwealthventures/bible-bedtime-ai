// app/bible-bedtime-stories/ClientBiblePage.tsx
"use client";

import React from "react";
import AgeToggle from "@/components/AgeToggle";
import { AgeBucket } from "@/lib/bible/types";
import { THEMES, ALL_TOPICS, ThemeKey } from "@/lib/content";
import Image from "next/image";
import { placeholderArtUrl } from "@/components/StoryArt";
import { storyImageUrlForId } from "@/lib/art";

type Minutes = 5 | 10 | 15 | 20 | 30;

type StoryPayload = {
  title: string;
  summary?: string;
  story: string;
  prayer: string;
  scripture: { reference: string; verseText: string };
  questions: string[];
  // legacy compatibility:
  text?: string;
};

export default function ClientBiblePage() {
  const [age, setAge] = React.useState<AgeBucket>("5-8");
  const [minutes, setMinutes] = React.useState<Minutes>(10);
  const [lang, setLang] = React.useState<"EN"|"ES">("EN");
  const [activeTheme, setActiveTheme] = React.useState<ThemeKey | "All">("All");
  const [loadingId, setLoadingId] = React.useState<string>();
  const [error, setError] = React.useState<string>();
  const [story, setStory] = React.useState<StoryPayload | null>(null);

  const visible = activeTheme === "All"
    ? ALL_TOPICS
    : ALL_TOPICS.filter(s => s.theme === activeTheme);

  async function speak(text: string) {
    try {
      // Try server TTS (returns { mp3Base64 } or { fallback: true })
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const j = await r.json();
      if (j?.mp3Base64) {
        const audio = new Audio("data:audio/mpeg;base64," + j.mp3Base64);
        await audio.play();
        return;
      }
      // Fall back to browser speech
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "ES" ? "es-ES" : "en-US";
        u.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } else {
        alert(lang === "ES"
          ? "El navegador no admite síntesis de voz."
          : "Browser does not support speech synthesis.");
      }
    } catch {
      // Last-resort browser fallback
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "ES" ? "es-ES" : "en-US";
        u.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    }
  }

  async function generate(topicTitle: string) {
    setError(undefined);
    setStory(null);
    setLoadingId(topicTitle);

    // simple retry up to 2 times
    let lastErr: any;
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topicTitle,
            age,
            minutes,
            theme: activeTheme === "All" ? undefined : activeTheme,
            lang
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to generate");

        // If API returned new structured fields:
        if (json?.story && json?.prayer && json?.scripture) {
          setStory(json as StoryPayload);
        } else {
          // Legacy shape { title, text }
          setStory({
            title: json.title ?? "Bedtime Story",
            story: json.text ?? "",
            prayer: lang === "ES"
              ? "Jesús, gracias por cuidarme esta noche. Amén."
              : "Jesus, thank You for watching over me tonight. Amen.",
            scripture: {
              reference: "Psalm 4:8",
              verseText: lang === "ES"
                ? "En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado."
                : "I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.",
            },
            questions: [
              lang === "ES" ? "¿Qué parte te hizo sentir paz?" : "What part made you feel peaceful?",
              lang === "ES" ? "¿Dónde viste el amor de Dios en la historia?" : "Where did you see God’s love in the story?",
              lang === "ES" ? "¿Por qué podemos descansar sin miedo?" : "Why can we rest without fear?",
            ],
            text: json.text,
            summary: json.summary,
          });
        }

        setLoadingId(undefined);
        return;
      } catch (e: any) {
        lastErr = e;
        await new Promise(r => setTimeout(r, 400 * (i + 1)));
      }
    }
    setLoadingId(undefined);
    setError(lastErr?.message || "Could not generate the story right now.");
  }

  // Helper to compose what gets spoken (story + optional prayer)
  function composedSpeechText(s: StoryPayload) {
    const joiner = lang === "ES" ? "\n\nOración:\n" : "\n\nPrayer:\n";
    return `${s.story}${s.prayer ? joiner + s.prayer : ""}`;
    // If you prefer ONLY the story, return s.story
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <header className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Bible Bedtime Stories</h1>
        <p className="text-sm text-muted-foreground mt-1">by Foster Wealth Ventures</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <AgeToggle value={age} onChange={setAge} />
        <div className="ml-auto flex gap-2">
          {[5,10,15,20,30].map((m) => (
            <button
              key={m}
              className={`px-3 py-1 rounded-full border ${minutes===m? "bg-primary text-primary-foreground":""}`}
              onClick={() => setMinutes(m as Minutes)}
            >{m} min</button>
          ))}
          <button className={`px-3 py-1 rounded-full border ${lang==="EN"?"bg-primary text-primary-foreground":""}`} onClick={()=>setLang("EN")}>EN</button>
          <button className={`px-3 py-1 rounded-full border ${lang==="ES"?"bg-primary text-primary-foreground":""}`} onClick={()=>setLang("ES")}>ES</button>
        </div>
      </div>

      {/* Theme chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          className={`px-3 py-1 rounded-full border ${activeTheme==="All"?"bg-primary text-primary-foreground":""}`}
          onClick={()=>setActiveTheme("All")}
        >
          All themes
        </button>
        {THEMES.map(t=>(
          <button
            key={t}
            className={`px-3 py-1 rounded-full border ${activeTheme===t?"bg-primary text-primary-foreground":""}`}
            onClick={()=>setActiveTheme(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 12-card grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {visible.map(card=>(
          <article key={card.id} className="rounded-2xl border bg-card overflow-hidden">
            {/* Artwork */}
            <div className="story-art overflow-hidden">
              <Image src={storyImageUrlForId(card.id) || placeholderArtUrl(card.title, card.theme)} alt={`${card.title} artwork`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              <span className="text-xs px-2 py-1 rounded bg-muted absolute top-3 left-3">{card.theme}</span>
            </div>
            <div className="p-4">
            <header className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{lang === 'ES' ? (card as any).titleEs || card.title : card.title}</h3>
            </header>
            <p className="text-sm text-muted-foreground mb-4">{lang === 'ES' ? (card as any).blurbEs || `Una historia bíblica sobre ${card.title.toLowerCase()}` : card.blurb || `A Bible story about ${card.title.toLowerCase()}`}</p>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={()=>generate(card.title)}
                disabled={loadingId===card.title}
              >
                {loadingId===card.title ? "Generating…" : "Generate"}
              </button>
            </div>
            </div>
          </article>
        ))}
      </div>

      {/* Story output / errors */}
      <section className="mt-8">
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        )}

        {story && (
          <div className="rounded-2xl border p-4 bg-background space-y-5">
            <header>
              <h2 className="text-xl font-semibold">{story.title}</h2>
              {story.summary && (
                <p className="text-sm text-muted-foreground mt-1">{story.summary}</p>
              )}
            </header>

            {/* Scripture (new) */}
            {story.scripture?.reference && (
              <section>
                <h3 className="font-medium mb-1">{lang==="ES" ? "Escritura" : "Scripture"}</h3>
                <p className="text-sm leading-6">
                  <span className="font-medium">{story.scripture.reference}: </span>
                  <span>{story.scripture.verseText}</span>
                </p>
              </section>
            )}

            {/* Main story (always) */}
            <section>
              <h3 className="font-medium mb-1">{lang==="ES" ? "Historia" : "Story"}</h3>
              <pre className="whitespace-pre-wrap text-sm leading-6">
                {story.story ?? story.text /* legacy fallback */}
              </pre>
            </section>

            {/* Prayer (new) */}
            {story.prayer && (
              <section>
                <h3 className="font-medium mb-1">{lang==="ES" ? "Oración" : "Prayer"}</h3>
                <p className="text-sm leading-6">{story.prayer}</p>
              </section>
            )}

            {/* Discussion Questions (new) */}
            {!!story.questions?.length && (
              <section>
                <h3 className="font-medium mb-1">
                  {lang==="ES" ? "Preguntas para hablar" : "Discussion Questions"}
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {story.questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => {
                  const toCopy = [
                    story.title,
                    story.scripture?.reference ? `${lang==="ES" ? "Escritura" : "Scripture"}: ${story.scripture.reference} — ${story.scripture.verseText}` : "",
                    story.story ?? story.text ?? "",
                    story.prayer ? `${lang==="ES" ? "Oración" : "Prayer"}: ${story.prayer}` : "",
                    story.questions?.length
                      ? `${lang==="ES" ? "Preguntas" : "Questions"}:\n- ${story.questions.join("\n- ")}`
                      : "",
                  ].filter(Boolean).join("\n\n");
                  navigator.clipboard.writeText(toCopy);
                }}
              >
                {lang==="ES" ? "Copiar todo" : "Copy All"}
              </button>

              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={() => speak(composedSpeechText(story))}
              >
                {lang==="ES" ? "Escuchar" : "Listen"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
