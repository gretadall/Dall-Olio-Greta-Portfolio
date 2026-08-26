import Link from "next/link";
import Image from "next/image";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { EditableText } from "@/components/edit/EditableText";
import { Positionable } from "@/components/edit/Positionable";
import type { HomeLayout } from "@/lib/supabase/types";

const buttonClass =
  "rounded-full border border-black/[.12] px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-black/[.24] dark:border-white/[.16] dark:hover:border-white/[.3] sm:px-4 sm:py-1.5 sm:text-sm";

export function Nav({
  siteTitle,
  navTitleColor,
  linkedinUrl,
  contactEmail,
  homeLabel,
  reteLabel,
  chiSonoLabel,
  blogLabel,
  linkedinLabel,
  contactLabel,
  sections,
  layout,
}: {
  siteTitle: string;
  navTitleColor?: string | null;
  linkedinUrl: string | null;
  contactEmail: string | null;
  homeLabel: string;
  reteLabel: string;
  chiSonoLabel: string;
  blogLabel: string;
  linkedinLabel: string;
  contactLabel: string;
  sections: { slug: string; title: string; icon: string | null }[];
  layout: HomeLayout;
}) {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="nav-canvas relative mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
        <Positionable
          slotKey="nav.brand"
          target={{ table: "site_settings" }}
          position={layout["nav.brand"] ?? null}
          canvasClass="nav-canvas"
        >
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <Image
              src="/logo.png"
              alt={siteTitle}
              width={64}
              height={64}
              className="h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14"
            />
            <EditableText
              as="span"
              className="truncate text-base font-semibold tracking-tight text-primary sm:text-lg"
              style={navTitleColor ? { color: navTitleColor } : undefined}
              value={siteTitle}
              target={{ table: "site_settings", field: "site_title" }}
            />
          </Link>
        </Positionable>

        <Positionable
          slotKey="nav.buttons"
          target={{ table: "site_settings" }}
          position={layout["nav.buttons"] ?? null}
          canvasClass="nav-canvas"
          className="ml-auto"
        >
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link href="/rete" className={buttonClass}>
            <EditableText
              value={reteLabel}
              target={{ table: "site_settings", field: "nav_rete_label" }}
            />
          </Link>
          <Link href="/" className={buttonClass}>
            <EditableText
              value={homeLabel}
              target={{ table: "site_settings", field: "nav_home_label" }}
            />
          </Link>
          <Link href="/chi-sono" className={buttonClass}>
            <EditableText
              value={chiSonoLabel}
              target={{ table: "site_settings", field: "nav_chi_sono_label" }}
            />
          </Link>
          <Link href="/blog" className={buttonClass}>
            <EditableText
              value={blogLabel}
              target={{ table: "site_settings", field: "nav_blog_label" }}
            />
          </Link>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              <EditableText
                value={linkedinLabel}
                target={{ table: "site_settings", field: "linkedin_label" }}
              />
            </a>
          )}
          {contactEmail && (
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              <EditableText
                value={contactLabel}
                target={{ table: "site_settings", field: "contact_button_label" }}
              />
            </a>
          )}
          <HamburgerMenu
            sections={sections}
            homeLabel={homeLabel}
            reteLabel={reteLabel}
            chiSonoLabel={chiSonoLabel}
            blogLabel={blogLabel}
            linkedinUrl={linkedinUrl}
            linkedinLabel={linkedinLabel}
            contactEmail={contactEmail}
            contactLabel={contactLabel}
          />
        </div>
        </Positionable>
      </div>
    </header>
  );
}
