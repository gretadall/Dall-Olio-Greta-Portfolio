import Link from "next/link";
import { Eyebrow } from "@/components/home/SectionHeader";

type Connection = {
  id: string;
  label: string;
  bidirectional: boolean;
};

type LinkedEntry = {
  title: string;
  slug: string;
  sections: { slug: string; title: string } | null;
} | null;

type Outgoing = Connection & { to_entry: LinkedEntry };
type Incoming = Connection & { from_entry: LinkedEntry };

export function ConnectionsList({
  outgoing,
  incoming,
}: {
  outgoing: Outgoing[];
  incoming: Incoming[];
}) {
  const items = [
    ...outgoing.map((c) => ({ id: c.id, label: c.label, entry: c.to_entry })),
    ...incoming.map((c) => ({ id: c.id, label: c.label, entry: c.from_entry })),
  ]
    .filter((item) => item.entry?.sections)
    // A link saved in both directions would otherwise show up twice.
    .filter(
      (item, i, all) =>
        all.findIndex(
          (other) =>
            other.entry!.slug === item.entry!.slug &&
            other.entry!.sections!.slug === item.entry!.sections!.slug
        ) === i
    );

  if (items.length === 0) return null;

  return (
    <div className="mt-16 max-w-2xl">
      <Eyebrow>Collegato a</Eyebrow>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {items.map(({ id, label, entry }) => (
          <li key={id}>
            <Link
              href={`/${entry!.sections!.slug}/${entry!.slug}`}
              className="group flex items-baseline justify-between gap-4 py-4"
            >
              <span>
                <span className="font-medium transition-colors group-hover:text-primary">
                  {entry!.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {[entry!.sections!.title, label].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span aria-hidden className="text-muted transition-colors group-hover:text-primary">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
