"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";

type ParishOption = { id: string; name: string; locality: string };
type ParishGroup = { decanato: string; zonaPastoral: string; options: ParishOption[] };

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function ParishCombobox({
  groups,
  name,
  id,
  defaultValue,
  hasError,
}: {
  groups: ParishGroup[];
  name: string;
  id?: string;
  defaultValue?: string;
  hasError?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Flat, alphabetical list. Decanato boundaries are an internal reporting
  // detail (used for the automatic mapping), not something attendees need
  // to browse by, so the picker just shows every parish in one list.
  const allOptions = useMemo(
    () =>
      groups
        .flatMap((group) => group.options)
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [groups]
  );

  const selected = allOptions.find((o) => o.id === selectedId);

  const filteredOptions = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return allOptions;
    return allOptions.filter(
      (option) => normalize(option.name).includes(q) || normalize(option.locality).includes(q)
    );
  }, [allOptions, query]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  function openDropdown() {
    setQuery("");
    setOpen(true);
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "flex w-full items-center justify-between gap-2 rounded-[12px] border bg-surface px-4 py-3 text-left text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          hasError
            ? "border-red-400 focus:ring-red-300"
            : "border-border focus:ring-accent/40 focus:border-accent",
        ].join(" ")}
      >
        <span className={selected ? "" : "text-muted-foreground/70"}>
          {selected ? `${selected.name} (${selected.locality})` : "Selecciona tu parroquia"}
        </span>
        <CaretDown
          size={16}
          weight="regular"
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[12px] border border-border bg-surface shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <MagnifyingGlass size={16} weight="regular" className="shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar parroquia o localidad"
              className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-sm"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filteredOptions.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No se encontró ninguna parroquia.
              </p>
            )}
            {filteredOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  setSelectedId(option.id);
                  setOpen(false);
                }}
                className={[
                  "block w-full px-4 py-2 text-left text-sm transition-colors",
                  option.id === selectedId
                    ? "bg-accent-soft text-accent"
                    : "text-foreground hover:bg-surface-muted",
                ].join(" ")}
              >
                {option.name} ({option.locality})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
