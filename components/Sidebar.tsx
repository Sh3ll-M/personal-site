import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/cv", label: "cv" },
];

export function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-rule bg-sidebar px-6 py-5 md:w-56 md:border-b-0 md:border-r md:py-8">
      <div className="font-display text-xl font-bold text-ink">Matthew</div>
      <div className="mt-1 font-mono text-xs text-muted">builds &amp; breaks things</div>
      <nav className="mt-6 flex gap-4 font-mono text-sm text-muted md:mt-8 md:flex-col md:gap-3">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
