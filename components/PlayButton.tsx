// components/PlayButton.tsx
"use client";

import { useState } from "react";
import { speakText, stopSpeaking } from "@/lib/tts-browser";

export default function PlayButton({ text }: { text: string }) {
// ensure we send the FULL story text to TTS (not a snippet)
  const [playing, setPlaying] = useState(false);

  const onPlay = async () => {
    if (!text?.trim()) return;
    setPlaying(true);
    await speakText(text, { rate: 1, pitch: 1, volume: 1 });
  };

  const onStop = () => {
    stopSpeaking();
    setPlaying(false);
  };

  return (
    <button
      type="button"
      onClick={playing ? onStop : onPlay}
      className="inline-flex items-center rounded-xl px-4 py-2 font-medium shadow-sm ring-1 ring-black/5 hover:opacity-90 transition"
      aria-label={playing ? "Stop" : "Play"}
    >
      {playing ? "Stop" : "▶ Play"}
    </button>
  );
}