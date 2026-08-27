"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarBlank, Clock, MapPin, Users } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/event-config";
import { HeroVisual } from "./HeroVisual";

const pillClass =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:text-sm";

export function Hero({ flyerSrc }: { flyerSrc: string | null }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/3 top-40 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-8 lg:py-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center lg:col-span-7 lg:text-left"
        >
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            <span className={pillClass}>
              <CalendarBlank size={14} weight="regular" className="shrink-0 text-accent" />
              <span className="sm:hidden">{eventConfig.dateShort}</span>
              <span className="hidden sm:inline">{eventConfig.date}</span>
            </span>
            <span className={pillClass}>
              <Clock size={14} weight="regular" className="shrink-0 text-secondary" />
              {eventConfig.scheduleText}
            </span>
            <span className={pillClass}>
              <MapPin size={14} weight="regular" className="shrink-0 text-gold" />
              {eventConfig.venueName}
            </span>
            <span className={pillClass}>
              <Users size={14} weight="regular" className="shrink-0 text-accent" />
              {eventConfig.capacity.toLocaleString("es-MX")} lugares
            </span>
          </div>

          <h1 className="mt-5 text-balance font-display text-5xl font-bold uppercase leading-[1.05] tracking-tight lg:text-6xl">
            Un día entero de{" "}
            <span className="text-accent">fe, música</span> y comunidad.
          </h1>

          <p className="mx-auto mt-3 max-w-[38ch] text-xl font-semibold uppercase leading-snug text-muted-foreground lg:mx-0 lg:text-xl">
            {eventConfig.edition} {eventConfig.fullName}
          </p>

          {/* Shown only below lg, right where it should sit ahead of the buttons.
              The lg+ column has its own instance further down so neither layout
              forces the other's height (avoids grid row-span height mismatches). */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative mx-auto mt-6 w-full max-w-[260px] lg:hidden"
          >
            <HeroVisual flyerSrc={flyerSrc} />
          </motion.div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast shadow-lg shadow-accent/25 transition-transform active:scale-[0.98] lg:px-7 lg:py-3.5 lg:text-base"
            >
              Regístrate
              <ArrowRight size={16} weight="bold" />
            </Link>
            <a
              href="#sobre-la-jaj"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-surface-muted lg:px-7 lg:py-3.5 lg:text-base"
            >
              Conoce más
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative hidden lg:col-span-5 lg:block"
        >
          <HeroVisual flyerSrc={flyerSrc} />
        </motion.div>
      </div>
    </section>
  );
}
