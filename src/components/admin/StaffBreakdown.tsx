import { STAFF_AREA_LABELS, type StaffRegistrationType } from "@/lib/registration-types";

export function StaffBreakdown({ data }: { data: { type: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <h3 className="font-display text-lg font-bold uppercase tracking-tight">Staff y puestos</h3>
      <p className="text-sm text-muted-foreground">{total} registros de apoyo en total</p>

      <div className="mt-6 space-y-4">
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no hay registros de staff.</p>
        )}
        {data.map((row) => (
          <div key={row.type}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">
                {STAFF_AREA_LABELS[row.type as StaffRegistrationType] ?? row.type}
              </span>
              <span className="tabular-nums text-muted-foreground">{row.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${Math.max(3, Math.round((row.count / max) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
