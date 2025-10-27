"use client";

import { useState, useRef, useEffect } from "react";

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

  const res = await fetch("/api/bible-bedtime-stories/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, languageCode, speakingRate, pitch, voiceName }),
  });
  if (!res.ok) {
    let err: any = {};
    try { err = await res.json(); } catch {}
    throw new Error(err?.error || `TTS failed (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}

export default function BedtimeStoryUI() {
  // form inputs
  const [theme, setTheme] = useState("");
  const [age, setAge] = useState<"toddler" | "early-reader" | "tween">("early-reader");
  const [minutes, setMinutes] = useState(4);
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

  const styles = {
    page: { background: "#0b1020", minHeight: "100vh", color: "#ffffff" },
    wrap: { maxWidth: 980, margin: "0 auto", padding: "32px 16px" },
    title: { fontSize: 34, fontWeight: 800 as const, marginBottom: 6 },
    subtitle: { opacity: 0.7, marginBottom: 24 },
    grid: { display: "grid", gridTemplateColumns: "1fr", gap: 16 } as const,
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as const,
    card: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 },
    label: { fontSize: 13, opacity: 0.85, marginBottom: 6, display: "block" },
    input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", outline: "none", background: "rgba(255,255,255,0.08)", color: "#fff" } as const,
    select: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", outline: "none", background: "rgba(255,255,255,0.08)", color: "#fff" } as const,
    small: { fontSize: 12, opacity: 0.7 },
    btnRow: { display: "flex", gap: 12, flexWrap: "wrap" as const, marginTop: 12 },
    btn: { background: "#7c3aed", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 999, fontWeight: 700, cursor: "pointer" } as const,
    ghost: { background: "transparent", color: "#c4b5fd", border: "1px solid #7c3aed", padding: "10px 14px", borderRadius: 999, fontWeight: 700, cursor: "pointer" } as const,
    h2: { margin: "12px 0 8px 0", fontSize: 22, fontWeight: 800 as const },
    verse: { fontStyle: "italic" },
    error: { background: "#3f1d1d", border: "1px solid #7f1d1d", padding: 10, borderRadius: 10, marginTop: 12, color: "#fecaca" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <h1 style={styles.title}>Bible Bedtime Stories</h1>
        <p style={styles.subtitle}>Generate a gentle bedtime story with a memory verse and prayer, then listen with soothing narration.</p>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Theme</label>
                <input style={styles.input} placeholder="e.g., peace, courage" value={theme} onChange={e=>setTheme(e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Age</label>
                <select style={styles.select} value={age} onChange={e=>setAge(e.target.value as any)}>
                  <option value="toddler">Toddler (3–4)</option>
                  <option value="early-reader">Early reader (5–7)</option>
                  <option value="tween">Tween (8–11)</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div>
                <label style={styles.label}>Length (minutes)</label>
                <input style={styles.input} type="number" min={2} max={12} value={minutes} onChange={e=>setMinutes(parseInt(e.target.value || "4"))}/>
              </div>
              <div>
                <label style={styles.label}>Child’s name (optional)</label>
                <input style={styles.input} placeholder="e.g., Alex" value={childName} onChange={e=>setChildName(e.target.value)} />
              </div>
            </div>

            <div style={styles.row}>
              <div>
                <label style={styles.label}>Verse wording</label>
                <select style={styles.select} value={version} onChange={e=>setVersion(e.target.value as any)}>
                  <option value="WEB">WEB (public domain)</option>
                  <option value="KJV">KJV (public domain)</option>
                  <option value="paraphrase">Paraphrase</option>
                </select>
                <div style={styles.small}>WEB/KJV avoids licensing issues.</div>
              </div>
              <div />
            </div>

            <div style={styles.btnRow}>
              <button style={styles.btn} onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating…" : "Generate"}
              </button>
              <a href="/bible-bedtime-stories/voice" style={{...styles.ghost, textDecoration:"none", display:"inline-block"}}>Open Voice Tester</a>
            </div>
            {error && <div style={styles.error}>Error: {error}</div>}
          </div>

          {/* Story card */}
          {data && (
            <div style={styles.card}>
              <h2 style={styles.h2}>{data.title || "Tonight’s Story"}</h2>
              <p style={{whiteSpace:"pre-wrap", lineHeight:1.6}}>{data.story}</p>

              <h3 style={{marginTop:18, marginBottom:6}}>Memory Verse — <span style={styles.verse}>{data.verseRef}</span></h3>
              <p style={{whiteSpace:"pre-wrap"}}><em>{data.verseText}</em></p>

              <h3 style={{marginTop:18, marginBottom:6}}>Prayer</h3>
              <p style={{whiteSpace:"pre-wrap"}}>{data.prayer}</p>

              {data.talkQuestion && (
                <>
                  <h3 style={{marginTop:18, marginBottom:6}}>Talk about it</h3>
                  <p>{data.talkQuestion}</p>
                </>
              )}

              <div style={{...styles.btnRow, marginTop:16}}>
                <button style={styles.btn} onClick={handleSpeak}>▶ Generate & Play</button>
                <button style={styles.ghost} onClick={()=>audioRef.current?.pause()} disabled={!audioUrl}>⏸ Pause</button>
                <button style={styles.ghost} onClick={()=>{ if(audioRef.current){ audioRef.current.pause(); audioRef.current.currentTime=0; } }} disabled={!audioUrl}>⏹ Stop</button>
              </div>

              <audio ref={audioRef} src={audioUrl ?? undefined} controls style={{marginTop:12, width:"100%", display: audioUrl? "block":"none"}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}