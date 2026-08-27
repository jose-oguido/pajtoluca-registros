import Image from "next/image";
import Link from "next/link";
import { eventConfig } from "@/lib/event-config";
import { publicFileExists } from "@/lib/assets";

// Deja los archivos en public/logos/ con estos nombres exactos y aparecerán
// aquí automáticamente (sin tocar este archivo). Mientras un logo no exista,
// se muestra un marcador punteado con sus iniciales.
const logos = [
  { file: "paj-toluca.png", alt: "PAJ Toluca", initials: "PAJ" },
  { file: "arquidiocesis-toluca.png", alt: "Arquidiócesis de Toluca", initials: "ARQ" },
  { file: "ruta-2031-2033.png", alt: "Ruta 2031-2033", initials: "RUT" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="h-[3px] bg-gradient-to-r from-accent via-gold to-secondary" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:px-6 lg:px-8">
        <Link href="/" className="justify-self-start">
          <span className="font-display text-xl font-extrabold tracking-tight">
            {eventConfig.edition} {eventConfig.name}
          </span>
        </Link>

        <p className="hidden justify-self-center text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:block">
          {eventConfig.organizer}
        </p>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          {logos.map((logo) =>
            publicFileExists(`logos/${logo.file}`) ? (
              <span
                key={logo.file}
                className="relative h-7 w-7 shrink-0 sm:h-9 sm:w-9"
              >
                <Image
                  src={`/logos/${logo.file}`}
                  alt={logo.alt}
                  fill
                  sizes="36px"
                  className="rounded-full object-contain"
                />
              </span>
            ) : (
              <span
                key={logo.file}
                title={`Logo: ${logo.alt}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-center text-[8px] font-semibold uppercase leading-tight text-muted-foreground/70 sm:h-9 sm:w-9 sm:text-[9px]"
              >
                {logo.initials}
              </span>
            )
          )}
        </div>
      </div>
    </header>
  );
}
