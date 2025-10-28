"use client";
import { useState, useMemo } from "react";
import { useUI } from "@/lib/ui-state";
import { ALL_TOPICS, type StoryTopic } from "@/lib/content";

export function StoryCard({ id }: { id: string }) {
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
      // Generate a story using our new API
      const response = await fetch(`/api/story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: story.title,
          age: "5-8", // Default age, could be made configurable
          minutes: 15, // Default length, could be made configurable
          theme: story.theme,
          lang: lang === 'es' ? 'ES' : 'EN'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Now convert the generated story to audio
        const ttsResponse = await fetch(`/api/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: data.text,
            lang: lang === 'es' ? 'es-US' : 'en-US'
          }),
        });

        if (ttsResponse.ok) {
          const data = await ttsResponse.json();
          if (data.fallback) {
            console.error('TTS fallback mode, using browser TTS');
            // Here you could implement browser TTS fallback
          } else if (data.mp3Base64) {
            // Convert base64 to blob
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

  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <img src={`https://via.placeholder.com/400x300?text=${encodeURIComponent(story.title)}`} alt="" className="w-full h-44 object-cover" />
        <span className="badge absolute top-3 left-3">{story.theme}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 text-brand-plum">{story.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{story.blurb || `A Bible story about ${story.title.toLowerCase()}`}</p>
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