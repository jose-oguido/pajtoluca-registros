import type { DiscoveryReasonResponse } from "@/lib/registrations";

const DATE_FORMAT = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

export function OpenResponses({
  data,
}: {
  data: { total: number; responses: DiscoveryReasonResponse[] };
}) {
  return (
    <section className="flex h-[320px] flex-col overflow-hidden rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">Respuestas abiertas</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            ¿En dónde te enteraste de la JAJ y por qué decidiste acudir?
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold tabular-nums text-accent">
          {data.total}
        </span>
      </div>

      <div
        className="mt-5 min-h-0 flex-1 divide-y divide-border overflow-y-auto pr-1"
        tabIndex={0}
        aria-label="Listado de respuestas abiertas"
      >
        {data.responses.map((response) => (
          <article key={response.id} className="py-3 first:pt-0">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold">{response.full_name}</p>
              <time className="shrink-0 text-xs text-muted-foreground">
                {DATE_FORMAT.format(new Date(response.created_at.replace(" ", "T") + "Z"))}
              </time>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {response.discovery_reason}
            </p>
          </article>
        ))}
        {data.responses.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">Aún no hay respuestas abiertas.</p>
        )}
      </div>

      {data.total > data.responses.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          Mostrando las {data.responses.length} respuestas más recientes.
        </p>
      )}
    </section>
  );
}
