import { ImageResponse } from "next/og";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);

  const title = project?.title ?? "Untitled project";
  const excerpt = project?.excerpt ?? "";
  const hash = project?.git.hash ?? "";
  const date = project?.date ?? "";
  const added = project?.git.added ?? 0;
  const removed = project?.git.removed ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#101214",
          padding: "72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 28,
            color: "#8a8f98",
          }}
        >
          {date}
          {"  "}
          {hash}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "#e8e6e1",
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              color: "#8a8f98",
              lineHeight: 1.4,
            }}
          >
            {excerpt}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 28,
          }}
        >
          <span style={{ color: "#3fb374" }}>+{added}</span>
          <span style={{ marginLeft: 16, color: "#e0605c" }}>-{removed}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
