import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParishUpdateForm } from "@/components/registro/ParishUpdateForm";
import { eventConfig } from "@/lib/event-config";
import { getParishesGroupedForForm } from "@/lib/directory";
import { getRegistrationForParishUpdate } from "@/lib/registrations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Actualiza tu registro · ${eventConfig.name}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ActualizarDatosPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const registration = getRegistrationForParishUpdate(token);
  if (!registration) notFound();

  const firstName = registration.full_name.trim().split(/\s+/).find(Boolean) ?? "";
  const parishGroups = getParishesGroupedForForm();

  return (
    <main className="flex-1">
      <div className="h-[3px] bg-gradient-to-r from-accent via-gold to-secondary" />
      <div className="mx-auto flex min-h-[calc(100dvh-3px)] max-w-2xl items-center px-4 py-8 sm:px-6 lg:max-w-[52rem] lg:px-8">
        <section className="w-full rounded-[20px] bg-surface p-5 shadow-lg shadow-secondary/10 sm:p-8">
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            Actualiza tu registro
          </h1>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:text-base lg:max-w-none lg:whitespace-nowrap">
            {firstName ? `Hola, ${firstName}. ` : ""}Necesitamos un dato más para completar tu registro de la {eventConfig.edition} {eventConfig.name}.
          </p>

          <div className="mt-7 border-t border-border pt-6">
            <ParishUpdateForm token={token} parishGroups={parishGroups} />
          </div>
        </section>
      </div>
    </main>
  );
}
