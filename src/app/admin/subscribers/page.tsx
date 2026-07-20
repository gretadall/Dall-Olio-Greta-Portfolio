import { getFollowers } from "@/lib/admin-queries";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminSubscribersPage() {
  const followers = await getFollowers();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Iscritti</h1>

      {followers.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun iscritto ancora.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {followers.map((follow) => (
            <li
              key={follow.user_id}
              className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <div>
                <div className="text-sm font-medium">
                  {follow.profiles?.display_name ?? follow.profiles?.email}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {follow.profiles?.email}
                </div>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                iscritto il {formatDate(follow.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
