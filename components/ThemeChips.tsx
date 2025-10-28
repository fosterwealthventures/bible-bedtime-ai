"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { THEMES, type ThemeKey } from "@/lib/content";

export default function ThemeChips() {
  const params = useSearchParams();
  const router = useRouter();
  const active = (params.get("theme") as ThemeKey) || "";

  function setTheme(t: string) {
    const usp = new URLSearchParams(params.toString());
    if (t && t !== active) usp.set("theme", t);
    else usp.delete("theme");
    router.replace(`?${usp.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setTheme("")}
        className={`px-3 py-1 rounded-full border ${active ? "border-slate-200 text-slate-600" : "border-brand-plum/40 bg-brand-plum/10 text-brand-plum"}`}
      >
        All themes
      </button>
      {THEMES.map(t => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-3 py-1 rounded-full border transition ${
            active === t
              ? "border-brand-plum bg-brand-plum text-white"
              : "border-slate-200 text-slate-700 hover:border-brand-plum/50"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}