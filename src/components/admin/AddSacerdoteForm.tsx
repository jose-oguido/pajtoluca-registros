"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle, UserPlus, WarningCircle } from "@phosphor-icons/react";
import { addSacerdoteAction } from "@/app/admin/dashboard/actions";
import { initialSendReportState } from "@/app/admin/dashboard/state";

const fieldClass =
  "w-full rounded-[12px] border border-border bg-surface px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent sm:text-sm";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast disabled:opacity-60"
    >
      <UserPlus size={16} weight="bold" />
      {pending ? "Guardando..." : "Registrar"}
    </button>
  );
}

export function AddSacerdoteForm({ count }: { count: number }) {
  const [state, formAction] = useActionState(addSacerdoteAction, initialSendReportState);

  return (
    <div className="rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <h3 className="font-display text-lg font-bold uppercase tracking-tight">Agregar sacerdote</h3>
      <p className="text-sm text-muted-foreground">
        {count} {count === 1 ? "sacerdote registrado" : "sacerdotes registrados"}. No se registran
        por un formulario público; se agregan aquí directamente.
      </p>

      <form action={formAction} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1.2fr_auto] sm:items-end">
        <div>
          <label htmlFor="sacerdote_full_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nombre completo
          </label>
          <input id="sacerdote_full_name" name="full_name" type="text" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="sacerdote_age" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Edad
          </label>
          <input id="sacerdote_age" name="age" type="number" min={18} max={99} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="sacerdote_phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Teléfono
          </label>
          <input id="sacerdote_phone" name="phone" type="tel" placeholder="10 dígitos" className={fieldClass} />
        </div>
        <SubmitButton />
      </form>

      {state.status !== "idle" && (
        <p
          className={[
            "mt-3 flex items-center gap-1.5 text-sm",
            state.status === "success" ? "text-emerald-600" : "text-red-600",
          ].join(" ")}
        >
          {state.status === "success" ? (
            <CheckCircle size={14} weight="fill" />
          ) : (
            <WarningCircle size={14} weight="fill" />
          )}
          {state.message}
        </p>
      )}
    </div>
  );
}
