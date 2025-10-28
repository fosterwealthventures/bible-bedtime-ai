export const THEMES = ["Peace","Courage","God's Love","Protection","Thankfulness","Healing"] as const;
export type ThemeKey = typeof THEMES[number];

export type StoryTopic = {
  id: string;
  title: string;
  theme: ThemeKey;
  blurb?: string;
};

export const ALL_TOPICS: StoryTopic[] = [
  { id: "daniel",          title: "Daniel and the Lions",        theme: "Courage" },
  { id: "david-goliath",   title: "David & Goliath",             theme: "Courage" },
  { id: "noah",            title: "Noah's Ark",                  theme: "Protection" },
  { id: "moses",           title: "Moses & the Sea",             theme: "Protection" },
  { id: "ruth",            title: "Ruth's Kindness",             theme: "Thankfulness" },
  { id: "ps23",            title: "Psalm 23: The Shepherd",      theme: "Peace" },
  { id: "jesus-storm",     title: "Jesus Calms the Storm",       theme: "Peace" },
  { id: "good-samaritan",  title: "The Good Samaritan",          theme: "God's Love" },
  { id: "prodigal",        title: "The Loving Father",           theme: "God's Love" },
  { id: "elijah",          title: "Elijah is Fed",               theme: "Healing" },
  { id: "jairus",          title: "Jairus' Daughter",            theme: "Healing" },
  { id: "esther",          title: "Queen Esther's Courage",      theme: "Courage" },
];