"use client";
import React from "react";

export default function PricingCTA() {
  const [email, setEmail] = React.useState("");
  const [plan, setPlan] = React.useState<"free" | "premium">("premium");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null); setErr(null);
    try {
      const r = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Request failed");
      setMsg("Thanks! We’ll email you when it’s ready.");
      setEmail("");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold">Get notified</h2>
      <p className="text-sm text-muted-foreground mt-2">Leave your email and we’ll let you know when pricing launches.</p>
      <form onSubmit={submit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2"
        />
        <select value={plan} onChange={(e)=>setPlan(e.target.value as any)} className="border rounded-xl px-3 py-2">
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Sending…" : "Notify me"}
        </button>
      </form>
      {msg && <div className="mt-3 text-sm text-green-700">{msg}</div>}
      {err && <div className="mt-3 text-sm text-red-700">{err}</div>}
    </div>
  );
}

