"use client";

import { useActionState } from "react";
import { sendMagicLink } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(sendMagicLink, undefined);

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-24">
      <h1 className="font-serif text-4xl">Accedi</h1>
      <p className="mt-2 text-sm text-muted">
        Ricevi un link di accesso via email, senza password.
      </p>

      {state?.success ? (
        <p className="mt-8 text-sm text-foreground">
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
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          />
          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {pending ? "Invio…" : "Invia il link di accesso"}
          </button>
        </form>
      )}
    </div>
  );
}
