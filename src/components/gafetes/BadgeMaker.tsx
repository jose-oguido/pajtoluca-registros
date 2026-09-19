"use client";

/* eslint-disable @next/next/no-img-element -- the source design uses fixed, print-ready images in exact physical dimensions. */

import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import { CaretDown, MagnifyingGlass, MapPin, Printer } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/event-config";
import styles from "./BadgeMaker.module.css";

export type BadgeRegistration = {
  ticket_id: string;
  qr_token: string;
  full_name: string;
  age: number;
  parish_id: string | null;
  parish_group: string | null;
  decanato: string | null;
  registration_type: string;
};

type Parish = {
  id: string;
  name: string;
  locality: string;
};

type Decanato = {
  id: string;
  name: string;
  parishes: Parish[];
};

type BadgeRole = {
  label: string;
  color: string;
  textColor: string;
};

const PROGRAM = [
  ["8:00", "Registro y bienvenida"],
  ["9:30", "Oración de la mañana"],
  ["10:15", "Tema: el Maestro te llama"],
  ["12:00", "Talleres por decanato"],
  ["14:00", "Comida y convivencia"],
  ["16:00", "Testimonios"],
  ["17:30", "Misa de envío"],
] as const;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");
}

function makePages<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

function splitName(fullName: string): [string, string] {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [fullName.trim(), ""];
  if (words.length === 2) return [words[0], words[1]];
  if (words.length === 3) return [words[0], words.slice(1).join(" ")];
  return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
}

function roleFor(registrationType: string): BadgeRole {
  if (registrationType === "staff") {
    return { label: "Servidor", color: "#7BA81C", textColor: "#FFFFFF" };
  }
  if (registrationType === "ministro_extraordinario") {
    return { label: "Ministro extraordinario", color: "#F2B705", textColor: "#12455F" };
  }
  if (registrationType === "sacerdote") {
    return { label: "Sacerdote", color: "#C7563B", textColor: "#FFFFFF" };
  }
  return { label: "Participante", color: "#EE7B23", textColor: "#FFFFFF" };
}

