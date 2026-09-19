import { CalendarBlank, Clock, MapPin } from "@phosphor-icons/react/dist/ssr";
import { eventConfig } from "@/lib/event-config";
import { eventProgram } from "@/lib/event-program";

export function ProgramContent() {
  return (
    <main className="flex-1">
      <div className="h-[3px] bg-gradient-to-r from-accent via-gold to-secondary" />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.12em] text-accent">
            {eventConfig.edition} {eventConfig.name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Programa de la jornada
          </h1>
          <div className="mt-5 flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-5">
            <span className="inline-flex items-center gap-1.5"><CalendarBlank size={17} />{eventConfig.date}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={17} />{eventConfig.venueName}</span>
          </div>
        </header>

        <section className="mt-9 rounded-[20px] bg-surface p-5 shadow-lg shadow-secondary/10 sm:p-8" aria-label="Actividades del día">
          <ol className="divide-y divide-border">
            {eventProgram.map(([time, activity]) => (
              <li key={time} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span className="inline-flex w-16 shrink-0 items-center gap-1 font-display text-base font-bold tabular-nums text-secondary sm:w-20 sm:text-lg">
                  <Clock size={17} weight="bold" aria-hidden="true" />{time}
                </span>
                <span className="text-sm font-medium text-foreground sm:text-base">{activity}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
