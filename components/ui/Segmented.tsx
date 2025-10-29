"use client";
import React from "react";

type Option<T extends string | number> = { label: string; value: T };

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
}) {
  return (
    <div className={`inline-flex rounded-2xl bg-white/5 p-1 ring-1 ring-white/10 ${className}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "px-3 sm:px-4 py-2 text-sm sm:text-base rounded-xl transition",
              active ? "bg-white/90 text-slate-900 shadow" : "text-white/80 hover:bg-white/10",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

