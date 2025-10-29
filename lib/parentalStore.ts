// Simple localStorage store (can swap to Firebase later)
import type { ParentalSettings } from "@/types/parental";

const KEY = "bbai_parental_settings_v1";

const DEFAULTS: ParentalSettings = {
  schema: 1,
  restrictByAge: true,
  hiddenStorySlugs: [],
  disableDownloads: false,
  disableAutoplayNext: true,
  showScripture: true,
  showPrayer: true,
  showDiscussion: true,
  lockLanguage: false,
  analyticsEnabled: false,
  children: [],
};

export function loadParental(): ParentalSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const obj = JSON.parse(raw) as ParentalSettings;
    if (obj.schema !== 1) return DEFAULTS;
    return { ...DEFAULTS, ...obj, schema: 1 };
  } catch {
    return DEFAULTS;
  }
}

export function saveParental(data: ParentalSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ ...data, schema: 1 }));
}

