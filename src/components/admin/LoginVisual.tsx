"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Cross, LockKey, Sparkle } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/event-config";

const STARS = [
  { top: "10%", left: "18%", size: 3, delay: 0 },
  { top: "18%", left: "72%", size: 2, delay: 0.5 },
  { top: "28%", left: "40%", size: 2, delay: 1 },
  { top: "34%", left: "85%", size: 3, delay: 1.4 },
  { top: "50%", left: "12%", size: 2, delay: 0.3 },
  { top: "58%", left: "60%", size: 2, delay: 0.8 },
  { top: "66%", left: "90%", size: 2, delay: 1.2 },
  { top: "78%", left: "25%", size: 3, delay: 0.6 },
  { top: "86%", left: "70%", size: 2, delay: 1.6 },
  { top: "8%", left: "50%", size: 2, delay: 1.8 },
];

export function LoginVisual({ flyerSrc }: { flyerSrc: string | null }) {
  const reduce = useReducedMotion();

  if (flyerSrc) {
    return (
      <div className="relative hidden overflow-hidden bg-gradient-to-b from-secondary to-secondary-dark md:block">
        <Image
          src={flyerSrc}
          alt={`Flyer oficial de la ${eventConfig.edition} ${eventConfig.name}`}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-b from-secondary to-secondary-dark md:block">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: 0.7,
            animation: reduce ? undefined : `pulse-star 3.5s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-10 text-center">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-gold"
        >
          <Sparkle size={22} weight="fill" />
        </motion.span>

        <motion.span
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur"
        >
          <Cross size={30} weight="thin" />
        </motion.span>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p className="font-display text-2xl font-bold uppercase tracking-tight text-white">
            {eventConfig.edition} {eventConfig.name}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-white/60">
            <LockKey size={14} weight="regular" />
            Panel de organizadores
          </p>
        </motion.div>
      </div>
    </div>
  );
}
