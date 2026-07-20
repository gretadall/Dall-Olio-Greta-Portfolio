import Link from "next/link";
import { getAllComments } from "@/lib/admin-queries";
import { setCommentHidden, deleteComment } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminCommentsPage() {
  const comments = await getAllComments();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Commenti</h1>

      {comments.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun commento ancora.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {comments.map((comment) => {
            const entryHref = comment.entries
              ? `/${comment.entries.sections?.slug}/${comment.entries.slug}`
              : null;

            return (
              <li
                key={comment.id}
                className="rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">
                    {comment.profiles?.display_name ?? comment.profiles?.email}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                {entryHref && (
                  <Link
                    href={entryHref}
                    className="text-xs text-zinc-500 underline dark:text-zinc-400"
                  >
                    {comment.entries?.title}
                  </Link>
                )}

                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {comment.body}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <form
                    action={setCommentHidden.bind(
                      null,
                      comment.id,
                      !comment.is_hidden
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded border border-black/[.12] px-3 py-1 text-xs dark:border-white/[.16]"
                    >
                      {comment.is_hidden ? "Mostra" : "Nascondi"}
                    </button>
                  </form>
                  <form action={deleteComment.bind(null, comment.id)}>
                    <button
                      type="submit"
                      className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
                    >
                      Elimina
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
