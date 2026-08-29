const DAY_LABEL = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });

export function TimelineChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <h3 className="font-display text-lg font-bold uppercase tracking-tight">Registros por día</h3>
      <p className="text-sm text-muted-foreground">Últimos {data.length} días</p>

      <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2">
        {data.map((point) => {
          const heightPct = Math.max(4, Math.round((point.count / max) * 100));
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end">
                <div
                  title={`${DAY_LABEL.format(new Date(point.date + "T00:00:00"))}: ${point.count} registros`}
                  style={{ height: `${heightPct}%` }}
                  className="w-full rounded-t-md bg-accent/85 transition-[height] first:rounded-t-md"
                />
              </div>
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                {DAY_LABEL.format(new Date(point.date + "T00:00:00"))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
