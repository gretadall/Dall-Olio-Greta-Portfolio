type Comment = {
  id: string;
  body: string;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nessun commento ancora. Sii il primo.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">
              {comment.profiles?.display_name ?? "Utente"}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {comment.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
