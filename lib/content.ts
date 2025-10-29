export const THEMES = ["Peace","Courage","God's Love","Protection","Thankfulness","Healing"] as const;
export type ThemeKey = typeof THEMES[number];

export type StoryTopic = {
  id: string;
  title: string;
  titleEs?: string;
  theme: ThemeKey;
  blurb?: string;
  blurbEs?: string;
};

export const ALL_TOPICS: StoryTopic[] = [
  { id: "daniel",          title: "Daniel and the Lions",        titleEs: "Daniel y los Leones",         theme: "Courage",       blurb: "God keeps Daniel safe with lions all around.", blurbEs: "Dios cuida a Daniel aun con leones a su alrededor." },
  { id: "david-goliath",   title: "David & Goliath",             titleEs: "David y Goliat",              theme: "Courage",       blurb: "A small shepherd trusts God and defeats a giant.", blurbEs: "Un joven pastor confía en Dios y vence a un gigante." },
  { id: "noah",            title: "Noah's Ark",                  titleEs: "El Arca de Noé",              theme: "Protection",    blurb: "God protects Noah’s family and animals through the flood.", blurbEs: "Dios protege a la familia de Noé y a los animales durante el diluvio." },
  { id: "moses",           title: "Moses & the Sea",             titleEs: "Moisés y el Mar",              theme: "Protection",    blurb: "God parts the sea so His people can walk through.", blurbEs: "Dios abre el mar para que su pueblo pueda pasar." },
  { id: "ruth",            title: "Ruth's Kindness",             titleEs: "La Bondad de Rut",             theme: "Thankfulness",  blurb: "Ruth shows kindness—and God provides a new home.", blurbEs: "Rut muestra bondad—y Dios le da un nuevo hogar." },
  { id: "ps23",            title: "Psalm 23: The Shepherd",      titleEs: "Salmo 23: El Pastor",          theme: "Peace",         blurb: "The Lord is our gentle Shepherd who cares for us.", blurbEs: "El Señor es nuestro Pastor y nos cuida con amor." },
  { id: "jesus-storm",     title: "Jesus Calms the Storm",       titleEs: "Jesús Calma la Tormenta",     theme: "Peace",         blurb: "Jesus speaks and the roaring storm becomes quiet.", blurbEs: "Jesús habla y la tormenta ruidosa se calma." },
  { id: "good-samaritan",  title: "The Good Samaritan",          titleEs: "El Buen Samaritano",          theme: "God's Love",    blurb: "A traveler shows God’s love by helping a hurt man.", blurbEs: "Un viajero muestra el amor de Dios al ayudar a un hombre herido." },
  { id: "prodigal",        title: "The Loving Father",           titleEs: "El Padre Amoroso",            theme: "God's Love",    blurb: "A father joyfully welcomes his child back home.", blurbEs: "Un padre recibe con alegría a su hijo que regresa a casa." },
  { id: "elijah",          title: "Elijah is Fed",               titleEs: "Elías es Alimentado",         theme: "Healing",       blurb: "God sends bread and water to strengthen Elijah.", blurbEs: "Dios envía pan y agua para fortalecer a Elías." },
  { id: "jairus",          title: "Jairus' Daughter",            titleEs: "La Hija de Jairo",            theme: "Healing",       blurb: "Jesus brings hope to a hurting family and heals.", blurbEs: "Jesús trae esperanza a una familia y sana." },
  { id: "esther",          title: "Queen Esther's Courage",      titleEs: "El Valor de la Reina Ester",  theme: "Courage",       blurb: "Esther bravely speaks up to protect her people.", blurbEs: "Ester habla con valentía para proteger a su pueblo." },
  // New topics matching provided artwork
  { id: "jesus-birth",     title: "The Birth of Jesus",          titleEs: "El Nacimiento de Jesús",      theme: "God's Love",    blurb: "Angels announce good news as Jesus is born in Bethlehem.", blurbEs: "Los ángeles anuncian buenas noticias: Jesús nace en Belén." },
  { id: "joseph-dream",    title: "Joseph's Dream",              titleEs: "El Sueño de José",            theme: "Protection",    blurb: "God guides Joseph in a dream to keep his family safe.", blurbEs: "Dios guía a José en un sueño para cuidar a su familia." },
];
