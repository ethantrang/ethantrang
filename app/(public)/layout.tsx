import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { ContentLayout } from "./content-layout";

type SectionItem = { name: string; slug: string };
type Section = { name: string; items: SectionItem[] };

function getTitleFromContent(content: string): string {
  const match = content.match(/^Title:\s*(.+)$/m);
  return match ? match[1].trim().toLowerCase() : "";
}

function isPublic(content: string): boolean {
  const match = content.match(/^Status:\s*(.+)$/m);
  if (!match) return true; // no Status field → treat as public (backwards compat)
  return match[1].trim().toLowerCase() === "public";
}

function getContentTree(): Section[] {
  const contentDir = join(process.cwd(), "content");
  const sections: Section[] = [];
  const rootItems: SectionItem[] = [];

  for (const entry of readdirSync(contentDir).sort()) {
    const abs = join(contentDir, entry);
    const stat = statSync(abs);

    if (stat.isFile() && entry.endsWith(".md")) {
      const slug = entry.replace(/\.md$/, "");
      const content = readFileSync(abs, "utf-8");
      if (!isPublic(content)) continue;
      const title = getTitleFromContent(content);
      rootItems.push({ name: title || slug, slug });
    } else if (stat.isDirectory()) {
      const items = readdirSync(abs)
        .filter(f => f.endsWith(".md"))
        .sort()
        .reduce<SectionItem[]>((acc, f) => {
          const slug = f.replace(/\.md$/, "");
          const content = readFileSync(join(abs, f), "utf-8");
          if (!isPublic(content)) return acc;
          const title = getTitleFromContent(content);
          acc.push({ name: title || slug, slug });
          return acc;
        }, []);
      if (items.length > 0) sections.push({ name: entry, items });
    }
  }

  if (rootItems.length > 0) {
    sections.unshift({ name: "", items: rootItems });
  }

  return sections;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const sections = getContentTree();
  return <ContentLayout sections={sections}>{children}</ContentLayout>;
}
