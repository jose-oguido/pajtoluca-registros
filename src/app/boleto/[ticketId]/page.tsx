import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { getRegistrationByTicketId } from "@/lib/registrations";
import { generateQrDataUrl } from "@/lib/qrcode";
import { TicketView } from "@/components/boleto/TicketView";
import { eventConfig } from "@/lib/event-config";
import { publicFileExists } from "@/lib/assets";

const FLYER_PATH = "flyer/jaj-oficial.png";

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
  const hasFlyer = publicFileExists(FLYER_PATH);

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

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12 lg:flex lg:min-h-[calc(100dvh-3px)] lg:flex-col lg:justify-center lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground lg:absolute lg:left-8 lg:top-16"
        >
          <ArrowLeft size={16} weight="regular" />
          Volver al inicio
        </Link>

        <div className="lg:flex lg:flex-col lg:items-center">
          <div className="mt-6 flex flex-col items-center text-center lg:mt-0">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent sm:h-16 sm:w-16">
              <SealCheck size={30} weight="fill" className="sm:hidden" />
              <SealCheck size={36} weight="fill" className="hidden sm:block" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight sm:mt-5 sm:text-3xl md:text-4xl">
              ¡Registro exitoso!
            </h1>
            <p className="mt-2 max-w-[46ch] text-sm text-muted-foreground sm:mt-3 sm:text-base">
              Guarda o descarga tu boleto.
              <br />
              <span className="font-semibold text-foreground">
                ¡Nos vemos el {eventConfig.date}!
              </span>
            </p>
          </div>

          <div className="mt-6 w-full sm:mt-10">
            <TicketView
              registration={registration}
              qrDataUrl={qrDataUrl}
              flyerSrc={hasFlyer ? `/${FLYER_PATH}` : null}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
