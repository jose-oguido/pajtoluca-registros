import Link from "next/link";
import { CaretLeft, CaretRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { getTicketTypeLabel } from "@/lib/registration-types";
import type { Registration } from "@/lib/registrations";
import { RegistrationSearch } from "./RegistrationSearch";

const DATE_FORMAT = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
}

export function RegistrationsTable({
  rows,
  total,
  page,
  pageSize,
  search,
}: {
  rows: Registration[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/dashboard?${qs}` : "/admin/dashboard";
  }

  return (
    <div className="rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">Registrados</h3>
          <p className="text-sm text-muted-foreground">{total} en total</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <RegistrationSearch key={search} search={search} />
          <a
            href="/api/admin/export"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-surface-muted"
          >
            <DownloadSimple size={16} weight="regular" />
            Exportar CSV
          </a>
        </div>
      </div>

      <div className="mt-6 hidden max-h-[264px] overflow-auto sm:block">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2.5 pr-4 font-medium">Folio</th>
              <th className="py-2.5 pr-4 font-medium">Tipo</th>
              <th className="py-2.5 pr-4 font-medium">Nombre</th>
              <th className="py-2.5 pr-4 font-medium">Edad</th>
              <th className="py-2.5 pr-4 font-medium">Grupo</th>
              <th className="py-2.5 pr-4 font-medium">Decanato</th>
              <th className="py-2.5 pr-4 font-medium">Teléfono</th>
              <th className="py-2.5 pr-4 font-medium">Correo</th>
              <th className="py-2.5 pr-4 font-medium">Registrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="py-3 pr-4 font-mono text-xs font-semibold tabular-nums text-secondary">{row.ticket_id}</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center rounded-full bg-secondary-soft px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                    {getTicketTypeLabel(row.registration_type, row.age)}
                  </span>
                </td>
                <td className="py-3 pr-4 font-medium">{row.full_name}</td>
                <td className="py-3 pr-4 tabular-nums">{row.age}</td>
                <td className="py-3 pr-4">{row.parish_group ?? "Sin grupo"}</td>
                <td className="py-3 pr-4 text-muted-foreground">{row.decanato ?? "—"}</td>
                <td className="py-3 pr-4 tabular-nums">{formatPhone(row.phone)}</td>
                <td className="py-3 pr-4 text-muted-foreground">{row.email || "—"}</td>
                <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                  {DATE_FORMAT.format(new Date(row.created_at.replace(" ", "T") + "Z"))}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-3 sm:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-[14px] bg-surface-muted p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold tabular-nums text-secondary">{row.ticket_id}</p>
                <h4 className="mt-1 truncate font-display text-base font-bold tracking-tight">{row.full_name}</h4>
              </div>
              <span className="shrink-0 rounded-full bg-secondary-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                {getTicketTypeLabel(row.registration_type, row.age)}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="font-semibold uppercase tracking-wide text-muted-foreground">Edad</dt>
                <dd className="mt-0.5 font-medium tabular-nums">{row.age} años</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-muted-foreground">Registro</dt>
                <dd className="mt-0.5 text-muted-foreground">{DATE_FORMAT.format(new Date(row.created_at.replace(" ", "T") + "Z"))}</dd>
              </div>
              <div className="col-span-2 min-w-0">
                <dt className="font-semibold uppercase tracking-wide text-muted-foreground">Contacto</dt>
                <dd className="mt-0.5 truncate">{formatPhone(row.phone)} · {row.email || "—"}</dd>
              </div>
              <div className="col-span-2 min-w-0">
                <dt className="font-semibold uppercase tracking-wide text-muted-foreground">Grupo</dt>
                <dd className="mt-0.5 truncate text-muted-foreground">{row.parish_group ?? "Sin grupo"}{row.decanato ? ` · ${row.decanato}` : ""}</dd>
              </div>
            </dl>
          </article>
        ))}
        {rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron registros.</p>}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border ${
                page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
              }`}
            >
              <CaretLeft size={16} weight="regular" />
            </Link>
            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border ${
                page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
              }`}
            >
              <CaretRight size={16} weight="regular" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
