"use client";

import { useState, useRef, useEffect } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { Chips } from "@/components/ui/Chips";

type GenerateInput = {
  theme?: string;
  age?: "toddler" | "early-reader" | "tween";
  minutes?: number;
  childName?: string;
  verseVersion?: "KJV" | "WEB" | "paraphrase";
};

type StoryPayload = {
  title: string;
  story: string;
  prayer: string;
  verseRef: string;
  verseText: string;
  talkQuestion: string;
  meta: any;
};

async function postJSON(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

async function ttsToObjectUrl(opts: {
  text: string;
  languageCode?: string;
  speakingRate?: number;
  pitch?: number;
  voiceName?: string;
}) {
  const {
    text,
    languageCode = "en-US",
    speakingRate = 0.9,
    pitch = 0,
    voiceName,
  } = opts;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, languageCode, speakingRate, pitch, voiceName }),
  });
  if (!res.ok) {
    let err: any = {};
    try { err = await res.json(); } catch {}
    throw new Error(err?.error || `TTS failed (${res.status})`);
  }
  const data = await res.json();
  if (data.fallback) {
    throw new Error("TTS fallback mode - browser TTS not implemented in this component");
  }
  if (data.mp3Base64) {
    // Convert base64 to blob
    const byteCharacters = atob(data.mp3Base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }
  throw new Error("Invalid TTS response format");
}

