import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethan Trang",
  description: `Founder of Inflect Labs. Make good software.`,
};

const themeScript = `
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.className = prefersDark ? 'dark' : 'light';
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="p-4">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
