import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPosts, type Post } from "@/lib/content/posts";
import { getAllProjects, type Project } from "@/lib/content/projects";
import { getAllGangs, type Gang } from "@/lib/content/gangs";

export function buildSitemap(
  posts: Post[],
  projects: Project[],
  gangs: Gang[] = []
): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/blog` },
    { url: `${SITE_URL}/projects` },
    { url: `${SITE_URL}/gallery` },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: project.date,
  }));

  const gangRoutes: MetadataRoute.Sitemap = gangs.map((gang) => ({
    url: `${SITE_URL}/gallery/${gang.slug}`,
    lastModified: gang.date,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes, ...gangRoutes];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(getAllPosts(), getAllProjects(), getAllGangs());
}
