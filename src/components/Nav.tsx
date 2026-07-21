import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export async function Nav({ siteTitle }: { siteTitle: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-primary"
        >
          {siteTitle}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/rete"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Rete
          </Link>
          {user && (
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Esci
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
