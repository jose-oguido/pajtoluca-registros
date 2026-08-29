"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import { sendReportAction } from "@/app/admin/dashboard/actions";
import { initialSendReportState } from "@/app/admin/dashboard/state";
import type { DecanatoSendSummary } from "@/lib/registrations";

function SendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
    >
      <PaperPlaneTilt size={14} weight="regular" />
      {pending ? "Enviando..." : "Enviar"}
    </button>
  );
}

function SendRow({ decanato }: { decanato: DecanatoSendSummary }) {
  const boundAction = sendReportAction.bind(null, decanato.id);
  const [state, formAction] = useActionState(boundAction, initialSendReportState);

  const disabled = !decanato.coordinatorEmail || decanato.count === 0;

  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{decanato.name}</p>
        <p className="text-sm text-muted-foreground">
          {decanato.count} {decanato.count === 1 ? "registro" : "registros"}
          {decanato.coordinatorEmail ? ` · ${decanato.coordinatorEmail}` : " · sin correo configurado"}
        </p>
        {state.status !== "idle" && (
          <p
            className={[
              "mt-1 flex items-center gap-1.5 text-sm",
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
      <form action={formAction}>
        <SendButton disabled={disabled} />
      </form>
    </div>
  );
}

export function CoordinatorSendList({ decanatos }: { decanatos: DecanatoSendSummary[] }) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <h3 className="font-display text-lg font-bold uppercase tracking-tight">
        Enviar a coordinadores
      </h3>
      <p className="text-sm text-muted-foreground">
        Envía por correo la lista de registrados de cada decanato a su coordinador, con el CSV
        adjunto.
      </p>

      <div className="mt-4 max-h-72 overflow-y-auto pr-1">
        {decanatos.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">Aún no hay decanatos configurados.</p>
        )}
        {decanatos.map((decanato) => (
          <SendRow key={decanato.id} decanato={decanato} />
        ))}
      </div>
    </div>
  );
}
