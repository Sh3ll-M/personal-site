import { describe, it, expect } from "vitest";
import { getTagColor } from "./tagColors";

const PALETTE = ["#d9a44a", "#5fb8b0", "#9d8cd9", "#6a9fd8", "#d98a9e", "#8f97c9"];

describe("getTagColor", () => {
  it("returns the same color for the same tag every time", () => {
    expect(getTagColor("power-bi")).toBe(getTagColor("power-bi"));
  });

  it("always returns a color from the palette", () => {
    const tags = [
      "power-bi",
      "n8n",
      "meta",
      "typescript",
      "necromunda",
      "dax",
      "azure-openai",
      "power-query",
      "nextjs",
    ];
    for (const tag of tags) {
      expect(PALETTE).toContain(getTagColor(tag));
    }
  });

  it("returns a color for an empty string without throwing", () => {
    expect(() => getTagColor("")).not.toThrow();
    expect(PALETTE).toContain(getTagColor(""));
  });
});
