import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { CodeBlock } from "@/components/CodeBlock";

const rehypePrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
  defaultLang: "plaintext",
};

async function renderMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, rehypePrettyCodeOptions)
    .use(rehypeStringify)
    .process(content);

  return String(file);
}

export async function PostMarkdown({ content }: { content: string }) {
  const html = await renderMarkdown(content);
  return <CodeBlock html={html} />;
}
