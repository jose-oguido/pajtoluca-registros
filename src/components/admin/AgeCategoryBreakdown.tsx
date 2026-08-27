export function AgeCategoryBreakdown({ data }: { data: { category: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="rounded-[20px] border border-border bg-surface p-6">
      <h3 className="font-display text-lg font-bold uppercase tracking-tight">Por categoría de edad</h3>
      <p className="text-sm text-muted-foreground">Distribución de los registrados</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((row) => (
          <div key={row.category} className="rounded-[12px] bg-surface-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {row.category}
            </p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{row.count}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round((row.count / total) * 100)}%
            </p>
          </div>
        ))}
        {data.length === 0 && (
          <p className="col-span-2 text-sm text-muted-foreground">Aún no hay registros.</p>
        )}
      </div>
    </div>
  );
}
