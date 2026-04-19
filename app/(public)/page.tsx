import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default function HomePage() {
  const content = readFileSync(join(process.cwd(), "content", "home.md"), "utf-8");
  const statusMatch = content.match(/^Status:\s*(.+)$/m);
  const status = statusMatch?.[1].trim().toLowerCase();
  if (status && status !== "public") notFound();
  return <MarkdownRenderer content={content} />;
}
