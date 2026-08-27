import { HandsPraying, MusicNotes, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { eventConfig } from "@/lib/event-config";
import { Reveal } from "./Reveal";

const pillars = [
  {
    icon: MusicNotes,
    title: "Alabanza en vivo",
    description: "Música y adoración que reúne a todos los grupos en un mismo canto.",
    bg: "bg-accent-soft",
    badge: "bg-accent text-accent-contrast",
  },
  {
    icon: UsersThree,
    title: "Talleres por edad",
    description: "Espacios formativos pensados para adolescentes, jóvenes y sus líderes.",
    bg: "bg-secondary-soft",
    badge: "bg-secondary text-secondary-contrast",
  },
  {
    icon: HandsPraying,
    title: "Testimonios y oración",
    description: "Historias reales que abren espacio para el encuentro personal con Cristo.",
    bg: "bg-gold-soft",
    badge: "bg-gold text-secondary-contrast",
  },
];

export function About() {
  return (
    <section id="sobre-la-jaj" className="mx-auto max-w-7xl px-6 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal className="max-w-[62ch] text-center lg:text-left">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          ¿Qué es la {eventConfig.name}?
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          La {eventConfig.fullName} es el encuentro anual que reúne a los grupos juveniles de{" "}
          {eventConfig.location} en un solo día de fe, música y comunidad. Es organizado por{" "}
          {eventConfig.organizer} junto con las parroquias participantes, con un cupo limitado a{" "}
          {eventConfig.capacity.toLocaleString("es-MX")} jóvenes.
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
