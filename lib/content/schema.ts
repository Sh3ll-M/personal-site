import { z, ZodType } from "zod";

export const frontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().min(1, "excerpt is required"),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export function parseFrontmatter<T>(schema: ZodType<T>, data: unknown, sourcePath: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in ${sourcePath}: ${issues}`);
  }
  return result.data;
}
