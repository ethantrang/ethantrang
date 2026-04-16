import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export async function generateStaticParams() {
  const dir = join(process.cwd(), "content", "writings");
  return readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .map(f => ({ slug: f.replace(/\.md$/, "") }));
}

export default async function WritingEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = join(process.cwd(), "content", "writings", `${slug}.md`);
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }
  return <MarkdownRenderer content={content} />;
}
