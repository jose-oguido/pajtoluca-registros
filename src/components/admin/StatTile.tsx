import type { Icon } from "@phosphor-icons/react";

export function StatTile({
  icon: IconComponent,
  label,
  value,
  hint,
}: {
  icon: Icon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconComponent size={18} weight="regular" />
        <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
