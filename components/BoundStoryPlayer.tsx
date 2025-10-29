"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import StoryPlayer from "@/components/StoryPlayer";
import { STORIES } from "@/data/stories";
import type { AgeBucket, Language } from "@/types/story";
import { upsertLibraryItem } from "@/lib/library";
import { useParental } from "@/context/ParentalSettingsProvider";

type Minutes = 5|10|15|20|30|60;

export default function BoundStoryPlayer() {
  const params = useSearchParams();
  const slug = params?.get?.("story") || "";
  const age = (params?.get?.("age") as AgeBucket) || "5-8";
  const minutes = (Number(params?.get?.("minutes")) as Minutes) || 10;
  const lang = ((params?.get?.("lang") as Language) || "en");

  const story = React.useMemo(() => STORIES.find(s => s.slug === slug) || null, [slug]);
  const { enforceDuration, lockedLang, canPlayNow } = useParental();
  const effectiveMinutes = enforceDuration(minutes);
  const effectiveLang = lockedLang(lang);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState<string>(story ? (lang==="es"?story.title_es:story.title_en) : "");
  const [transcript, setTranscript] = React.useState<string>("");
  const [scripture, setScripture] = React.useState<{ref:string;text:string}|undefined>(undefined);
  const [prayer, setPrayer] = React.useState<string | undefined>(undefined);
  const [discussion, setDiscussion] = React.useState<string[] | undefined>(undefined);

  // Cleanup blob URL when changing
  React.useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const subtitle = React.useMemo(() => {
    const L = effectiveLang.toUpperCase();
    return `Age ${age} • ${effectiveMinutes} min • ${L}`;
  }, [age, effectiveMinutes, effectiveLang]);

  const artwork = story?.image || "/stories/_placeholder.png";

  const generateAndSpeak = React.useCallback(async (override?: { slug?: string }) => {
    const targetSlug = override?.slug || slug;
    const s = STORIES.find(x => x.slug === targetSlug);
    if (!s) { setError("Story not found"); return; }
    setError(null);
    setLoading(true);
    setAudioUrl(null);
    setTitle(effectiveLang === "es" ? s.title_es : s.title_en);
    // Ensure library doc exists / updated
    upsertLibraryItem({
      slug: s.slug,
      title: effectiveLang === "es" ? s.title_es : s.title_en,
      image: s.image,
      age,
      minutes: effectiveMinutes,
      lang: effectiveLang,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
    }).catch(()=>{});

    // Try simple retry
    let lastErr: any;
    for (let i = 0; i < 2; i++) {
      try {
        const res = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: (effectiveLang === "es" ? s.title_es : s.title_en),
            age,
            minutes: effectiveMinutes,
            lang: effectiveLang.toUpperCase(),
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to generate story");

        const text = json?.story || json?.text || "";
        const computedPrayer = json?.prayer || (effectiveLang === "es"
          ? "Jesús, gracias por cuidarme esta noche. Amén."
          : "Jesus, thank You for watching over me tonight. Amen.");
        const computedScripture = json?.scripture || {
          ref: "Psalm 4:8",
          text: effectiveLang === "es"
            ? "En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado."
            : "I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.",
        };
        const computedQs: string[] = json?.questions || (
          effectiveLang === "es"
            ? ["¿Qué parte te hizo sentir paz?","¿Dónde viste el amor de Dios en la historia?","¿Por qué podemos descansar sin miedo?"]
            : ["What part made you feel peaceful?","Where did you see God’s love in the story?","Why can we rest without fear?"]
        );

        setTranscript(text);
        setPrayer(computedPrayer);
        setScripture({ ref: computedScripture.reference || computedScripture.ref, text: computedScripture.verseText || computedScripture.text });
        setDiscussion(computedQs);

        // Now TTS
        const tts = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, lang: effectiveLang.toUpperCase() })
        });
        const tj = await tts.json();
        if (tj?.fallback) {
          // Browser TTS fallback
          if (typeof window !== "undefined" && window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(`${text}\n\n${computedPrayer}`);
            u.lang = effectiveLang === "es" ? "es-ES" : "en-US";
            u.rate = 0.95;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
          }
          setLoading(false);
          return;
        }
        if (tj?.mp3Base64) {
          const byteCharacters = atob(tj.mp3Base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i2 = 0; i2 < byteCharacters.length; i2++) byteNumbers[i2] = byteCharacters.charCodeAt(i2);
          const byteArray = new Uint8Array(byteNumbers);
          const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setLoading(false);
          return;
        }
        throw new Error("TTS unavailable");
      } catch (e: any) {
        lastErr = e;
        await new Promise(r => setTimeout(r, 400 * (i + 1)));
      }
    }
    setLoading(false);
    setError(lastErr?.message || "Could not generate the story right now.");
  }, [slug, age, minutes, lang]);

  // Auto-generate on param change
  React.useEffect(() => {
    if (!slug) return;
    generateAndSpeak();
  }, [slug, age, effectiveMinutes, effectiveLang]);

  // Hook up preview:play events from cards
  React.useEffect(() => {
    const onPreview = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce?.detail) generateAndSpeak({ slug: ce.detail });
    };
    window.addEventListener("preview:play", onPreview as EventListener);
    return () => window.removeEventListener("preview:play", onPreview as EventListener);
  }, [generateAndSpeak]);

  if (!slug || !story) return null;
  if (!canPlayNow()) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl bg-[#0B1E4A] p-4 text-amber-200 ring-1 ring-white/10">Bedtime is active right now. Try again later. 🌙</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {error && (
        <div className="mb-3 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}
      <StoryPlayer
        src={audioUrl || ""}
        title={title}
        subtitle={subtitle}
        artwork={artwork}
        lang={effectiveLang}
        librarySlug={story.slug}
        transcript={transcript}
        scripture={scripture}
        prayer={prayer}
        discussion={discussion}
        onDownloadHref={audioUrl || undefined}
        onRegenerate={() => generateAndSpeak()}
        onEnd={() => {/* Could enqueue next */}}
      />
      {loading && <div className="mt-3 text-sm text-blue-200">Preparing your story audio…</div>}
    </div>
  );
}
