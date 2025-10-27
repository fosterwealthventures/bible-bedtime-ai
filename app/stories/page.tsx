"use client";
import { useMemo } from "react";
import { useUI } from "@/lib/ui-state";
import { STORIES } from "@/data/stories";
import { StoryCard } from "@/components/StoryCard";

export default function StoriesPage() {
  const { age } = useUI();
  const list = useMemo(() => (age === "all" ? STORIES : STORIES.filter(s => s.age === age)), [age]);
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold mb-6">Bible Bedtime Stories</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(s => (<StoryCard key={s.id} id={s.id} />))}
      </div>
    </main>
  );
}