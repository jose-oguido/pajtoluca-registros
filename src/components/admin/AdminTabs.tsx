"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/dashboard", label: "Métricas" },
  { href: "/admin/directorio", label: "Directorio" },
  { href: "/admin/accesos", label: "Accesos" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "shrink-0 border-b-2 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
              active
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
