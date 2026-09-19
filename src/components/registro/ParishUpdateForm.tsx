"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MapPin, WarningCircle } from "@phosphor-icons/react";
import { submitParishUpdate } from "@/app/actualizar-datos/[token]/actions";
import { initialParishUpdateState } from "@/app/actualizar-datos/[token]/state";
import { ParishCombobox } from "./ParishCombobox";

type ParishGroup = {
  decanato: string;
  zonaPastoral: string;
  options: { id: string; name: string; locality: string }[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      <MapPin size={18} weight="fill" aria-hidden="true" />
      {pending ? "Guardando…" : "Actualizar mis datos"}
    </button>
  );
}

export function ParishUpdateForm({
  token,
  parishGroups,
}: {
  token: string;
  parishGroups: ParishGroup[];
}) {
  const [state, formAction] = useActionState(submitParishUpdate, initialParishUpdateState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="parish_id" className="block font-display text-lg font-bold uppercase tracking-tight lg:whitespace-nowrap">
          ¿A qué parroquia acudes normalmente o cuál te queda cerca?
        </label>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground lg:whitespace-nowrap">
          Con esta información actualizaremos tu registro y te ubicaremos en el decanato correcto.
        </p>
        <div className="mt-4">
          <ParishCombobox
            groups={parishGroups}
            name="parish_id"
            id="parish_id"
            hasError={state.status === "error"}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground lg:whitespace-nowrap">
          Si no encuentras tu parroquia, responde al mensaje de WhatsApp que recibiste.
        </p>
      </div>

      {state.status === "error" && (
        <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-600">
          <WarningCircle size={17} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
