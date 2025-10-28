// lib/useBedtime.ts (client)
import { useState } from "react";
import { AgeBucket } from "./bible/types";

export function useBedtime() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate(input: any) {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/bible-bedtime-stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to generate");
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return { loading, data, error, generate };
}
