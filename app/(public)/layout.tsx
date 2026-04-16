import { readdirSync, statSync } from "fs";
import { join } from "path";
import { Sidebar } from "@/components/sidebar";
import { ResizableDivider } from "@/components/resizable-divider";

type SectionItem = { name: string; slug: string };
type Section = { name: string; items: SectionItem[] };

function getContentTree(): Section[] {
  const contentDir = join(process.cwd(), "content");
  const sections: Section[] = [];

  for (const entry of readdirSync(contentDir).sort()) {
    const abs = join(contentDir, entry);
    if (statSync(abs).isDirectory()) {
      const items = readdirSync(abs)
        .filter(f => f.endsWith(".md"))
        .sort()
        .map(f => ({ name: f.replace(/\.md$/, ""), slug: f.replace(/\.md$/, "") }));
      sections.push({ name: entry, items });
    }
  }

  return sections;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const sections = getContentTree();

  return (
    <div className="flex min-h-[calc(100vh-2rem)] border border-gray-200 rounded">
      <Sidebar sections={sections} />
      <ResizableDivider />
      <main className="flex-1 p-4 overflow-y-auto text-sm max-w-4xl">
        {children}
      </main>
    </div>
  );
}
