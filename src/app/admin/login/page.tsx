import type { Metadata } from "next";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/admin/LoginForm";
import { LoginVisual } from "@/components/admin/LoginVisual";
import { eventConfig } from "@/lib/event-config";
import { publicFileExists } from "@/lib/assets";

const FLYER_PATH = "flyer/jaj-oficial.png";

export const metadata: Metadata = {
  title: `Acceso organizadores · ${eventConfig.name}`,
};

export default function AdminLoginPage() {
  const hasFlyer = publicFileExists(FLYER_PATH);

  return (
    <main className="grid min-h-[100dvh] flex-1 md:grid-cols-2">
      <LoginVisual flyerSrc={hasFlyer ? `/${FLYER_PATH}` : null} />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold text-accent-contrast shadow-lg shadow-accent/25">
            <LockKey size={22} weight="fill" />
          </span>

          <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-tight">
            Acceso organizadores
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {eventConfig.edition} {eventConfig.name} · {eventConfig.organizer}
          </p>

          <div className="mt-8 rounded-[20px] border border-border bg-surface p-7 shadow-xl shadow-secondary/5">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
