import type { Metadata } from "next";
import "@fontsource/unbounded/500.css";
import "@fontsource/unbounded/600.css";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ULYS — Твои возможности. Твой путь.",
  description:
    "ULYS помогает школьникам находить возможности, собирать портфолио и понимать, что улучшить для поступления в университет.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
