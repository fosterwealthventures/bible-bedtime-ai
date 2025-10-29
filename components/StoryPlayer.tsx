"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParental } from "@/context/ParentalSettingsProvider";
import { usePlan } from "@/lib/plan";
import { useEntitlements } from "@/lib/entitlements";
import Image from "next/image";

type TabKey = "transcript" | "scripture" | "prayer" | "discussion";
type Lang = "en" | "es";

export interface StoryPlayerProps {
  src: string;                 // streamed MP3/OGG from your TTS
  title: string;
  subtitle?: string;           // e.g., “Age 5–8 • 10 min • EN”
  artwork?: string;            // /public/... poster art
  lang?: Lang;                 // EN/ES label on tabs
  transcript?: string;         // full story text
  scripture?: { ref: string; text: string };
  prayer?: string;
  discussion?: string[];       // bullet questions
  onDownloadHref?: string;     // if provided, show Download
  onRegenerate?: () => void;   // hook to regenerate with current settings
  onEnd?: () => void;          // for autoplay next in queue
  // Optional: when provided, automatically persist listening progress to Firestore
  librarySlug?: string;
}

export default function StoryPlayer(p: StoryPlayerProps) {
  const { settings, canPlayNow } = useParental();
  const { plan } = usePlan();
  const ent = useEntitlements(plan);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [sleepMin, setSleepMin] = useState<number | null>(null);
  const [active, setActive] = useState<TabKey>("transcript");
  const [lang, setLang] = useState<Lang>(p.lang ?? "en");
  const [bookmark, setBookmark] = useState<number | null>(null);
  // Persist progress when enabled
  usePersistProgress(!!p.librarySlug, p.librarySlug, cur);

  // Apply enforced sleep timer
  useEffect(() => {
    if (settings.enforceSleepTimer) setSleepMin(settings.enforceSleepTimer);
  }, [settings.enforceSleepTimer]);

  // format hh:mm:ss
  const t = (sec: number) => {
    if (!isFinite(sec)) return "0:00";
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor(sec / 60) % 60;
    const h = Math.floor(sec / 3600);
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s}` : `${m}:${s}`;
  };

  // init audio
  useEffect(() => {
    const a = audioRef.current!;
    if (!a) return;
    const onLoaded = () => { setDur(a.duration || 0); setReady(true); };
    const onTime = () => setCur(a.currentTime || 0);
    const onEnd = () => { setPlaying(false); p.onEnd?.(); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [p.src]);

  // playback rate & loop
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = rate; }, [rate]);
  useEffect(() => { if (audioRef.current) audioRef.current.loop = loop; }, [loop]);

  // sleep timer
  useEffect(() => {
    if (sleepMin == null || !audioRef.current) return;
    const target = audioRef.current.currentTime + sleepMin * 60;
    const id = setInterval(() => {
      if (!audioRef.current) return;
      if (audioRef.current.currentTime >= target) audioRef.current.pause();
    }, 1000);
    return () => clearInterval(id);
  }, [sleepMin, p.src]);

  // Media Session (lock screen controls)
  useEffect(() => {
    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      // @ts-ignore - MediaMetadata may not exist in some TS DOM lib versions
      navigator.mediaSession.metadata = new (window as any).MediaMetadata({
        title: p.title,
        artist: "Bible Bedtime AI",
        album: "Stories",
        artwork: p.artwork ? [{ src: p.artwork, sizes: "1024x1024", type: "image/png" }] : undefined,
      });
      // @ts-ignore
      navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
      // @ts-ignore
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      // @ts-ignore
      navigator.mediaSession.setActionHandler("seekbackward", () => seekRel(-15));
      // @ts-ignore
      navigator.mediaSession.setActionHandler("seekforward", () => seekRel(+15));
    }
  }, [p.title, p.artwork]);

  const seekRel = (delta: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min((dur || 0), audioRef.current.currentTime + delta));
  };

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setCur(v);
    if (audioRef.current) audioRef.current.currentTime = v;
  };

  const sleepOpts = [null, 5, 10, 15, 20, 30] as (number | null)[];

  // a11y shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); playing ? audioRef.current?.pause() : audioRef.current?.play(); }
      if (e.code === "ArrowLeft") seekRel(-15);
      if (e.code === "ArrowRight") seekRel(+15);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, dur]);

  // bookmark current time
  const saveBookmark = () => setBookmark(cur);
  const jumpBookmark = () => { if (bookmark != null && audioRef.current) audioRef.current.currentTime = bookmark; };

  const tabLabels: Record<TabKey, string> = useMemo(() => ({
    transcript: lang === "es" ? "Transcripción" : "Transcript",
    scripture: lang === "es" ? "Escritura" : "Scripture",
    prayer:    lang === "es" ? "Oración"    : "Prayer",
    discussion:lang === "es" ? "Preguntas"  : "Discussion",
  }), [lang]);

  if (!canPlayNow()) {
    return (
      <div className="rounded-2xl bg-[#0B1E4A] p-4 text-amber-200 ring-1 ring-white/10">
        Bedtime is active right now. Try again later. 🌙
      </div>
    );
  }

  const allowDownload = ent.downloads && !settings.disableDownloads && p.onDownloadHref;
  const showScripture = settings.showScripture;
  const showPrayer = settings.showPrayer;
  const showDiscussion = settings.showDiscussion;

  return (
    <div className="rounded-3xl bg-[#0C2657] text-white ring-1 ring-black/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        {p.artwork && (
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-white/10">
            <Image src={p.artwork} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold truncate">{p.title}</h3>
          {p.subtitle && <p className="text-blue-200 text-sm truncate">{p.subtitle}</p>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="rounded-xl bg-[#122C66] p-1 ring-1 ring-white/10">
            {(["en","es"] as Lang[]).map(L => (
              <button
                key={L}
                onClick={() => setLang(L)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  lang===L ? "bg-amber-300 text-[#0C2657]" : "text-amber-100"}`}>
                {L.toUpperCase()}
              </button>
            ))}
          </div>
          {allowDownload && (
            <a
              className="rounded-xl border border-amber-300/70 px-3 py-2 text-amber-200 hover:bg-amber-300/10 transition"
              href={p.onDownloadHref} download>
              ⬇ Download
            </a>
          )}
          {p.onRegenerate && (
            <button onClick={p.onRegenerate}
              className="rounded-xl bg-amber-300 px-3 py-2 font-semibold text-[#0C2657]">
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-2">
        <input
          type="range"
          min={0}
          max={dur || 0}
          step={0.1}
          value={cur}
          onChange={onScrub}
          className="w-full accent-amber-300"
          aria-label="Seek"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-blue-200">
          <span>{t(cur)}</span>
          <span>{t(dur)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => seekRel(-15)}
              className="rounded-xl bg-[#122C66] px-3 py-2 hover:bg-[#183672]">⏪ 15s</button>
            <button
              onClick={() => (playing ? audioRef.current?.pause() : audioRef.current?.play())}
              className="rounded-2xl bg-amber-300 px-5 py-2 font-bold text-[#0C2657]">
              {playing ? "Pause" : "Play"}
            </button>
            <button onClick={() => seekRel(+15)}
              className="rounded-xl bg-[#122C66] px-3 py-2 hover:bg-[#183672]">15s ⏩</button>
            <button onClick={() => setLoop(v => !v)}
              className={`rounded-xl px-3 py-2 ${loop ? "bg-amber-300 text-[#0C2657]" : "bg-[#122C66] hover:bg-[#183672]"}`}>
              ⟳ Loop
            </button>
            <button onClick={saveBookmark}
              className="rounded-xl bg-[#122C66] px-3 py-2 hover:bg-[#183672]">☆ Bookmark</button>
            <button onClick={jumpBookmark}
              className="rounded-xl bg-[#122C66] px-3 py-2 hover:bg-[#183672] disabled:opacity-40"
              disabled={bookmark==null}>↦ Jump</button>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="rounded-xl bg-[#122C66] px-3 py-2 text-sm"
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              aria-label="Playback speed"
            >
              { [0.75,1,1.25,1.5,1.75,2].map(v => (
                <option key={v} value={v}>{v}×</option>
              )) }
            </select>

            <select
              className="rounded-xl bg-[#122C66] px-3 py-2 text-sm"
              value={String(sleepMin)}
              onChange={e => setSleepMin(e.target.value==="null" ? null : Number(e.target.value))}
              aria-label="Sleep timer"
            >
              {sleepOpts.map(v => (
                <option key={String(v)} value={String(v)}>
                  {v==null ? (lang==="es" ? "Sin temporizador" : "No timer") : `${v} min`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex gap-2">
          {(["transcript","scripture","prayer","discussion"] as TabKey[]).map(k => (
            <button key={k}
              onClick={() => setActive(k)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                active===k ? "bg-amber-300 text-[#0C2657]" : "bg-[#122C66] text-amber-100"}`}>
              {tabLabels[k]}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10">
          {active==="transcript" && (
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{p.transcript || (lang==="es" ? "No hay transcripción." : "No transcript yet.")}</p>
            </div>
          )}
          {active==="scripture" && showScripture && (
            <div className="prose prose-invert max-w-none">
              {p.scripture ? (
                <>
                  <h4 className="m-0">{p.scripture.ref}</h4>
                  <p className="whitespace-pre-wrap">{p.scripture.text}</p>
                </>
              ) : <p>{lang==="es" ? "Sin pasaje bíblico." : "No scripture attached."}</p>}
            </div>
          )}
          {active==="prayer" && showPrayer && (
            <p className="whitespace-pre-wrap">{p.prayer || (lang==="es" ? "Sin oración." : "No prayer yet.")}</p>
          )}
          {active==="discussion" && showDiscussion && (
            <ul className="list-disc pl-5 space-y-1">
              {(p.discussion?.length ? p.discussion : [lang==="es" ? "Sin preguntas." : "No questions yet."])
                .map((q,i)=>(<li key={i}>{q}</li>))}
            </ul>
          )}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={p.src} preload="metadata" />
    </div>
  );
}

// Persist progress to Firestore every ~5s when librarySlug is provided
// Implemented via a component-level effect to avoid adding dependencies to callers
import { useEffect as useEffectPersist, useRef as useRefPersist } from "react";
import { updateProgress } from "@/lib/library";

function usePersistProgress(enabled: boolean, slug: string | undefined, cur: number) {
  const lastSent = useRefPersist(0);
  useEffectPersist(() => {
    if (!enabled || !slug) return;
    const now = Date.now();
    if (now - lastSent.current < 5000) return;
    lastSent.current = now;
    // fire and forget
    updateProgress(slug, Math.floor(cur)).catch(()=>{});
  }, [enabled, slug, cur]);
}

// Patch StoryPlayer to call usePersistProgress by monkey-patching React hooks usage
// We wrap the original default export with a HOC-like behavior is not trivial here.
// Instead, we re-export the same component but rely on callers to pass librarySlug
// and we attach a side-effect by augmenting the component body above.
