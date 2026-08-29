"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";

export function RegistrationSearch({ search }: { search: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useState(search);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function navigate(nextSearch: string) {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("q", nextSearch.trim());
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => navigate(nextValue), 250);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    navigate(value);
  }

  return (
    <form className="relative" onSubmit={handleSubmit} role="search">
      <MagnifyingGlass
        size={16}
        weight="regular"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Buscar por folio, nombre, teléfono o grupo"
        aria-label="Buscar registros"
        className="w-full rounded-[12px] border border-border bg-surface py-2.5 pl-9 pr-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 sm:w-72 sm:text-sm"
      />
    </form>
  );
}
