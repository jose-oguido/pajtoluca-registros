export function AgeCategoryBreakdown({ data }: { data: { category: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <h3 className="font-display text-lg font-bold uppercase tracking-tight">Por categoría de edad</h3>
      <p className="text-sm text-muted-foreground">Distribución de los registrados</p>

      <div className="mt-6 grid min-h-44 flex-1 grid-cols-2 auto-rows-fr gap-4">
        {data.map((row) => (
          <div key={row.category} className="flex h-full min-h-36 flex-col justify-between rounded-[12px] bg-surface-muted p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {row.category}
              </p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums">{row.count}</p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Del total</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {Math.round((row.count / total) * 100)}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${Math.round((row.count / total) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="col-span-2 text-sm text-muted-foreground">Aún no hay registros.</p>
        )}
      </div>
    </div>
  );
}
