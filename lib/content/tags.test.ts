import { describe, it, expect } from "vitest";
import { getAllSiteTags } from "./tags";

describe("getAllSiteTags", () => {
  it("merges post tags and project tags with no duplicates", () => {
    const postTags = [
      { tag: "power-bi", count: 2 },
      { tag: "n8n", count: 1 },
    ];
    const projectTags = [
      { tag: "n8n", count: 1 },
      { tag: "necromunda", count: 1 },
    ];
    expect(getAllSiteTags(postTags, projectTags)).toEqual(["power-bi", "n8n", "necromunda"]);
  });

  it("returns an empty array when there are no tags anywhere", () => {
    expect(getAllSiteTags([], [])).toEqual([]);
  });
});
