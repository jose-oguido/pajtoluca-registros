import { Compass, HandsPraying, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { eventConfig } from "@/lib/event-config";
import { Reveal } from "./Reveal";

const pillars = [
  {
    icon: HandsPraying,
    title: "Encuentro con Jesucristo",
    description: "Espacios de escucha, discernimiento, conversión y misión para descubrir la vocación.",
    bg: "bg-accent-soft",
    badge: "bg-accent text-accent-contrast",
  },
  {
    icon: Compass,
    title: "Rumbo a la Ruta 2031-2033",
    description: "Preparación hacia los 500 años de las apariciones de la Virgen de Guadalupe y los 2000 años de la Redención.",
    bg: "bg-secondary-soft",
    badge: "bg-secondary text-secondary-contrast",
  },
  {
    icon: UsersThree,
    title: "Protagonistas de transformación",
    description: "Jóvenes que renuevan la esperanza y construyen una civilización del amor.",
    bg: "bg-gold-soft",
    badge: "bg-gold text-secondary-contrast",
  },
];

export function About() {
  return (
    <section id="sobre-la-jaj" className="mx-auto max-w-7xl px-6 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal className="max-w-[62ch] text-center lg:text-left">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Objetivo de la {eventConfig.name}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          Fortalecer la fe, identidad y compromiso de los jóvenes de la Arquidiócesis de Toluca
          mediante un encuentro vivo con Jesucristo, preparando el corazón y la misión rumbo a los
          grandes acontecimientos de la Ruta 2031-2033.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-3">
        {pillars.map((pillar, i) => (
          <Reveal key={pillar.title} delay={i * 0.08}>
            <div
              className={`h-full rounded-[20px] p-6 transition-transform duration-300 hover:-translate-y-1 ${pillar.bg}`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${pillar.badge}`}
              >
                <pillar.icon size={22} weight="regular" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold uppercase sm:text-xl">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70 sm:text-base">
                {pillar.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
