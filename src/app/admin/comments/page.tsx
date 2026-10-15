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
      <h1 className="font-serif text-4xl">Commenti</h1>

      {comments.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
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
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">
                    {comment.profiles?.display_name ?? comment.profiles?.email}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                {entryHref && (
                  <Link
                    href={entryHref}
                    className="text-xs text-muted underline"
                  >
                    {comment.entries?.title}
                  </Link>
                )}

                <p className="mt-2 text-sm text-muted">
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
                      className="rounded-full border border-line px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                    >
                      {comment.is_hidden ? "Mostra" : "Nascondi"}
                    </button>
                  </form>
                  <form action={deleteComment.bind(null, comment.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
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
