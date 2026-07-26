import { getAllTags, type TagCount } from "./posts";
import { getAllProjectTags } from "./projects";

export function getAllSiteTags(
  postTags: TagCount[] = getAllTags(),
  projectTags: TagCount[] = getAllProjectTags()
): string[] {
  return Array.from(new Set([...postTags.map((t) => t.tag), ...projectTags.map((t) => t.tag)]));
}
