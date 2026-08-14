import Link from "next/link";

type Connection = {
  id: string;
  label: string;
};

type Outgoing = Connection & {
  to_entry: {
    title: string;
    slug: string;
    sections: { slug: string } | null;
  } | null;
};

type Incoming = Connection & {
  from_entry: {
    title: string;
    slug: string;
    sections: { slug: string } | null;
  } | null;
};

export function ConnectionsList({
  outgoing,
  incoming,
}: {
  outgoing: Outgoing[];
  incoming: Incoming[];
}) {
  if (outgoing.length === 0 && incoming.length === 0) return null;

  return (
    <div className="mt-8 flex flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-tight text-muted">
        Collegamenti
      </h2>
      <ul className="flex flex-col gap-1.5">
        {outgoing.map((connection) => {
          const target = connection.to_entry;
          if (!target?.sections) return null;
          return (
            <li key={connection.id} className="text-sm">
              →{" "}
              <span className="text-muted">
                {connection.label}
              </span>{" "}
              →{" "}
              <Link
                href={`/${target.sections.slug}/${target.slug}`}
                className="underline"
              >
                {target.title}
              </Link>
            </li>
          );
        })}
        {incoming.map((connection) => {
          const source = connection.from_entry;
          if (!source?.sections) return null;
          return (
            <li key={connection.id} className="text-sm">
              ←{" "}
              <Link
                href={`/${source.sections.slug}/${source.slug}`}
                className="underline"
              >
                {source.title}
              </Link>{" "}
              <span className="text-muted">
                — {connection.label} questo
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
