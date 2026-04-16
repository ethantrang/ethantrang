import { readFileSync } from "fs";
import { join } from "path";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default function HomePage() {
  const content = readFileSync(
    join(process.cwd(), "content", "home.md"),
    "utf-8"
  );
  return <MarkdownRenderer content={content} />;
}
