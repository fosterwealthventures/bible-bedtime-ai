export type AgeBucket = "2-4" | "5-8" | "9-12";
export type ParentalLang = "en" | "es";

export interface ChildProfile {
  id: string;
  name: string;
  age: AgeBucket;
  lang: ParentalLang;
  defaultMinutes: 5 | 10 | 15 | 20 | 30;
}

export interface ParentalSettings {
  schema: 1;
  pinHash?: string;
  activeChildId?: string;

  restrictByAge: boolean;
  hiddenStorySlugs: string[];

  maxMinutes?: 5 | 10 | 15 | 20 | 30;
  disableDownloads: boolean;
  disableAutoplayNext: boolean;
  enforceSleepTimer?: 5 | 10 | 15 | 20 | 30;

  bedtimeFrom?: string; // "HH:MM"
  bedtimeTo?: string;   // "HH:MM"

  showScripture: boolean;
  showPrayer: boolean;
  showDiscussion: boolean;

  lockLanguage: boolean;

  analyticsEnabled: boolean;

  children: ChildProfile[];
}

