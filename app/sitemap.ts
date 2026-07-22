import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPosts, type Post } from "@/lib/content/posts";
import { getAllProjects, type Project } from "@/lib/content/projects";

export function buildSitemap(posts: Post[], projects: Project[]): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/cv` },
    { url: `${SITE_URL}/blog` },
    { url: `${SITE_URL}/projects` },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: project.date,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(getAllPosts(), getAllProjects());
}
