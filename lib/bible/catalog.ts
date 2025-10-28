import type { ThemeTag } from "./types";

export interface CatalogEntry {
  passageRef: string;
  title: string;
  themes: ThemeTag[];
  languages?: ("en" | "es")[];
}

export const CATALOG: CatalogEntry[] = [
  { passageRef: "1 Samuel 17", title: "David and Goliath", themes: ["Courage", "Trust in God", "God's Faithfulness"] },
  { passageRef: "Daniel 6", title: "Daniel in the Lions' Den", themes: ["Courage", "Prayer", "Obedience", "Trust in God"] },
  { passageRef: "Luke 15:11-32", title: "The Prodigal Son", themes: ["Forgiveness", "Kindness", "God's Faithfulness", "Wisdom"] },
  { passageRef: "Exodus 14", title: "The Red Sea Crossing", themes: ["God's Faithfulness", "Trust in God"] },
];

export function findPassagesByTheme(theme: ThemeTag): CatalogEntry[] {
  return CATALOG.filter((c) => c.themes.includes(theme));
}

