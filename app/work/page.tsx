import Link from "next/link";
import Image from "next/image";
import { getContentByCategory } from "@/lib/content-utils";

export default function WorkPage() {
  const items = getContentByCategory("work");

  return (
    <div className="space-y-1">
      <p>stuff i do for money.</p>
      <div className="space-y-1">
        {items.map(item => (
          <Link
            key={item.slug}
            href={`/work/${item.slug}`}
            className="flex items-center gap-x-2"
          >
            {item.iconType === "image" && item.icon ? (
              <Image
                src={item.icon}
                alt={`${item.title} icon`}
                width={18}
                height={18}
                className="h-4 w-4"
              />
            ) : (
              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-500" />
            )}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
