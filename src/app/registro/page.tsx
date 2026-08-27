import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { RegistrationForm } from "@/components/registro/RegistrationForm";
import { eventConfig } from "@/lib/event-config";
import { getParishesGroupedForForm } from "@/lib/directory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Regístrate · ${eventConfig.edition} ${eventConfig.name}`,
};

export default function RegistroPage() {
  const parishGroups = getParishesGroupedForForm();

  return (
    <main className="flex-1">
      <div className="h-[3px] bg-gradient-to-r from-accent via-gold to-secondary" />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} weight="regular" />
          Volver al inicio
        </Link>

        <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Registro {eventConfig.edition} {eventConfig.name}
        </h1>
        <p className="mt-3 max-w-[55ch] text-muted-foreground">
          Completa tus datos para apartar tu lugar. Toma menos de dos minutos.
        </p>

        <div className="mt-10">
          <RegistrationForm parishGroups={parishGroups} />
        </div>
      </div>
    </main>
  );
}
