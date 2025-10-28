export type Story = {
  id: string;
  age: "2-4" | "5-8" | "9-12";
  image: string;
  title: { en: string; es: string };
  subtitle: { en: string; es: string };
  theme?: string;
  tags?: string[];
};

export const STORIES: Story[] = [
  {
    id: "creation",
    age: "2-4",
    image: "https://via.placeholder.com/400x300?text=Creation",
    title: { en: "Creation: God Made It Good", es: "La Creación: Dios lo Hizo Bueno" },
    subtitle: { en: "God's world is wonderful and calm.", es: "El mundo de Dios es maravilloso y calmado." },
    theme: "Peace",
    tags: ["Peace", "Thankfulness"]
  },
  {
    id: "noah",
    age: "5-8",
    image: "https://via.placeholder.com/400x300?text=Noah",
    title: { en: "Noah's Ark of Care", es: "El Arca de Noé de Cuidado" },
    subtitle: { en: "God keeps us safe.", es: "Dios nos mantiene seguros." },
    theme: "Protection",
    tags: ["Protection", "God's Love"]
  },
  {
    id: "david",
    age: "9-12",
    image: "https://via.placeholder.com/400x300?text=David",
    title: { en: "David's Quiet Courage", es: "El Valiente Silencio de David" },
    subtitle: { en: "Small but brave with God's help.", es: "Pequeño pero valiente con la ayuda de Dios." },
    theme: "Courage",
    tags: ["Courage", "God's Love"]
  },
];

export function getStory(id: string): Story | undefined {
  return STORIES.find(s => s.id === id);
}