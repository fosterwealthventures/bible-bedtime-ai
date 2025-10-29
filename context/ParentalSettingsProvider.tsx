"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadParental, saveParental } from "@/lib/parentalStore";
import type { ParentalSettings, ChildProfile, ParentalLang, AgeBucket } from "@/types/parental";

type Ctx = {
  settings: ParentalSettings;
  setSettings: (s: ParentalSettings) => void;
  activeChild?: ChildProfile;
  setActiveChildId: (id?: string) => void;
  enforceDuration: (requested: number) => number;
  isStoryVisible: (slug: string, ages: AgeBucket[]) => boolean;
  lockedLang: (fallback: ParentalLang) => ParentalLang;
  canPlayNow: () => boolean;
};

const ParentalCtx = createContext<Ctx | null>(null);
export const useParental = () => {
  const ctx = useContext(ParentalCtx);
  if (!ctx) throw new Error("ParentalSettingsProvider missing");
  return ctx;
};

export default function ParentalSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<ParentalSettings>(loadParental());

  useEffect(() => saveParental(settings), [settings]);

  const activeChild = useMemo(
    () => settings.children.find(c => c.id === settings.activeChildId),
    [settings.children, settings.activeChildId]
  );

  const setSettings = (s: ParentalSettings) => setSettingsState(s);
  const setActiveChildId = (id?: string) => setSettingsState(prev => ({ ...prev, activeChildId: id }));

  const enforceDuration = (requested: number) => {
    const cap = settings.maxMinutes ?? activeChild?.defaultMinutes;
    return cap ? Math.min(requested, cap) : requested;
  };

  const isStoryVisible = (slug: string, ages: AgeBucket[]) => {
    if (settings.hiddenStorySlugs.includes(slug)) return false;
    if (!settings.restrictByAge || !activeChild) return true;
    return ages.includes(activeChild.age);
  };

  const lockedLang = (fallback: ParentalLang) => {
    if (settings.lockLanguage && activeChild) return activeChild.lang;
    return fallback;
  };

  const withinBedtime = () => {
    if (!settings.bedtimeFrom || !settings.bedtimeTo) return true;
    const now = new Date();
    const [fh, fm] = settings.bedtimeFrom.split(":").map(Number);
    const [th, tm] = settings.bedtimeTo.split(":").map(Number);
    const start = new Date(now); start.setHours(fh, fm, 0, 0);
    const end = new Date(now);   end.setHours(th, tm, 0, 0);
    if (end < start) {
      return !(now >= end && now < start);
    } else {
      return !(now >= start && now < end);
    }
  };

  const canPlayNow = () => withinBedtime();

  const value: Ctx = {
    settings, setSettings,
    activeChild, setActiveChildId,
    enforceDuration, isStoryVisible, lockedLang, canPlayNow,
  };

  return <ParentalCtx.Provider value={value}>{children}</ParentalCtx.Provider>;
}

