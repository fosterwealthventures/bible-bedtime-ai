"use client";

import React from "react";
import { AGE_BUCKETS } from "@/lib/bible/age";
import type { AgeBucket } from "@/lib/bible/types";

export function badgeText(age: AgeBucket) {
  if (age === "2-4") return "Toddlers (2–4)";
  if (age === "5-8") return "Kids (5–8)";
  return "Preteens (9–12)";
}

interface Props {
  value: AgeBucket;
  onChange: (age: AgeBucket) => void;
  className?: string;
}

export default function AgeToggle({ value, onChange, className }: Props) {
  return (
    <div className={className ?? ""} role="radiogroup" aria-label="Select age range">
      <div className="inline-flex rounded-2xl border shadow-sm overflow-hidden">
        {AGE_BUCKETS.map((a) => {
          const active = a === value;
          return (
            <button
              key={a}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(a)}
              className={[
                "px-3 py-2 text-sm focus:outline-none focus-visible:ring",
                active ? "bg-brand-plum text-white" : "bg-background text-foreground",
                "hover:opacity-90 transition",
              ].join(" ")}
            >
              {badgeText(a)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
