import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { assignDecanatoAction } from "@/app/admin/dashboard/actions";
import type { RegistrationWithoutDecanato } from "@/lib/registrations";
import { WhatsAppUpdateButton } from "./WhatsAppUpdateButton";

export function UnassignedDecanatoList({
  rows,
  decanatos,
}: {
  rows: RegistrationWithoutDecanato[];
  decanatos: { id: string; name: string }[];
}) {
  if (rows.length === 0) return null;

  return (
    <section className="rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <div className="flex items-start gap-3">
        <WarningCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-gold" />
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">
            Registros por catalogar
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            A quienes no tienen parroquia se les solicita por WhatsApp. Al responder, su decanato
            se asigna automáticamente para incluirles en reportes y gafetes.
          </p>
        </div>
      </div>

      <div className="mt-5 max-h-[320px] divide-y divide-border overflow-y-auto" tabIndex={0} aria-label="Registros sin decanato">
        {rows.map((row) => {
          const needsParish = !row.parish_id?.trim();
          return (
            <article
              key={row.id}
              className="grid gap-3 py-3 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{row.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {needsParish ? "Sin parroquia ni decanato" : row.parish_group ?? row.ticket_id}
                </p>
              </div>
              {needsParish ? (
                <WhatsAppUpdateButton registrationId={row.id} fullName={row.full_name} phone={row.phone} />
              ) : (
                <form action={assignDecanatoAction.bind(null, row.id)} className="flex flex-col gap-2 sm:flex-row">
                  <select
                    name="decanato_id"
                    defaultValue=""
                    required
                    aria-label={`Decanato para ${row.full_name}`}
                    className="w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 sm:min-w-48"
                  >
                    <option value="" disabled>Asignar decanato</option>
                    {decanatos.map((decanato) => (
                      <option key={decanato.id} value={decanato.id}>{decanato.name}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-full border border-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:bg-accent-soft"
                  >
                    Guardar
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
