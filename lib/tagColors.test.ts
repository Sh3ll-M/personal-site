import { describe, it, expect } from "vitest";
import { getTagColor } from "./tagColors";

const REAL_TAGS = [
  "azure-openai",
  "dax",
  "meta",
  "n8n",
  "necromunda",
  "nextjs",
  "power-bi",
  "power-query",
  "typescript",
];

describe("getTagColor", () => {
  it("returns the same color for the same tag every time", () => {
    expect(getTagColor("n8n", REAL_TAGS)).toBe(getTagColor("n8n", REAL_TAGS));
  });

  it("gives every distinct tag in a realistic 9-tag list a unique color", () => {
    const colors = REAL_TAGS.map((tag) => getTagColor(tag, REAL_TAGS));
    expect(new Set(colors).size).toBe(REAL_TAGS.length);
  });

  it("is not affected by the order of the allTags list", () => {
    const shuffled = [...REAL_TAGS].reverse();
    expect(getTagColor("necromunda", REAL_TAGS)).toBe(getTagColor("necromunda", shuffled));
  });

  it("always assigns 'meta' the site's ink color, regardless of allTags", () => {
    expect(getTagColor("meta", REAL_TAGS)).toBe("#e8e6e1");
    expect(getTagColor("meta", ["meta"])).toBe("#e8e6e1");
  });

  it("does not throw for a tag missing from allTags", () => {
    expect(() => getTagColor("unknown-tag", REAL_TAGS)).not.toThrow();
  });

  it("assigns palette colors in the documented order, by alphabetical position", () => {
    const alphabeticalTags = [
      "a-tag",
      "b-tag",
      "c-tag",
      "d-tag",
      "e-tag",
      "f-tag",
      "g-tag",
      "h-tag",
      "i-tag",
      "j-tag",
    ];
    expect(alphabeticalTags.map((tag) => getTagColor(tag, alphabeticalTags))).toEqual([
      "#d9a44a",
      "#5fb8b0",
      "#9d8cd9",
      "#6a9fd8",
      "#d98a9e",
      "#8f97c9",
      "#c2ca73",
      "#c98860",
      "#b57fc4",
      "#6bafc7",
    ]);
  });
});
