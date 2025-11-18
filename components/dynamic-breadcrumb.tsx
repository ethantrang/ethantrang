import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { getContentBySlug, ContentItem } from "@/lib/content-config";

interface DynamicBreadcrumbProps {
  category: ContentItem['category'];
  slug: string;
}

export function DynamicBreadcrumb({ category, slug }: DynamicBreadcrumbProps) {
  const item = getContentBySlug(category, slug);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
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
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

