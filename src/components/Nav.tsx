"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { gmailComposeUrl } from "@/lib/contact";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/chi-sono", label: "Chi sono" },
  { href: "/progetti-personali", label: "Progetti" },
  { href: "/viaggi", label: "Viaggi" },
  { href: "/blog", label: "Blog" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav({
  siteTitle,
  contactEmail,
}: {
  siteTitle: string;
  contactEmail: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the mobile menu whenever the route changes.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={64}
            height={64}
            className="h-9 w-9 scale-150 object-contain invert"
            priority
          />
          <span className="text-sm font-semibold tracking-tight">
            {siteTitle}
            <span className="text-primary">.</span>
          </span>
        </Link>

        <nav aria-label="Principale" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-1 transition-colors ${
                      active ? "text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-[21px] h-px bg-primary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {contactEmail && (
            <a
              href={gmailComposeUrl(contactEmail)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full border border-line px-4 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary sm:inline-block"
            >
              Scrivimi
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Principale" className="border-t border-line md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between py-3 text-base ${
                      active ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                    <span aria-hidden className="text-muted">→</span>
                  </Link>
                </li>
              );
            })}
            {contactEmail && (
              <li>
                <a
                  href={gmailComposeUrl(contactEmail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-3 text-base"
                >
                  Scrivimi
                  <span aria-hidden className="text-muted">↗</span>
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