function BadgeShell({
  role,
  children,
  reverse = false,
}: {
  role: BadgeRole;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  const roleStyle = {
    "--role-color": role.color,
    "--role-text": role.textColor,
  } as CSSProperties;

  return (
    <article className={`${styles.badge} ${reverse ? styles.reverse : ""}`} style={roleStyle}>
      <div className={styles.spine} />
      <div className={styles.badgeContent}>{children}</div>
    </article>
  );
}

function BadgeFront({ registration }: { registration: BadgeRegistration }) {
  const role = roleFor(registration.registration_type);
  const [givenName, lastName] = splitName(registration.full_name);
  const hasOrigin = Boolean(registration.parish_group || registration.decanato);

  return (
    <BadgeShell role={role}>
      <div className={styles.brandStrip}>
        <img className={styles.brandLogo} src="/gafetes/arquidiocesis.png" alt="Arquidiócesis de Toluca" />
        <img className={styles.brandLockup} src="/gafetes/jaj-lockup.png" alt={`${eventConfig.edition} ${eventConfig.fullName}`} />
        <img className={styles.brandLogo} src="/gafetes/paj.png" alt="Pastoral de Adolescentes y Jóvenes" />
      </div>

      <div className={styles.frontZone}>
        <img className={styles.watermark} src="/gafetes/jesus.png" alt="" aria-hidden="true" />
        <p className={styles.greeting}>hola, soy</p>
        <h2 className={styles.givenName}>{givenName}</h2>
        {lastName && <p className={styles.lastName}>{lastName}</p>}
        <div className={styles.roleLine} />
        {hasOrigin && (
          <p className={styles.origin}>
            {registration.parish_group}
            {registration.decanato && <span>Decanato de {registration.decanato}</span>}
          </p>
        )}
      </div>

      <div className={styles.frontMeta}>
        <span>{eventConfig.dateShort} · {eventConfig.venueName}</span>
        <span className={styles.frontFolio}>{registration.ticket_id}</span>
      </div>
      <div className={`${styles.roleBand} ${role.label.length > 16 ? styles.roleBandCompact : ""}`}>
        {role.label}
      </div>
    </BadgeShell>
  );
}

function BadgeBack({ registration }: { registration: BadgeRegistration }) {
  const role = roleFor(registration.registration_type);

  return (
    <BadgeShell role={role} reverse>
      <div className={styles.backBody}>
        <img className={styles.lema} src="/gafetes/lema.png" alt="El Maestro está aquí y te busca" />
        <div className={styles.program}>
          <h2>Así va el día</h2>
          <ul>
            {PROGRAM.map(([time, activity]) => (
              <li key={time}>
                <b>{time}</b>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.backFooter}>
          <img
            className={styles.qr}
            src={`/api/qr/${encodeURIComponent(registration.qr_token)}`}
            alt={`Código QR único de ${registration.full_name}`}
          />
          <div className={styles.contactLine}>
            <p>Si me pierdo o me siento mal, avisen a</p>
            <span />
          </div>
        </div>
        <img className={styles.waves} src="/gafetes/olas.png" alt="" aria-hidden="true" />
      </div>
    </BadgeShell>
  );
}

export function BadgeMaker({ decanatos }: { decanatos: Decanato[] }) {
  const [selectedDecanatoId, setSelectedDecanatoId] = useState("");
  const [selectedParishId, setSelectedParishId] = useState("");
  const [showParishFallback, setShowParishFallback] = useState(false);
  const [parishQuery, setParishQuery] = useState("");
  const [registrations, setRegistrations] = useState<BadgeRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parishInputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const parishes = useMemo(
    () =>
      decanatos.flatMap((decanato) =>
        decanato.parishes.map((parish) => ({
          ...parish,
          decanatoId: decanato.id,
          decanatoName: decanato.name,
        }))
      ),
    [decanatos]
  );
  const selectedDecanato = decanatos.find((decanato) => decanato.id === selectedDecanatoId);
  const selectedParish = parishes.find((parish) => parish.id === selectedParishId);
  const normalizedQuery = normalize(parishQuery.trim());
  const parishMatches = normalizedQuery
    ? parishes
        .filter(
          (parish) =>
            normalize(parish.name).includes(normalizedQuery) ||
            normalize(parish.locality).includes(normalizedQuery)
        )
        .slice(0, 6)
    : [];
  const pages = useMemo(() => makePages(registrations, 4), [registrations]);
  const selectionLabel = selectedDecanato
    ? selectedDecanato.name
    : selectedParish
      ? `${selectedParish.name} · ${selectedParish.decanatoName}`
      : null;

  async function loadRegistrations(search: URLSearchParams) {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setRegistrations([]);

    try {
      const response = await fetch(`/api/gafetes?${search.toString()}`, { cache: "no-store" });
      const result = (await response.json()) as {
        registrations?: BadgeRegistration[];
        error?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "No se pudieron cargar los gafetes.");
      if (!Array.isArray(result.registrations)) throw new Error("La respuesta no contiene registros.");
      if (currentRequest !== requestId.current) return;
      setRegistrations(result.registrations);
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los gafetes.");
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }

  function resetSelection() {
    requestId.current += 1;
    setSelectedDecanatoId("");
    setSelectedParishId("");
    setRegistrations([]);
    setError(null);
    setIsLoading(false);
  }

  function handleDecanatoChange(id: string) {
    if (!id) {
      resetSelection();
      return;
    }
    setSelectedDecanatoId(id);
    setSelectedParishId("");
    setParishQuery("");
    setShowParishFallback(false);
    void loadRegistrations(new URLSearchParams({ decanato: id }));
  }

  function openParishFallback() {
    setShowParishFallback(true);
    requestAnimationFrame(() => parishInputRef.current?.focus());
  }

  function selectParish(id: string) {
    const parish = parishes.find((item) => item.id === id);
    setSelectedParishId(id);
    setSelectedDecanatoId("");
    setParishQuery(parish?.name ?? "");
    void loadRegistrations(new URLSearchParams({ parish: id }));
  }

  return (
    <section>
      <div className={styles.screenOnly}>
        <div className="mx-auto max-w-xl rounded-[20px] bg-surface p-5 shadow-lg shadow-secondary/10 sm:p-7">
          <label htmlFor="badge-decanato" className="block font-display text-lg font-bold uppercase tracking-tight">
            ¿Cuál es tu decanato?
          </label>
          <select
            id="badge-decanato"
            value={selectedDecanatoId}
            onChange={(event) => handleDecanatoChange(event.target.value)}
            className="mt-3 w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Selecciona tu decanato</option>
            {decanatos.map((decanato) => (
              <option key={decanato.id} value={decanato.id}>
                {decanato.name}
              </option>
            ))}
          </select>

          {!showParishFallback ? (
            <button
              type="button"
              onClick={openParishFallback}
              className="mt-4 inline-flex items-center gap-1.5 text-left text-sm font-semibold text-secondary underline decoration-secondary/35 underline-offset-4 transition-colors hover:text-secondary-dark"
            >
              ¿No sabes cuál es tu decanato? Busca la parroquia a la que normalmente acudes.
              <CaretDown size={16} weight="bold" aria-hidden="true" />
            </button>
          ) : (
            <div className="relative mt-5 border-t border-border pt-5">
              <label htmlFor="badge-parish" className="block text-sm font-semibold text-foreground">
                ¿A qué parroquia asistes normalmente?
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-[12px] border border-border bg-surface px-3 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
                <MagnifyingGlass size={18} weight="regular" className="shrink-0 text-muted-foreground" />
                <input
                  ref={parishInputRef}
                  id="badge-parish"
                  value={parishQuery}
                  onChange={(event) => {
                    setParishQuery(event.target.value);
                    resetSelection();
                  }}
                  placeholder="Escribe el nombre de la parroquia"
                  className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/75"
                  autoComplete="off"
                />
              </div>

              {parishMatches.length > 0 && !selectedParish && (
                <div className="mt-2 max-h-64 overflow-y-auto rounded-[12px] bg-surface py-1 shadow-xl shadow-secondary/15">
                  {parishMatches.map((parish) => (
                    <button
                      key={parish.id}
                      type="button"
                      onClick={() => selectParish(parish.id)}
                      className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted"
                    >
                      <MapPin size={16} weight="regular" className="mt-0.5 shrink-0 text-accent" />
                      <span>
                        <span className="block font-semibold text-foreground">{parish.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {parish.locality} · {parish.decanatoName}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {normalizedQuery && parishMatches.length === 0 && !selectedParish && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  No encontramos esa parroquia. Prueba con otra palabra.
                </p>
              )}
            </div>
          )}
        </div>

        {(selectionLabel || isLoading || error) && (
          <div className="mx-auto mt-8 max-w-5xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-tight">Gafetes</h2>
                <p aria-live="polite" className="mt-1 text-sm text-muted-foreground">
                  {isLoading
                    ? "Preparando los gafetes…"
                    : selectionLabel
                      ? `${registrations.length} gafete${registrations.length === 1 ? "" : "s"} de ${selectionLabel}`
                      : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={isLoading || registrations.length === 0}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1B75A8] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-secondary/20 transition-transform hover:bg-[#155f8a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer size={18} weight="bold" />
                Imprimir gafetes
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              La impresión incluye frente y reverso. Usa tamaño real (100 %) y voltea las hojas por
              el lado largo.
            </p>

            {error && (
              <p role="alert" className="mt-4 rounded-[12px] bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
                {error}
              </p>
            )}

            {!isLoading && !error && registrations.length === 0 && selectionLabel && (
              <p className="mt-4 rounded-[12px] bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
                Aún no hay registros para esta selección.
              </p>
            )}

            {registrations.length > 0 && (
              <div className={styles.previewGrid}>
                {registrations.slice(0, 4).map((registration) => (
                  <BadgeFront key={registration.ticket_id} registration={registration} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.printPages}>
        {pages.flatMap((page, pageIndex) => {
          const backOrder = [1, 0, 3, 2];
          return [
            <div key={`front-${pageIndex}`} className={styles.printPage}>
              {page.map((registration) => (
                <BadgeFront key={registration.ticket_id} registration={registration} />
              ))}
            </div>,
            <div key={`back-${pageIndex}`} className={styles.printPage}>
              {backOrder.map((index) =>
                page[index] ? (
                  <BadgeBack key={page[index].ticket_id} registration={page[index]} />
                ) : (
                  <div key={`blank-${index}`} className={styles.printBlank} aria-hidden="true" />
                )
              )}
            </div>,
          ];
        })}
      </div>
    </section>
  );
}
