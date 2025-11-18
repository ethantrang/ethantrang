"use client";

import { ContentLink } from "./content-link";
import { ContentItem, getContentByCategory } from "@/lib/content-config";

interface ContentListProps {
  category: ContentItem["category"];
  title?: string;
}

export function ContentList({ category, title }: ContentListProps) {
  const items = getContentByCategory(category);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-col max-w-custom">
      {title && <h2 className="mb-2 text-sm font-semibold">{title}</h2>}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ContentLink key={`${item.category}-${item.slug}`} item={item} />
        ))}
      </div>
    </div>
  );
}
