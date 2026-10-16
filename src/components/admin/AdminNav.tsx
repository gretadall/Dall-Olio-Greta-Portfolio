"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The Rete (3D graph) admin page still exists at /admin/rete but is left out
// of the menu while the graph is hidden from the public site.
const LINKS = [
  { href: "/admin", label: "Panoramica", exact: true },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/sections", label: "Sezioni" },
  { href: "/admin/travel-pins", label: "Luoghi" },
  { href: "/admin/blog/posts", label: "Blog" },
  { href: "/admin/blog/categories", label: "Categorie blog" },
  { href: "/admin/comments", label: "Commenti" },
  { href: "/admin/subscribers", label: "Iscritti" },
  { href: "/admin/texts", label: "Testi" },
  { href: "/admin/settings", label: "Impostazioni" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
              active
                ? "border-primary bg-primary/15 text-primary"
                : "border-line text-muted hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
