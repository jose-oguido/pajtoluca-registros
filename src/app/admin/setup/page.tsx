import type { Metadata } from "next";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { InitialAdminForm } from "@/components/admin/InitialAdminForm";
import { LoginVisual } from "@/components/admin/LoginVisual";
import { hasAdminUser } from "@/lib/auth";
import { eventConfig } from "@/lib/event-config";
import { publicFileExists } from "@/lib/assets";

const FLYER_PATH = "flyer/jaj-oficial.png";

export const metadata: Metadata = {
  title: `Configura el acceso · ${eventConfig.name}`,
};

export const dynamic = "force-dynamic";

export default function AdminSetupPage() {
  if (hasAdminUser()) {
    redirect("/admin/login");
  }
  const hasFlyer = publicFileExists(FLYER_PATH);

  return (
    <main className="grid min-h-[100dvh] flex-1 md:grid-cols-2">
      <LoginVisual flyerSrc={hasFlyer ? `/${FLYER_PATH}` : null} />
      <div className="flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-gold text-accent-contrast shadow-lg shadow-accent/25">
            <LockKey size={22} weight="fill" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-tight">
            Crea el acceso inicial
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta pantalla aparece una sola vez. Después podrás administrar los accesos desde el panel.
          </p>
          <div className="mt-8 rounded-[20px] border border-border bg-surface p-5 shadow-xl shadow-secondary/10 sm:p-7">
            <InitialAdminForm />
          </div>
        </div>
      </div>
    </main>
  );
}
