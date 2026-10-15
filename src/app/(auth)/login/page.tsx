"use client";

import { useActionState } from "react";
import { sendMagicLink } from "../actions";
import { T, useUiText } from "@/components/UiTexts";

export default function LoginPage() {
  const [state, action, pending] = useActionState(sendMagicLink, undefined);
  // A plain string: the button can't host an inline editor.
  const buttonLabel = useUiText("login.button");

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-24">
      <T as="h1" className="font-serif text-4xl" k="login.title" />
      <T as="p" className="mt-2 text-sm text-muted" k="login.text" />

      {state?.success ? (
        <T as="p" className="mt-8 text-sm text-foreground" k="login.sent" />
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
            {pending ? "Invio…" : buttonLabel}
          </button>
        </form>
      )}
    </div>
  );
}
