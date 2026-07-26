const PALETTE = ["#d9a44a", "#5fb8b0", "#9d8cd9", "#6a9fd8", "#d98a9e", "#8f97c9"] as const;

export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}
