import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { FollowButton } from "@/components/FollowButton";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isFollowing = false;
  if (user) {
    const { data } = await supabase
      .from("follows")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    isFollowing = !!data;
  }

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Beyond CV
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <FollowButton initialFollowing={isFollowing} />
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Esci
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Accedi
          </Link>
        )}
      </div>
    </header>
  );
}
