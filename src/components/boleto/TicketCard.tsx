import { forwardRef } from "react";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { eventConfig } from "@/lib/event-config";
import type { Registration } from "@/lib/registrations";

export const TicketCard = forwardRef<
  HTMLDivElement,
  { registration: Registration; qrDataUrl: string }
>(function TicketCard({ registration, qrDataUrl }, ref) {
  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-xl shadow-secondary/10"
    >
      <div className="relative bg-gradient-to-br from-secondary to-secondary-dark px-7 py-6 text-secondary-contrast">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-2xl"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
          {eventConfig.edition} · {eventConfig.name}
        </p>
        <p className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">
          {eventConfig.edition} {eventConfig.fullName}
        </p>
      </div>
      <div className="h-1.5 bg-gradient-to-r from-accent via-gold to-secondary" />

      <div className="grid grid-cols-1 gap-8 p-7 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Asistente
          </p>
          <p className="mt-1 font-display text-xl font-bold">{registration.full_name}</p>

          {registration.parish_group && (
            <p className="mt-1 text-sm text-muted-foreground">{registration.parish_group}</p>
          )}

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarBlank size={16} weight="regular" className="shrink-0 text-accent" />
            {eventConfig.date}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={16} weight="regular" className="shrink-0 text-accent" />
            {eventConfig.venueAddress}
          </div>

          <div className="mt-6 border-t border-dashed border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Folio de boleto
            </p>
            <p className="mt-1 rounded-lg bg-secondary-soft px-3 py-2 font-mono text-lg font-bold tracking-wide text-secondary inline-block">
              {registration.ticket_id}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background px-6 py-5 sm:border-l sm:pl-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image can't optimize it */}
          <img
            src={qrDataUrl}
            alt="Código QR del boleto"
            width={140}
            height={140}
            className="rounded-lg"
          />
          <p className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
            Presenta este código
            <br />
            el día del evento
          </p>
        </div>
      </div>

      {registration.belongs_to_group === 1 && (
        <div className="border-t border-border bg-accent-soft px-7 py-4">
          <p className="text-sm text-foreground/80">
            El coordinador de tu decanato se estará poniendo en contacto contigo con más detalles.
          </p>
        </div>
      )}
    </div>
  );
});
