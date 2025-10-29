import type { ThemeTag } from "./types";

export interface CatalogEntry {
  passageRef: string;
  title: string;
  themes: ThemeTag[];
  languages?: ("en" | "es")[];
}

export const CATALOG: CatalogEntry[] = [
  // Courage / Trust
  { passageRef: "1 Samuel 17", title: "David and Goliath", themes: ["Courage", "Trust in God", "God's Faithfulness"] },
  { passageRef: "Daniel 6", title: "Daniel in the Lions' Den", themes: ["Courage", "Prayer", "Obedience", "Trust in God"] },
  { passageRef: "Esther 4-5", title: "Queen Esther's Courage", themes: ["Courage", "Wisdom", "Trust in God"] },
  // Protection / Faithfulness (mapped onto Trust/Faithfulness)
  { passageRef: "Genesis 6–9", title: "Noah's Ark", themes: ["God's Faithfulness", "Trust in God"] },
  { passageRef: "Exodus 14", title: "The Red Sea Crossing", themes: ["God's Faithfulness", "Trust in God"] },
  // Kindness / Wisdom
  { passageRef: "Ruth 2", title: "Ruth's Kindness", themes: ["Kindness", "Wisdom", "God's Faithfulness"] },
  { passageRef: "Luke 10:25-37", title: "The Good Samaritan", themes: ["Kindness", "Wisdom"] },
  // Peace / Trust (mapped onto Trust/Faithfulness)
  { passageRef: "Psalm 23", title: "The Lord Is My Shepherd", themes: ["Trust in God", "God's Faithfulness", "Wisdom"] },
  { passageRef: "Mark 4:35-41", title: "Jesus Calms the Storm", themes: ["Trust in God", "Courage"] },
  // Forgiveness / Love
  { passageRef: "Luke 15:11-32", title: "The Prodigal Son", themes: ["Forgiveness", "Kindness", "God's Faithfulness", "Wisdom"] },
  // Provision / Healing (mapped onto Faithfulness/Trust/Prayer)
  { passageRef: "1 Kings 17:1-16", title: "Elijah Is Fed", themes: ["God's Faithfulness", "Trust in God", "Prayer"] },
  { passageRef: "Mark 5:21-43", title: "Jairus' Daughter", themes: ["Trust in God", "Prayer", "God's Faithfulness"] },
];

export function findPassagesByTheme(theme: ThemeTag): CatalogEntry[] {
  return CATALOG.filter((c) => c.themes.includes(theme));
}
