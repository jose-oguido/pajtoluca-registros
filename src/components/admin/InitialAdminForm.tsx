"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { WarningCircle } from "@phosphor-icons/react";
import { setupFirstAdmin } from "@/app/admin/setup/actions";
import { initialSetupState } from "@/app/admin/setup/state";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Crear acceso"}
    </button>
  );
}

const inputClass =
  "w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

export function InitialAdminForm() {
  const [state, formAction] = useActionState(setupFirstAdmin, initialSetupState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Usuario
        </label>
        <input id="username" name="username" type="text" autoComplete="username" className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Contraseña
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm_password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Confirmar contraseña
        </label>
        <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" className={inputClass} />
      </div>
      {state.error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
          <WarningCircle size={15} weight="fill" />
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
