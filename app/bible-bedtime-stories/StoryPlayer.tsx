"use client";
import React from "react";

interface SceneMedia { title: string; img: string; audioUrl: string; duration: number; }
interface Props { scenes: SceneMedia[]; }

export default function StoryPlayer({ scenes }: Props) {
  const [idx, setIdx] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [rate, setRate] = React.useState(1);

  function onTimeUpdate() {
    const a = audioRef.current;
    if (!a) return;
    setProgress((a.currentTime / (a.duration || 1)) * 100);
  }
  function onEnded() {
    if (idx < scenes.length - 1) { setIdx(idx + 1); setProgress(0); setTimeout(() => audioRef.current?.play(), 0); }
    else { setPlaying(false); }
  }
  React.useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = rate; }, [rate, idx]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={scenes[idx]?.img} alt={scenes[idx]?.title} className="w-full aspect-video object-cover rounded-2xl border" />
      <div className="mt-2 text-sm opacity-80">{scenes[idx]?.title}</div>
      <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden"><div className="h-full" style={{ width: `${progress}%` }} /></div>
      <div className="flex items-center gap-2 mt-3">
        <button onClick={() => { const a = audioRef.current; if (!a) return; if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); } }} className="px-4 py-2 rounded-xl bg-brand-plum text-white">
          {playing ? "Pause" : "Play"}
        </button>
        <select className="px-2 py-2 rounded-lg border" value={rate} onChange={(e) => setRate(Number(e.target.value))}>
          <option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option>
        </select>
        <div className="ml-auto text-sm">Scene {idx + 1} / {scenes.length}</div>
      </div>
      <audio ref={audioRef} src={scenes[idx]?.audioUrl} onTimeUpdate={onTimeUpdate} onEnded={onEnded} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} className="hidden" />
    </div>
  );
}

