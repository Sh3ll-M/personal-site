"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactIcons } from "@/components/ContactIcons";

const NAV_ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
];

const NAV_LINK_CLASSES =
  "transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded-sm";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-rule bg-sidebar px-6 py-5 md:sticky md:top-0 md:h-screen md:self-start md:flex md:w-56 md:flex-col md:border-b-0 md:border-r md:py-8">
      <div className="font-display text-xl font-bold text-ink">Matthew</div>
      <div className="mt-1 font-mono text-xs text-muted">builds &amp; breaks things</div>
      <nav className="mt-6 flex gap-4 font-mono text-sm text-muted md:mt-8 md:flex-col md:gap-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? `${NAV_LINK_CLASSES} text-ink` : NAV_LINK_CLASSES}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 flex justify-center md:mt-auto md:pt-8">
        <ContactIcons />
      </div>
    </aside>
  );
}
