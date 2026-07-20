"use client";

import { useActionState } from "react";
import { sendMagicLink } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(sendMagicLink, undefined);

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Accedi</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Ricevi un link di accesso via email, senza password.
      </p>

      {state?.success ? (
        <p className="mt-8 text-sm text-zinc-700 dark:text-zinc-300">
          Controlla la tua casella email: ti abbiamo inviato un link per
          accedere.
        </p>
      ) : (
        <form action={action} className="mt-8 flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="tuemail@esempio.com"
            className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          />
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
          >
            {pending ? "Invio…" : "Invia il link di accesso"}
          </button>
        </form>
      )}
    </div>
  );
}
