import type { MDXComponents } from "mdx/types";
import { PageItem } from "@/components/page-item";
import { LinkItem } from "@/components/link-item";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    PageItem,
    LinkItem,
  };
}
