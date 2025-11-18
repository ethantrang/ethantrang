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
import { getContentBySlug } from "@/lib/content-config";

export function AutoBreadcrumb() {
  const pathname = usePathname();

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
    const item = getContentBySlug(category, slug);

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
