import type { ReactNode } from "react";
import { spaceGrotesk, inter, plexMono } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-bg font-body text-ink">{children}</body>
    </html>
  );
}
