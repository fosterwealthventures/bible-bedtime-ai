'use client';

import { useState } from "react";
import { usePlan } from "@/lib/plan";

type PlanKey = "FREE" | "BASIC" | "FAMILY" | "FAMILY_PLUS";

const FEATURES: Record<PlanKey, string[]> = {
  FREE: ["1 profile", "5 stories / mo", "Core parental controls"],
  BASIC: ["1 profile", "Unlimited stories", "Parental controls"],
  FAMILY: ["Up to 5 profiles", "High monthly cap", "3 concurrent streams"],
  FAMILY_PLUS: ["Up to 10 profiles", "Highest caps", "Offline downloads"],
};

export default function PricingClient() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const { plan, setPlan } = usePlan();

  const subscribe = async (p: PlanKey) => {
    if (p === "FREE") {
      setPlan("FREE");
      return;
    }
    try {
      const res = await fetch("/api/bible-bedtime-stories/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: p, interval, userId: "anon" }),
      });
      const j = await res.json();
      if (j?.url) window.location.href = j.url;
    } catch {
      // Silently fail for now; could surface toast later.
    }
  };

  const Card = ({ code, price }: { code: PlanKey; price: string }) => (
    <div className="rounded-2xl bg-[#0C2657] text-white p-6 ring-1 ring-white/10 shadow">
      <h2 className="text-xl font-bold">
        {code.replace("_", " ")}
        {plan === code && <span className="ml-2 rounded-full bg-amber-300 px-2 py-0.5 text-xs font-semibold text-[#0C2657]">Current</span>}
      </h2>
      <div className="mt-2 text-2xl font-extrabold">{price}</div>
      <ul className="mt-3 text-sm text-blue-100 space-y-1">
        {FEATURES[code].map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <button
        onClick={() => subscribe(code)}
        className="mt-4 rounded-xl bg-amber-300 px-4 py-2 font-semibold text-[#0C2657]"
      >
        {code === "FREE" ? "Try Free" : "Upgrade"}
      </button>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-1 text-sm font-medium text-[#122C66]">
        Choose a plan that fits your family.
      </p>

      <div className="mt-5 flex items-center gap-2">
        <span className="text-sm font-medium text-[#122C66]">Billing:</span>
        <div className="rounded-2xl bg-[#122C66] p-1 ring-1 ring-white/10">
          {(["monthly", "yearly"] as const).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                interval === i ? "bg-amber-300 text-[#0C2657]" : "text-amber-100"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card code="FREE" price="$0" />
        <Card
          code="BASIC"
          price={interval === "monthly" ? "$5.99/mo" : "$57.50/yr"}
        />
        <Card
          code="FAMILY"
          price={interval === "monthly" ? "$11.99/mo" : "$114.50/yr"}
        />
        <Card
          code="FAMILY_PLUS"
          price={interval === "monthly" ? "$17.99/mo" : "$172.50/yr"}
        />
      </div>
    </div>
  );
}
