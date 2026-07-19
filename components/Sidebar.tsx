import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/cv", label: "cv" },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-rule bg-sidebar px-6 py-8">
      <div className="font-display text-xl font-bold text-ink">Matthew</div>
      <div className="mt-1 font-mono text-xs text-muted">builds &amp; breaks things</div>
      <nav className="mt-8 flex flex-col gap-3 font-mono text-sm text-muted">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
