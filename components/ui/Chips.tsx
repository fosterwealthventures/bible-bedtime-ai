"use client";
import React from "react";

export function Chips({
  items,
  onPick,
  className = "",
}: {
  items: string[];
  onPick: (s: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPick(t)}
          className="rounded-full px-3 py-1 text-sm bg-white/10 text-white/90 hover:bg-white/20 transition border border-white/15"
        >
          {t}
        </button>
      ))}
    </div>
  );
}

