"use client";

export default function LibraryFilters({
  lang,
  setLang,
  filterAge,
  setFilterAge,
}: {
  lang: "en" | "es";
  setLang: (l: "en" | "es") => void;
  filterAge: "all" | "2-4" | "5-8" | "9-12";
  setFilterAge: (a: "all" | "2-4" | "5-8" | "9-12") => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {(["en", "es"] as const).map((L) => (
          <button
            key={L}
            onClick={() => setLang(L)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
              lang === L
                ? "bg-amber-300 text-[#0C2657]"
                : "bg-[#122C66] text-amber-100"
            }`}
          >
            {L.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {(["all", "2-4", "5-8", "9-12"] as const).map((A) => (
          <button
            key={A}
            onClick={() => setFilterAge(A)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
              filterAge === A
                ? "bg-amber-300 text-[#0C2657]"
                : "bg-[#122C66] text-amber-100"
            }`}
          >
            {A === "all"
              ? lang === "es"
                ? "Todas"
                : "All Ages"
              : A}
          </button>
        ))}
      </div>

      <button
        className="rounded-2xl bg-amber-300 px-4 py-2 text-[#0C2657] font-semibold shadow hover:translate-y-[1px] transition"
        onClick={() => (window.location.href = "/bible-bedtime-stories")}
      >
        {lang === "es" ? "+ Nueva Historia" : "+ New Story"}
      </button>
    </div>
  );
}

