import type { Metadata } from "next";
import "./globals.css";
import { CommandMenu } from "@/components/command-menu";
import { AutoBreadcrumb } from "@/components/auto-breadcrumb";

export const metadata: Metadata = {
  title: "Ethan Trang",
  description: `I build software products. Previously worked at Series A startups and unicorns in Australia and Vietnam.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body>
        <main className="container relative mx-auto scroll-my-12 overflow-auto p-4 md:p-8 lg:p-16 mb-24">
          <div className="mx-auto w-full max-w-2xl space-y-8">
            <AutoBreadcrumb />
            {children}
          </div>
        </main>

        <CommandMenu />
      </body>
    </html>
  );
}
