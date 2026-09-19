import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { eventConfig } from "@/lib/event-config";

export const metadata: Metadata = {
  title: `Datos actualizados · ${eventConfig.name}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DatosActualizadosPage() {
  return (
    <main className="flex-1">
      <div className="h-[3px] bg-gradient-to-r from-accent via-gold to-secondary" />
      <div className="mx-auto flex min-h-[calc(100dvh-3px)] max-w-2xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full rounded-[20px] bg-surface p-5 text-center shadow-lg shadow-secondary/10 sm:p-8">
          <CheckCircle
            size={48}
            weight="fill"
            className="mx-auto text-secondary"
            aria-hidden="true"
          />
          <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            ¡Gracias!
          </h1>
          <p className="mx-auto mt-2 max-w-[42ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tus datos se actualizaron correctamente. Tu registro ya está completo.
          </p>
        </section>
      </div>
    </main>
  );
}
