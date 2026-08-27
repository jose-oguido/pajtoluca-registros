import Link from "next/link";
import { CaretLeft, CaretRight, DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { Registration } from "@/lib/registrations";

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
    <div className="rounded-[20px] border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">Registrados</h3>
          <p className="text-sm text-muted-foreground">{total} en total</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form className="relative" action="/admin/dashboard">
            <MagnifyingGlass
              size={16}
              weight="regular"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Buscar por nombre, teléfono o grupo"
              className="w-full rounded-[12px] border border-border bg-surface py-2.5 pl-9 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent sm:w-72 sm:text-sm"
            />
          </form>
          <a
            href="/api/admin/export"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-surface-muted"
          >
            <DownloadSimple size={16} weight="regular" />
            Exportar CSV
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2.5 pr-4 font-medium">Folio</th>
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
                <td className="py-3 pr-4 tabular-nums text-muted-foreground">#{row.id}</td>
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
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
