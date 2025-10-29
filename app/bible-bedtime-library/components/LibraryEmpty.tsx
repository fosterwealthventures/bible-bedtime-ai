export default function LibraryEmpty({ lang }: { lang: "en" | "es" }) {
  return (
    <div className="mt-16 text-center text-blue-100">
      <p className="text-lg font-semibold">
        {lang === "es"
          ? "Aún no tienes historias en tu biblioteca."
          : "You don’t have any stories yet."}
      </p>
      <button
        onClick={() => (window.location.href = "/bible-bedtime-stories")}
        className="mt-4 rounded-2xl bg-amber-300 px-5 py-3 text-[#0C2657] font-semibold shadow hover:translate-y-[1px] transition"
      >
        {lang === "es" ? "Crear mi primera historia" : "Create my first story"}
      </button>
    </div>
  );
}

