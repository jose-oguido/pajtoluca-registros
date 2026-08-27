"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Bird, Cross, Sparkle } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/event-config";

// Fixed (not random) so server and client render match exactly.
const STARS = [
  { top: "8%", left: "14%", size: 3, delay: 0 },
  { top: "16%", left: "78%", size: 2, delay: 0.4 },
  { top: "22%", left: "42%", size: 2, delay: 0.8 },
  { top: "30%", left: "88%", size: 3, delay: 1.2 },
  { top: "12%", left: "58%", size: 2, delay: 1.6 },
  { top: "40%", left: "10%", size: 2, delay: 0.2 },
  { top: "48%", left: "92%", size: 2, delay: 0.9 },
  { top: "6%", left: "32%", size: 2, delay: 1.4 },
  { top: "60%", left: "20%", size: 2, delay: 0.6 },
  { top: "64%", left: "80%", size: 3, delay: 1.0 },
  { top: "36%", left: "68%", size: 2, delay: 0.3 },
  { top: "20%", left: "22%", size: 2, delay: 1.1 },
];

export function HeroVisual({ flyerSrc }: { flyerSrc: string | null }) {
  const reduce = useReducedMotion();

  if (flyerSrc) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] border border-border bg-gradient-to-b from-secondary to-secondary-dark">
        <Image
          src={flyerSrc}
          alt={`Flyer oficial de la ${eventConfig.edition} ${eventConfig.name}`}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] border border-border bg-gradient-to-b from-secondary to-secondary-dark">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: 0.75,
            animation: reduce ? undefined : `pulse-star 3.5s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      <div className="absolute left-1/2 top-[30%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 blur-3xl" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gold"
        >
          <Sparkle size={26} weight="fill" />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-5 text-white"
        >
          <span className={reduce ? "" : "animate-float-slow"}>
            <Bird size={30} weight="light" className="rotate-[-18deg] opacity-90" />
          </span>
          <Cross size={72} weight="thin" />
          <span className={reduce ? "" : "animate-float-slow"} style={{ animationDelay: "1s" }}>
            <Bird size={30} weight="light" className="rotate-[18deg] scale-x-[-1] opacity-90" />
          </span>
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60"
        >
          {eventConfig.edition} · {eventConfig.name}
        </motion.p>
      </div>
    </div>
  );
}
