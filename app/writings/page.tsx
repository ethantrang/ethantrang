import Link from "next/link";
import { getContentByCategory } from "@/lib/content-utils";

export default function WritingsPage() {
  const items = getContentByCategory("writings");

  return (
    <div className="space-y-1">
      <p>sometimes i think about things.</p>
      <p>
        if it&apos;s something that has the power to benefit one person, you
        have a moral obligation to show it to the world.
      </p>
      <div className="space-y-1">
        {items.map(item => (
          <Link
            key={item.slug}
            href={`/writings/${item.slug}`}
            className="flex items-center gap-x-2"
          >
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-500" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
