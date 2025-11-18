import type { Metadata } from "next";
import "./globals.css";
import { CommandMenu } from "@/components/command-menu";
import { AutoBreadcrumb } from "@/components/auto-breadcrumb";

export const metadata: Metadata = {
  title: "Ethan Trang",
  description: `Founder of Inflect Labs. Make good software.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body>
        <main className="container relative mx-auto scroll-my-12 overflow-auto p-8 md:p-16 lg:p-24 mb-24">
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
