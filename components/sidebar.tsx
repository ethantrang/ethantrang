"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SectionItem = { name: string; slug: string };
type Section = { name: string; items: SectionItem[] };

export function Sidebar({ sections, showBorder = false }: { sections: Section[]; showBorder?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className={`w-48 md:w-64 flex-shrink-0 p-4 space-y-4 ${showBorder ? 'border-r border-border' : ''}`}>
      {sections.map(section => (
        <div key={section.name || "root"}>
          {section.name && <p className="text-sm mb-1">{section.name}</p>}
          <div className={`space-y-1 ${section.name ? "pl-2" : ""}`}>
            {section.items.map(item => {
              const href = section.name ? `/${section.name}/${item.slug}` : "/";
              const isActive = pathname === href;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={`text-sm block no-underline ${isActive ? "underline" : "hover:underline"}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
