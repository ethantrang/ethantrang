"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useEffect, useState } from "react";

type ContentItem = {
  slug: string;
  title: string;
  category: 'work' | 'random' | 'writings' | 'social';
  iconType?: 'image' | 'gradient' | 'svg';
  icon?: string;
  gradientColors?: string;
  externalUrl?: string;
  role?: string;
};

export function AutoBreadcrumb() {
  const pathname = usePathname();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // Fetch content items dynamically
  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContentItems(data))
      .catch(err => console.error('Failed to fetch content:', err));
  }, []);

  // Don't show breadcrumb on home page
  if (pathname === "/") {
    return null;
  }

  // Parse the pathname
  const segments = pathname.split("/").filter(Boolean);

  // If we're on a category page (e.g., /work, /random, /writings)
  if (segments.length === 1) {
    const category = segments[0];
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

    return (
      <Breadcrumb className="mb-8">
        <BreadcrumbList className="pl-0">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${category}`}>{categoryName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // If we're on a specific page (e.g., /work/inflect-labs)
  if (segments.length === 2) {
    const category = segments[0] as "work" | "random" | "writings" | "social";
    const slug = segments[1];
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const item = contentItems.find(
      (item) => item.category === category && item.slug === slug
    );

    return (
      <Breadcrumb className="mb-8">
        <BreadcrumbList className="pl-0">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${category}`}>{categoryName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {item && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${category}/${slug}`}>{item.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return null;
}
