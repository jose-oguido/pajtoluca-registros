import { forwardRef } from "react";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { eventConfig } from "@/lib/event-config";
import { getTicketHeaderColor, getTicketTypeLabel } from "@/lib/registration-types";
import type { Registration } from "@/lib/registrations";

export const TicketCard = forwardRef<
  HTMLDivElement,
  { registration: Registration; qrDataUrl: string; flyerSrc: string | null }
>(function TicketCard({ registration, qrDataUrl, flyerSrc }, ref) {
  return (
    <div
      ref={ref}
      className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-xl shadow-secondary/15 sm:flex-row"
    >
      <div className="min-w-0 flex-1">
        <div
          className={`relative px-5 py-4 sm:px-7 sm:py-6 ${getTicketHeaderColor(registration.registration_type)}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-2xl"
          />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65 sm:text-xs sm:tracking-[0.25em]">
            {eventConfig.edition} · {eventConfig.name}
          </p>
          <p className="mt-1 font-display text-xl font-bold uppercase leading-tight tracking-tight sm:text-2xl">
            {eventConfig.edition} {eventConfig.fullName}
          </p>
        </div>
        <div className="h-1.5 bg-gradient-to-r from-accent via-gold to-secondary" />

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 p-5 sm:gap-8 sm:p-7">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-contrast sm:px-3 sm:text-xs">
              {getTicketTypeLabel(registration.registration_type, registration.age)}
            </span>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:mt-4 sm:text-xs">
              Asistente
            </p>
            <p className="mt-1 font-display text-base font-bold leading-tight sm:text-xl">{registration.full_name}</p>

            {registration.parish_group && (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{registration.parish_group}</p>
            )}

            <div className="mt-4 flex items-start gap-1.5 text-xs leading-snug text-muted-foreground sm:mt-5 sm:items-center sm:gap-2 sm:text-sm">
              <CalendarBlank size={15} weight="regular" className="mt-0.5 shrink-0 text-accent sm:mt-0" />
              {eventConfig.date}
            </div>
            <div className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-muted-foreground sm:items-center sm:gap-2 sm:text-sm">
              <MapPin size={15} weight="regular" className="mt-0.5 shrink-0 text-accent sm:mt-0" />
              {eventConfig.venueAddress}
            </div>

            <div className="mt-4 border-t border-dashed border-border pt-4 sm:mt-6 sm:pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                Folio de boleto
              </p>
              <p className="mt-1 inline-block rounded-lg bg-secondary-soft px-2 py-1.5 font-mono text-xs font-bold tracking-wide text-secondary sm:px-3 sm:py-2 sm:text-lg">
                {registration.ticket_id}
              </p>
            </div>
          </div>

          <div className="flex self-start flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background p-2.5 sm:self-auto sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-5 sm:border-l sm:pl-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image can't optimize it */}
            <img
              src={qrDataUrl}
              alt="Código QR del boleto"
              width={140}
              height={140}
              className="w-20 rounded-md sm:w-[140px] sm:rounded-lg"
            />
            <p className="hidden text-center text-[10px] uppercase tracking-wide text-muted-foreground sm:block">
              Presenta este código
              <br />
              el día del evento
            </p>
          </div>
        </div>

      </div>

      {flyerSrc && (
        <div className="flex h-36 shrink-0 items-center justify-center border-t border-border bg-gold-soft p-2 sm:h-auto sm:w-80 sm:border-l sm:border-t-0 sm:p-3 md:w-96">
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered into an offscreen canvas for the PNG download; next/image's lazy/srcset behavior isn't reliable there */}
          <img
            src={flyerSrc}
            alt={`Flyer oficial de la ${eventConfig.edition} ${eventConfig.name}`}
            className="h-full w-full object-contain"
          />
        </div>
      )}
    </div>
  );
});
