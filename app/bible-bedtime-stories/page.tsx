"use client";
import React, { useEffect, useMemo, useState } from "react";
import PlayButton from "@/components/PlayButton";
import Artwork from "@/components/Artwork";
import { AgeToggle, AgeBucket } from "@/components/AgeToggle";

const DURATIONS = [15, 30, 60] as const;

export default function BibleStoriesPage() {
  const [title, setTitle] = useState("Daniel and the Lions");
  const [age, setAge] = useState<AgeBucket>("5-8");
  const [minutes, setMinutes] = useState<typeof DURATIONS[number]>(30);
  const [story, setStory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setStory("");
    try {
      const res = await fetch("/api/bible-bedtime-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, minutes, age }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to generate");
      setStory(data.text);
    } catch (e: any) {
      console.error(e);
      setStory("Sorry—could not generate the story right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = useMemo(() => (story ? story.split(" ").slice(0, 30).join(" ") + "…" : ""), [story]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-3">
        <h1 className="text-3xl font-semibold text-purple-900">Bible Bedtime Stories</h1>
        <p className="text-purple-800/80">by Foster Wealth Ventures</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 rounded-2xl bg-white/70 p-6">
        <div>
          <Artwork title={title} age={age} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-purple-900">{title}</h2>
          <p className="text-purple-800/70">God is near</p>

          <div className="flex items-center gap-3 mt-3">
            <AgeToggle value={age} onChange={setAge} />
            <div className="flex gap-2 ml-auto">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={[
                    "px-3 py-1 rounded-full border",
                    minutes === m ? "bg-purple-600 text-white border-purple-600" : "bg-white text-purple-700 border-purple-200 hover:border-purple-400",
                  ].join(" ")}
                  aria-pressed={minutes === m}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-purple-900/90">{preview}</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={generate}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Loading…" : "Regenerate"}
            </button>
            <PlayButton text={story || ""} />
            <button
              onClick={() => navigator.clipboard.writeText(story || "")}
              className="px-3 py-2 rounded-lg border border-purple-200 text-purple-700 hover:border-purple-400"
            >
              Copy text
            </button>
            <button
              onClick={() => {
                const blob = new Blob([story || ""], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = title.replace(/\s+/g, "_") + ".txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-2 rounded-lg border border-purple-200 text-purple-700 hover:border-purple-400"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
