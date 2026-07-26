import type { Metadata } from "next";
import { SITE_URL } from "./site";

export const SITE_NAME = "Sh3ll-M";
export const SITE_DESCRIPTION = "Sh3ll-M — CV, blog posts, and project write-ups, rendered as a git commit log.";

export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}
