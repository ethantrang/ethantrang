"use client";

import Link from "next/link";
import Image from "next/image";

interface PageItemProps {
  icon?: string;
  title: string;
  path: string;
}

export function PageItem({ icon, title, path }: PageItemProps) {
  const renderIcon = () => {
    if (!icon) return null;

    // Check if it's a gradient class string (e.g., "from-emerald-400 to-yellow-400")
    if (icon.startsWith("from-") && icon.includes("to-")) {
      return <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${icon}`} />;
    }
    // Otherwise treat it as an image path
    return (
      <Image
        src={icon}
        alt={`${title} icon`}
        width={18}
        height={18}
        className="h-4 w-4 rounded-md"
      />
    );
  };

  return (
    <Link href={path} className="flex items-center gap-x-2">
      {renderIcon()}
      <span>{title}</span>
    </Link>
  );
}
