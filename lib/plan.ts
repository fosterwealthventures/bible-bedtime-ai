"use client";
import { useEffect, useState } from "react";
import type { PlanCode } from "@/lib/entitlements";

const KEY = "bbai_plan_code";

export function usePlan() {
  const [plan, setPlan] = useState<PlanCode>("FREE");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = (localStorage.getItem(KEY) as PlanCode | null) || "FREE";
    setPlan(v);
  }, []);
  const save = (p: PlanCode) => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, p);
    setPlan(p);
  };
  return { plan, setPlan: save } as const;
}

