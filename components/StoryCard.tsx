"use client";
import { useState, useMemo } from "react";
import { useUI } from "@/lib/ui-state";
import { getStory } from "@/data/stories";

export function StoryCard({ id }: { id: string }) {
  const { lang } = useUI();
  const s = useMemo(() => getStory(id)!, [id]);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const play = async () => {
    setLoading(true);
    // Placeholder for TTS
    setTimeout(() => {
      setAudioUrl("https://example.com/audio.mp3");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <img src={s.image} alt="" className="w-full h-44 object-cover" />
        <span className="badge absolute top-3 left-3">Ages {s.age}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 text-brand.ink">{s.title[lang]}</h3>
        <p className="text-gray-600 text-sm mb-4">{s.subtitle[lang]}</p>
        <div className="flex items-center justify-between">
          <button onClick={play} disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? "Loading…" : "listenNow"}
          </button>
          {audioUrl && (<audio controls src={audioUrl} className="ml-3 w-44" />)}
        </div>
      </div>
    </div>
  );
}