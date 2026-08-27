import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { eventConfig } from "@/lib/event-config";
import { Reveal } from "./Reveal";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-6 lg:px-8">
      <Reveal className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-accent-soft via-accent-soft to-gold-soft px-6 py-10 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-12 lg:px-14 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl"
        />
        <div className="relative max-w-[42ch]">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Tu lugar en la {eventConfig.name} te está esperando.
          </h2>
          <p className="mt-2 text-sm text-foreground/70 sm:mt-3 sm:text-base">
            Cierra tu registro antes del {eventConfig.registrationDeadline}.
          </p>
        </div>
        <Link
          href="/registro"
          className="relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast shadow-lg shadow-accent/25 transition-transform active:scale-[0.98] lg:px-7 lg:py-3.5 lg:text-base"
        >
          Regístrate
          <ArrowRight size={16} weight="bold" />
        </Link>
      </Reveal>
    </section>
  );
}
