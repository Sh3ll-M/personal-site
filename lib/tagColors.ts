const PALETTE = [
  "#d9a44a", // amber
  "#5fb8b0", // teal
  "#9d8cd9", // violet
  "#6a9fd8", // blue
  "#d98a9e", // rose
  "#8f97c9", // slate
  "#c2ca73", // citrine
  "#c98860", // clay
  "#b57fc4", // orchid
  "#6bafc7", // harbor
] as const;

const SPECIAL_TAG_COLORS: Record<string, string> = {
  meta: "#e8e6e1",
};

export function getTagColor(tag: string, allTags: string[]): string {
  if (tag in SPECIAL_TAG_COLORS) {
    return SPECIAL_TAG_COLORS[tag];
  }
  const sorted = Array.from(new Set(allTags)).sort();
  const index = sorted.indexOf(tag);
  return PALETTE[(index === -1 ? 0 : index) % PALETTE.length];
}