export default function BedtimeStoryUI() {
  // form inputs
  const [theme, setTheme] = useState("");
  const [age, setAge] = useState<"toddler" | "early-reader" | "tween">("early-reader");
  const [minutes, setMinutes] = useState(10);
  const [childName, setChildName] = useState("");
  const [version, setVersion] = useState<"WEB" | "KJV" | "paraphrase">("WEB");

  // generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StoryPayload | null>(null);

  // tts state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [speakingRate, setSpeakingRate] = useState(0.9);
  const [pitch, setPitch] = useState(0);
  const [languageCode, setLanguageCode] = useState("en-US");
  const [voiceName, setVoiceName] = useState("");

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  async function handleGenerate() {
    setLoading(true); setError(null);
    try {
      const body: GenerateInput = {
        theme: theme || "peace",
        age,
        minutes,
        childName: childName || undefined,
        verseVersion: version,
      };
      const json = await postJSON("/api/bible-bedtime-stories/generate", body);
      setData(json);
      // Clear past audio
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    } catch (e: any) {
      setError(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSpeak() {
    try {
      if (!data) return;
      const narration = [
        data.title,
        "",
        data.story,
        "",
        "Memory verse:",
        `${data.verseRef}. ${data.verseText}`,
        "",
        "Prayer:",
        data.prayer,
      ].join("\n");
      const url = await ttsToObjectUrl({
        text: narration,
        languageCode,
        speakingRate,
        pitch,
        voiceName: voiceName || undefined,
      });
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setTimeout(() => audioRef.current?.play(), 0);
    } catch (e: any) {
      setError(e.message || "TTS failed");
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-night relative overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="star absolute top-8 left-10 text-xs" />
        <div className="star absolute top-24 right-16 text-sm" style={{ animationDelay: ".6s" }} />
        <div className="star absolute top-40 left-1/2 text-[10px]" style={{ animationDelay: "1.2s" }} />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 relative z-[1]">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Bible Bedtime Stories</h1>
          <p className="mt-2 text-white/80">
            Generate a gentle bedtime story with a memory verse and prayer, then listen with soothing narration.
          </p>
        </header>

        <div className="rounded-3xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 p-5 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme */}
            <div>
              <label className="block text-sm text-white/80 mb-2">Theme</label>
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., peace, courage"
                className="w-full rounded-2xl bg-white/90 text-slate-900 px-4 py-3 outline-none"
              />
              <Chips className="mt-3" items={["Peace","Courage","Kindness","Thankfulness","Obedience","Joy"]} onPick={(t)=>setTheme(t)} />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm text-white/80 mb-2">Age</label>
              <Segmented
                value={age}
                onChange={(v) => setAge(v as any)}
                options={[
                  { label: "2–4", value: "toddler" },
                  { label: "5–8", value: "early-reader" },
                  { label: "9–12", value: "tween" },
                ]}
              />
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm text-white/80 mb-2">Length (minutes)</label>
              <Segmented
                value={minutes}
                onChange={(v) => setMinutes(Number(v))}
                options={[
                  { label: "5", value: 5 },
                  { label: "10", value: 10 },
                  { label: "15", value: 15 },
                  { label: "20", value: 20 },
                  { label: "30", value: 30 },
                ]}
              />
            </div>

            {/* Child name */}
            <div>
              <label className="block text-sm text-white/80 mb-2">Child’s name (optional)</label>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g., Alex"
                className="w-full rounded-2xl bg-white/90 text-slate-900 px-4 py-3 outline-none"
              />
            </div>

            {/* Verse wording */}
            <div className="lg:col-span-2">
              <label className="block text-sm text-white/80 mb-2">Verse wording</label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value as any)}
                className="w-full rounded-2xl bg-white/90 text-slate-900 px-4 py-3 outline-none"
              >
                <option value="WEB">WEB (public domain)</option>
                <option value="KJV">KJV (public domain)</option>
                <option value="paraphrase">Paraphrase</option>
              </select>
              <p className="text-xs text-white/60 mt-2">WEB/KJV avoids licensing issues.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 rounded-2xl px-5 py-3 font-semibold bg-white text-slate-900 shadow hover:opacity-95 transition disabled:opacity-60"
            >
              {loading ? "Generating…" : "Generate Story ✨"}
            </button>
            <a
              href="/bible-bedtime-stories/voice"
              className="sm:w-56 text-center rounded-2xl px-5 py-3 font-medium bg-white/10 text-white hover:bg-white/15 border border-white/15 transition"
            >
              Open Voice Tester
            </a>
          </div>
          {error && (
            <div className="mt-4 rounded-2xl border border-rose-900/40 bg-rose-900/20 text-rose-100 p-3">Error: {error}</div>
          )}
        </div>

        {/* Story card */}
        {data && (
          <div className="mt-6 rounded-3xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 p-5 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-extrabold mb-2">{data.title || "Tonight’s Story"}</h2>
            <p className="whitespace-pre-wrap leading-7">{data.story}</p>

            <h3 className="mt-5 mb-2 font-semibold">Memory Verse — <span className="italic">{data.verseRef}</span></h3>
            <p className="whitespace-pre-wrap"><em>{data.verseText}</em></p>

            <h3 className="mt-5 mb-2 font-semibold">Prayer</h3>
            <p className="whitespace-pre-wrap">{data.prayer}</p>

            {data.talkQuestion && (
              <>
                <h3 className="mt-5 mb-2 font-semibold">Talk about it</h3>
                <p>{data.talkQuestion}</p>
              </>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleSpeak} className="rounded-2xl px-5 py-3 font-semibold bg-white text-slate-900 shadow hover:opacity-95 transition">▶ Generate & Play</button>
              <button onClick={() => audioRef.current?.pause()} disabled={!audioUrl} className="rounded-2xl px-5 py-3 font-medium bg-white/10 text-white hover:bg-white/15 border border-white/15 transition disabled:opacity-60">⏸ Pause</button>
              <button onClick={() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } }} disabled={!audioUrl} className="rounded-2xl px-5 py-3 font-medium bg-white/10 text-white hover:bg-white/15 border border-white/15 transition disabled:opacity-60">⏹ Stop</button>
            </div>

            <audio ref={audioRef} src={audioUrl ?? undefined} controls className={`mt-3 w-full ${audioUrl ? "block" : "hidden"}`} />
          </div>
        )}
      </div>
    </div>
  );
}
