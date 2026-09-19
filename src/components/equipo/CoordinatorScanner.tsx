"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Camera, MagnifyingGlass, QrCode, SignOut, UserCircle, WarningCircle } from "@phosphor-icons/react";
import { lockCoordinatorScannerAction, lookupCoordinatorRegistrationAction } from "@/app/equipo/actions";
import { initialScannerLookupState } from "@/app/equipo/state";

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

type BarcodeDetectorWindow = Window & { BarcodeDetector?: BarcodeDetectorConstructor };

const typeLabels: Record<string, string> = {
  attendee: "Participante",
  coordinador: "Coordinación",
  staff: "Staff",
  sacerdote: "Sacerdote",
};

export function CoordinatorScanner() {
  const [state, formAction, pending] = useActionState(
    lookupCoordinatorRegistrationAction,
    initialScannerLookupState
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const scanningRef = useRef(false);
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "active" | "error">("idle");
  const [cameraMessage, setCameraMessage] = useState("");

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    scanningRef.current = false;
    setCameraState((current) => (current === "active" || current === "starting" ? "idle" : current));
  }, []);

  const searchValue = useCallback(
    (value: string) => {
      stopCamera();
      const formData = new FormData();
      formData.set("qr_value", value);
      formAction(formData);
    },
    [formAction, stopCamera]
  );

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraMessage("Este navegador no permite abrir la cámara. Escribe el folio manualmente.");
      return;
    }
    const Detector = (window as BarcodeDetectorWindow).BarcodeDetector;
    if (!Detector) {
      setCameraState("error");
      setCameraMessage("Tu navegador todavía no reconoce códigos QR desde la cámara. Usa el campo manual.");
      return;
    }

    stopCamera();
    setCameraState("starting");
    setCameraMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const detector = new Detector({ formats: ["qr_code"] });
      setCameraState("active");
      scanTimerRef.current = window.setInterval(async () => {
        if (scanningRef.current || !videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const rawValue = codes[0]?.rawValue?.trim();
          if (!rawValue) return;
          scanningRef.current = true;
          stopCamera();
          searchValue(rawValue);
        } catch {
          // A frame can be unavailable while the browser switches cameras; keep scanning.
        }
      }, 350);
    } catch {
      stopCamera();
      setCameraState("error");
      setCameraMessage("No pudimos abrir la cámara. Revisa el permiso y vuelve a intentarlo, o busca con el folio.");
    }
  }, [searchValue, stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">Lector del equipo</h1>
            <p className="mt-1 text-sm text-muted-foreground">Escanea el QR del gafete o escribe su folio para consultar el registro.</p>
          </div>
          <form action={lockCoordinatorScannerAction}>
            <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-surface-muted">
              <SignOut size={18} /> Cerrar lector
            </button>
          </form>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-[20px] bg-surface p-5 shadow-lg shadow-secondary/5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary"><Camera size={21} weight="fill" /></span>
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-tight">Escanear gafete</h2>
                <p className="mt-1 text-sm text-muted-foreground">Permite el uso de la cámara y apunta al código QR.</p>
              </div>
            </div>
            <div className="relative mt-5 aspect-square overflow-hidden rounded-[14px] bg-secondary-dark">
              <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${cameraState === "active" ? "block" : "hidden"}`} />
              {cameraState !== "active" ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-secondary-contrast">
                  <QrCode size={48} weight="duotone" />
                  <p className="mt-3 text-sm font-semibold">{cameraState === "starting" ? "Abriendo cámara..." : "Listo para escanear"}</p>
                </div>
              ) : <span className="pointer-events-none absolute inset-5 rounded-[12px] border-2 border-gold" />}
            </div>
            <button
              type="button"
              onClick={cameraState === "active" ? stopCamera : startCamera}
              disabled={cameraState === "starting"}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-secondary-contrast transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Camera size={18} weight="fill" />
              {cameraState === "active" ? "Detener cámara" : cameraState === "starting" ? "Abriendo..." : "Usar cámara"}
            </button>
            {cameraMessage ? <p className="mt-3 flex gap-1.5 text-sm leading-5 text-red-600"><WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />{cameraMessage}</p> : null}
          </section>

          <div className="space-y-6">
            <section className="rounded-[20px] bg-surface p-5 shadow-lg shadow-secondary/5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><MagnifyingGlass size={21} weight="bold" /></span>
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-tight">Búsqueda manual</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Pega la liga del QR o escribe el folio del registro.</p>
                </div>
              </div>
              <form action={formAction} className="mt-5 flex flex-col gap-3 sm:flex-row" noValidate>
                <label className="sr-only" htmlFor="qr-value">QR o folio</label>
                <input id="qr-value" name="qr_value" type="text" placeholder="Folio o enlace QR" className="min-w-0 flex-1 rounded-[12px] border border-border bg-surface px-3.5 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40" />
                <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98] disabled:opacity-60">
                  {pending ? "Buscando..." : "Consultar"}
                </button>
              </form>
              {state.status === "error" && state.message ? <p className="mt-3 flex gap-1.5 text-sm text-red-600" role="alert"><WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />{state.message}</p> : null}
            </section>

            <section aria-live="polite" className="min-h-64 rounded-[20px] bg-surface-muted p-5 sm:p-6">
              {state.status !== "success" || !state.registration ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-center text-muted-foreground">
                  <UserCircle size={44} weight="duotone" />
                  <p className="mt-3 text-sm">El registro aparecerá aquí después de escanear.</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Registro encontrado</p>
                  <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">{state.registration.fullName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{state.registration.ticketId}</p>
                  <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Edad</dt><dd className="mt-1 font-semibold">{state.registration.age} años</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</dt><dd className="mt-1 font-semibold">{typeLabels[state.registration.registrationType] ?? state.registration.registrationType}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parroquia</dt><dd className="mt-1 font-semibold">{state.registration.parish || "Sin registrar"}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Decanato</dt><dd className="mt-1 font-semibold">{state.registration.decanato || "Sin asignar"}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teléfono</dt><dd className="mt-1 font-semibold">{state.registration.phone}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emergencia</dt><dd className="mt-1 font-semibold">{state.registration.emergencyContactName ? `${state.registration.emergencyContactName}${state.registration.emergencyContactPhone ? ` · ${state.registration.emergencyContactPhone}` : ""}` : "Sin registrar"}</dd></div>
                  </dl>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
