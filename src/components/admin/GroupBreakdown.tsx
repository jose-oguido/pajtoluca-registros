export function GroupBreakdown({ data }: { data: { group: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-[20px] border border-border bg-surface p-6">
      <h3 className="font-display text-lg font-bold uppercase tracking-tight">
        Registros por parroquia / grupo
      </h3>
      <p className="text-sm text-muted-foreground">{total} registros en total</p>

      <div className="mt-6 space-y-4">
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no hay registros.</p>
        )}
        {data.map((row) => (
          <div key={row.group}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{row.group}</span>
              <span className="tabular-nums text-muted-foreground">{row.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(3, Math.round((row.count / max) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
