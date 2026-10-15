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
      <h1 className="font-serif text-4xl">Iscritti</h1>

      {followers.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          Nessun iscritto ancora.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {followers.map((follow) => (
            <li
              key={follow.user_id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <div>
                <div className="text-sm font-medium">
                  {follow.profiles?.display_name ?? follow.profiles?.email}
                </div>
                <div className="text-xs text-muted">
                  {follow.profiles?.email}
                </div>
              </div>
              <span className="text-xs text-muted">
                iscritto il {formatDate(follow.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
