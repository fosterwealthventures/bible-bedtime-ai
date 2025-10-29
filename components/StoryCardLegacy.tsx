"use client";
import { useState, useMemo } from "react";
import { useUI } from "@/lib/ui-state";
import { ALL_TOPICS } from "@/lib/content";
import Image from "next/image";
import { placeholderArtUrl } from "@/components/StoryArt";
import { storyImageUrlForId } from "@/lib/art";

export function StoryCard({ id, imageUrl }: { id: string; imageUrl?: string | null }) {
  const { lang } = useUI();
  const story = useMemo(() => ALL_TOPICS.find(s => s.id === id), [id]);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  if (!story) {
    return <div>Story not found</div>;
  }

  const play = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: story.title,
          age: "5-8",
          minutes: 15,
          theme: story.theme,
          lang: lang === 'es' ? 'ES' : 'EN'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const ttsResponse = await fetch(`/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.text, lang: lang === 'es' ? 'es-US' : 'en-US' }),
        });

        if (ttsResponse.ok) {
          const data = await ttsResponse.json();
          if (data.fallback) {
            console.error('TTS fallback mode, using browser TTS');
          } else if (data.mp3Base64) {
            const byteCharacters = atob(data.mp3Base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const audioBlob = new Blob([byteArray], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
          }
        } else {
          console.error('Failed to generate audio');
        }
      } else {
        console.error('Failed to generate story');
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapped = storyImageUrlForId(story.id);
  const artwork = imageUrl || mapped || placeholderArtUrl(story.title, story.theme);

  const blurb = (lang === 'es' ? (story as any).blurbEs : story.blurb) ||
    (lang === 'es' ? `Una historia bíblica sobre ${story.title.toLowerCase()}` : `A Bible story about ${story.title.toLowerCase()}`);
  const displayTitle = lang === 'es' ? ((story as any).titleEs || story.title) : story.title;

  return (
    <div className="card overflow-hidden">
      <div className="story-art overflow-hidden rounded-t-2xl">
        <Image
          src={artwork}
          alt={`${story.title} artwork`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority={false}
        />
        <span className="badge absolute top-3 left-3">{story.theme}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 text-brand-plum">{displayTitle}</h3>
        <p className="text-gray-600 text-sm mb-4">{blurb}</p>
        <div className="flex items-center justify-between">
          <button onClick={play} disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? "Loading…" : "Listen Now"}
          </button>
          {audioUrl && (<audio controls src={audioUrl} className="ml-3 w-44" />)}
        </div>
      </div>
    </div>
  );
}

