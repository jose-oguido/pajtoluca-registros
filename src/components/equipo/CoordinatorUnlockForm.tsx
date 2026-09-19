"use client";

import { useActionState } from "react";
import { Key, WarningCircle } from "@phosphor-icons/react";
import { unlockCoordinatorScannerAction } from "@/app/equipo/actions";
import { initialCoordinatorAccessState } from "@/app/equipo/state";

export function CoordinatorUnlockForm() {
  const [state, formAction, pending] = useActionState(
    unlockCoordinatorScannerAction,
    initialCoordinatorAccessState
  );

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-[20px] bg-surface p-6 shadow-xl shadow-secondary/10 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft text-secondary">
          <Key size={24} weight="fill" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-tight">Acceso del equipo</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Escribe el código compartido por coordinación para abrir el lector de gafetes.
        </p>
        <form action={formAction} className="mt-6" noValidate>
          <label htmlFor="team-access-code" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Código de acceso
          </label>
          <input
            id="team-access-code"
            name="access_code"
            type="password"
            autoComplete="current-password"
            autoFocus
            className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {state.status === "error" && state.message ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600" role="alert">
              <WarningCircle size={16} weight="fill" />
              {state.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? "Verificando..." : "Abrir lector"}
          </button>
        </form>
      </section>
    </main>
  );
}
