// Optional local artwork overrides by story id.
// Place image files under `public/art/...` and map them here.
// Example file path for Daniel: public/art/daniel-lions.jpg

export const ART_MAP: Record<string, string> = {
  // Normalized, friendly URLs (lowercase, hyphens). Rewrites map these
  // to the current on-disk filenames in next.config.js.
  daniel: "/art/daniel-lions.png",
  "david-goliath": "/art/david-goliath.png",
  noah: "/art/noah-ark.png",
  moses: "/art/moses-red-sea.png",
  ruth: "/art/ruth-kindness.png",
  ps23: "/art/shepherd-psalm-23.png",
  "jesus-storm": "/art/jesus-calms-the-storm.png",
  "good-samaritan": "/art/good-samaritan.png",
  prodigal: "/art/loving-father.png",
  esther: "/art/esther-brave-choice.png",
  elijah: "/art/elijah-fed.png",
  jairus: "/art/jairus-daughter.png",
  "jesus-birth": "/art/jesus-birth.png",
  "joseph-dream": "/art/joseph-dream.png",
};

export function storyImageUrlForId(id?: string | null): string | undefined {
  if (!id) return undefined;
  return ART_MAP[id];
}
