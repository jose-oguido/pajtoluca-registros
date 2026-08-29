import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { StaffRegistrationForm } from "@/components/registro/StaffRegistrationForm";
import { eventConfig } from "@/lib/event-config";
import { getParishesGroupedForForm } from "@/lib/directory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Registro de staff · ${eventConfig.edition} ${eventConfig.name}`,
};

export default function RegistroStaffPage() {
  const parishGroups = getParishesGroupedForForm();

  return (
    <main className="flex-1">
      <div className="h-[3px] bg-gradient-to-r from-accent via-gold to-secondary" />
      <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 sm:py-6 lg:min-h-[calc(100dvh-3px)] lg:flex lg:flex-col lg:justify-center lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} weight="regular" />
          Volver al inicio
        </Link>

        <h1 className="mt-3 font-display text-xl font-bold uppercase tracking-tight md:text-2xl">
          Registro de staff {eventConfig.edition} {eventConfig.name}
        </h1>
        <p className="mt-1 max-w-[55ch] text-sm text-muted-foreground">
          Este registro es solo para staff y ministros extraordinarios. Necesitas el código de
          acceso de tu equipo.
        </p>

        <div className="mt-6">
          <StaffRegistrationForm parishGroups={parishGroups} />
        </div>
      </div>
    </main>
  );
}
