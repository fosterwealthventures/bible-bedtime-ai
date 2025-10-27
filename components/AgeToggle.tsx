"use client";
import { useMemo } from "react";

export type AgeBucket = "2-4" | "5-8" | "9-12";

export function AgeToggle({
  value,
  onChange,
  className = "",
}: {
  value: AgeBucket;
  onChange: (v: AgeBucket) => void;
  className?: string;
}) {
  const items: AgeBucket[] = ["2-4", "5-8", "9-12"];
  return (
    <div className={"flex gap-2 " + className} role="tablist" aria-label="Age range">
      {items.map((v) => {
        const active = v === value;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={[
              "px-3 py-1 rounded-full border",
              active ? "bg-purple-600 text-white border-purple-600" : "bg-white text-purple-700 border-purple-200 hover:border-purple-400",
            ].join(" ")}
          >
            Ages {v}
          </button>
        );
      })}
    </div>
  );
}

export function agePrompt(age: AgeBucket) {
  if (age === "2-4") return "for toddlers and preschoolers (ages 2–4): extremely simple sentences, soothing tone, gentle vocabulary.";
  if (age === "5-8") return "for early readers (ages 5–8): short sentences, vivid imagery, friendly dialogue.";
  return "for preteens (ages 9–12): richer vocabulary, slightly longer paragraphs, age-appropriate adventure and reflection.";
}

export function badgeText(age: AgeBucket) {
  return "Ages " + age;
}