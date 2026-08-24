import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-4 border-b border-black/[.08] pb-4 text-sm dark:border-white/[.145]">
      <Link href="/admin" className="hover:underline">
        Dashboard
      </Link>
      <Link href="/admin/sections" className="hover:underline">
        Sezioni
      </Link>
      <Link href="/admin/rete" className="hover:underline">
        Rete
      </Link>
      <Link href="/admin/travel-pins" className="hover:underline">
        Luoghi
      </Link>
      <Link href="/admin/comments" className="hover:underline">
        Commenti
      </Link>
      <Link href="/admin/subscribers" className="hover:underline">
        Iscritti
      </Link>
      <Link href="/admin/settings" className="hover:underline">
        Impostazioni
      </Link>
    </nav>
  );
}
