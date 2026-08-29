"use client";

import { useRef, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { TicketCard } from "./TicketCard";
import type { Registration } from "@/lib/registrations";

export function TicketView({
  registration,
  qrDataUrl,
  flyerSrc,
}: {
  registration: Registration;
  qrDataUrl: string;
  flyerSrc: string | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    setError(null);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `boleto-${registration.ticket_id}.png`;
      link.click();
    } catch {
      setError("No se pudo generar la imagen. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <TicketCard ref={cardRef} registration={registration} qrDataUrl={qrDataUrl} flyerSrc={flyerSrc} />

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-contrast shadow-lg shadow-accent/20 transition-transform active:scale-[0.98] disabled:opacity-60 sm:mt-6 sm:w-auto sm:px-7 sm:py-3.5 sm:text-base"
      >
        <DownloadSimple size={18} weight="bold" />
        {downloading ? "Generando..." : "Descargar boleto"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
