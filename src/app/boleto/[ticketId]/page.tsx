import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { getRegistrationByTicketId } from "@/lib/registrations";
import { generateQrDataUrl } from "@/lib/qrcode";
import { TicketView } from "@/components/boleto/TicketView";
import { eventConfig } from "@/lib/event-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Tu boleto · ${eventConfig.edition} ${eventConfig.name}`,
};

export default async function BoletoPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const registration = getRegistrationByTicketId(ticketId);

  if (!registration) {
    notFound();
  }

  const qrDataUrl = await generateQrDataUrl(registration.ticket_id);

  return (
    <main className="relative flex-1 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
      />
      <div className="h-[3px] bg-gradient-to-r from-accent via-gold to-secondary" />

      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} weight="regular" />
          Volver al inicio
        </Link>

        <div className="mt-8 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <SealCheck size={36} weight="fill" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            ¡Registro exitoso!
          </h1>
          <p className="mt-3 max-w-[46ch] text-muted-foreground">
            Guarda o descarga tu boleto, te lo pedirán el día del evento.
            <br />
            <span className="font-semibold text-foreground">
              ¡Nos vemos el {eventConfig.date}!
            </span>
          </p>
        </div>

        <div className="mt-10">
          <TicketView registration={registration} qrDataUrl={qrDataUrl} />
        </div>
      </div>
    </main>
  );
}
