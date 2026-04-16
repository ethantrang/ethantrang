import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export async function generateStaticParams() {
  const contentDir = join(process.cwd(), "content");
  const params: { section: string; slug: string }[] = [];

  for (const entry of readdirSync(contentDir)) {
    const abs = join(contentDir, entry);
    if (statSync(abs).isDirectory()) {
      for (const file of readdirSync(abs).filter(f => f.endsWith(".md"))) {
        params.push({ section: entry, slug: file.replace(/\.md$/, "") });
      }
    }
  }

  return params;
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const filePath = join(process.cwd(), "content", section, `${slug}.md`);

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  return <MarkdownRenderer content={content} />;
}
