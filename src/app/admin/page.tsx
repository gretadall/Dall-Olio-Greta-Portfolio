import Link from "next/link";
import { getDashboardCounts } from "@/lib/admin-queries";

export default async function AdminDashboard() {
  const counts = await getDashboardCounts();

  return (
    <div>
      <h1 className="font-serif text-4xl">
        Ciao<span className="text-primary">.</span>
      </h1>
      <p className="mt-2 text-sm text-muted">Da qui gestisci tutto quello che appare sul sito.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Sezioni" value={counts.sections} href="/admin/sections" />
        <Stat label="Contenuti" value={counts.entries} href="/admin/sections" />
        <Stat label="Commenti" value={counts.comments} href="/admin/comments" />
        <Stat label="Iscritti" value={counts.followers} href="/admin/subscribers" />
      </div>

      <h2 className="mt-12 font-serif text-2xl">Cose che fai spesso</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Shortcut href="/admin/sections" title="Aggiungi un contenuto" text="Un progetto, un viaggio, uno sport…" />
        <Shortcut href="/admin/travel-pins/new" title="Nuovo luogo sul globo" text="Una puntina in più sulla mappa." />
        <Shortcut href="/admin/blog/posts/new" title="Scrivi un articolo" text="Per il blog." />
      </div>

      <p className="mt-10 text-sm text-muted">
        Per correggere al volo un titolo o una descrizione puoi anche andare sul sito e usare il
        pulsante <span className="text-foreground">✎ Modifica</span> in basso a destra.
      </p>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-primary/60"
    >
      <div className="font-serif text-4xl">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Link>
  );
}

function Shortcut({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-primary/60"
    >
      <span className="block font-medium transition-colors group-hover:text-primary">{title} →</span>
      <span className="mt-1 block text-sm text-muted">{text}</span>
    </Link>
  );
}
