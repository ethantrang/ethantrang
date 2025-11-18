"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { contentItems } from "@/lib/content-config";

// Dynamically extract links from content config
const getLinks = () => {
  // Get external links (social and writings)
  const externalLinks = contentItems
    .filter((item) => item.externalUrl)
    .map((item) => ({
      url: item.externalUrl!,
      title: item.title,
      category: item.category,
    }));

  // Get internal pages (work and random)
  const internalPages = contentItems
    .filter(
      (item) =>
        (item.category === "work" || item.category === "random") &&
        !item.externalUrl
    )
    .map((item) => ({
      url: `/${item.category}/${item.slug}`,
      title: item.title,
      category: item.category,
    }));

  return [...externalLinks, ...internalPages];
};

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const links = useMemo(() => getLinks(), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Group links by category
  const groupedLinks = useMemo(() => {
    const groups: Record<string, typeof links> = {};
    links.forEach((link) => {
      if (!groups[link.category]) {
        groups[link.category] = [];
      }
      groups[link.category].push(link);
    });
    return groups;
  }, [links]);

  const handleSelect = (link: (typeof links)[0]) => {
    // Internal pages use Next.js router, external links open in new tab
    if (link.category === "work" || link.category === "random") {
      router.push(link.url);
    } else {
      window.open(link.url, "_blank");
    }
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
          <CommandGroup
            key={category}
            heading={category.charAt(0).toUpperCase() + category.slice(1)}
          >
            {categoryLinks.map((link) => (
              <CommandItem key={link.url} onSelect={() => handleSelect(link)}>
                {link.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
