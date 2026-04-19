"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SectionItem = { name: string; slug: string };
type Section = { name: string; items: SectionItem[] };

export function Sidebar({ sections, showBorder = false, onClose }: { sections: Section[]; showBorder?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`w-full md:w-64 flex-shrink-0 p-4 space-y-4 ${showBorder ? 'border-r border-border' : ''}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="text-sm hover:underline block mb-2"
        >
          ← collapse
        </button>
      )}
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
