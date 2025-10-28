"use client";
import { useMemo } from "react";
import { useUI } from "@/lib/ui-state";
import { ALL_TOPICS } from "@/lib/content";
import { StoryCard } from "@/components/StoryCard";

export default function StoriesPage() {
  const { age } = useUI();
  // For now, show all stories since our new content system doesn't have age filtering
  // This could be enhanced by adding age information to the StoryTopic type
  const list = useMemo(() => ALL_TOPICS, []);
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold mb-6">Bible Bedtime Stories</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(story => (<StoryCard key={story.id} id={story.id} />))}
      </div>
    </main>
  );
}