import type { ReactNode } from "react";
import { spaceGrotesk, inter, plexMono } from "./fonts";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg font-body text-ink md:flex-row">
        <Sidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
