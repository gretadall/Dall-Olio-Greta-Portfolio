import Link from "next/link";
import { EditableText } from "@/components/edit/EditableText";
import { gmailComposeUrl } from "@/lib/contact";
import { T } from "@/components/UiTexts";

export function Footer({
  text,
  linkedinUrl,
  contactEmail,
}: {
  text: string;
  linkedinUrl: string | null;
  contactEmail: string | null;
}) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <EditableText
          value={text}
          target={{ table: "site_settings", field: "footer_text" }}
        />
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/chi-sono" className="transition-colors hover:text-foreground">
              <T k="footer.about" />
            </Link>
          </li>
          <li>
            <Link href="/blog" className="transition-colors hover:text-foreground">
              <T k="footer.blog" />
            </Link>
          </li>
          {linkedinUrl && (
            <li>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                <T k="footer.linkedin" />
              </a>
            </li>
          )}
          {contactEmail && (
            <li>
              <a
                href={gmailComposeUrl(contactEmail)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                <T k="footer.email" />
              </a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
