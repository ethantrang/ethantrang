import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethan Trang",
  description: `Founder of Inflect Labs. Make good software.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className="p-4">{children}</body>
    </html>
  );
}
