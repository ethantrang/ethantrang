import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { Sidebar } from "@/components/sidebar";
import { ResizableDivider } from "@/components/resizable-divider";

type SectionItem = { name: string; slug: string };
type Section = { name: string; items: SectionItem[] };

function getTitleFromContent(content: string): string {
  const pattern = /^#\s+(.+)$/m;
  const match = content.match(pattern);
  return match ? match[1].toLowerCase() : "";
}

interface ContentTree extends Section {
  rootFiles?: SectionItem[];
}

function getContentTree(): ContentTree[] {
  const contentDir = join(process.cwd(), "content");
  const sections: ContentTree[] = [];
  const rootFiles: SectionItem[] = [];

  for (const entry of readdirSync(contentDir).sort()) {
    const abs = join(contentDir, entry);
    const stat = statSync(abs);

    if (stat.isFile() && entry.endsWith(".md")) {
      // Handle root-level markdown files
      const slug = entry.replace(/\.md$/, "");
      const content = readFileSync(abs, "utf-8");
      const title = getTitleFromContent(content);
      rootFiles.push({ name: title || slug, slug });
    } else if (stat.isDirectory()) {
      // Handle subdirectory sections
      const items = readdirSync(abs)
        .filter(f => f.endsWith(".md"))
        .sort()
        .map(f => {
          const slug = f.replace(/\.md$/, "");
          const filePath = join(abs, f);
          const content = readFileSync(filePath, "utf-8");
          const title = getTitleFromContent(content);
          return { name: title || slug, slug };
        });
      sections.push({ name: entry, items });
    }
  }

  // Add root files as a special section at the beginning if they exist
  if (rootFiles.length > 0) {
    sections.unshift({ name: "", items: rootFiles, rootFiles: true } as any);
  }

  return sections;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const sections = getContentTree();

  return (
    <div className="flex min-h-[calc(100vh-2rem)] border border-border rounded">
      <Sidebar sections={sections} />
      <ResizableDivider />
      <main className="flex-1 p-4 overflow-y-auto text-sm max-w-4xl">
        {children}
      </main>
    </div>
  );
}
