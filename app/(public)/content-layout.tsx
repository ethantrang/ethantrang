"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ResizableDivider } from "@/components/resizable-divider";

type SectionItem = { name: string; slug: string };
type Section = { name: string; items: SectionItem[] };

export function ContentLayout({ sections, children }: { sections: Section[]; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Default open on desktop, closed on mobile
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768);
  }, []);

  // Auto-close on mobile navigation
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] border border-border rounded md:max-w-[75vw] mx-auto w-full">
      <div className={sidebarOpen ? "contents" : "hidden"}>
        <Sidebar sections={sections} onClose={() => setSidebarOpen(false)} />
        <ResizableDivider />
      </div>

      {/* On mobile: hidden when sidebar open. On desktop: always visible. */}
      <main className={`flex-1 p-4 overflow-y-auto text-sm ${sidebarOpen ? "hidden md:block" : "block"}`}>
        {!sidebarOpen && (
          <button
            className="text-sm hover:underline mb-4 block"
            onClick={() => setSidebarOpen(true)}
          >
            ≡ menu
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
