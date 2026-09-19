import type { Metadata } from "next";
import { CoordinatorScanner } from "@/components/equipo/CoordinatorScanner";
import { CoordinatorUnlockForm } from "@/components/equipo/CoordinatorUnlockForm";
import { hasCoordinatorScannerSession } from "@/lib/coordinator-scanner-access";
import { eventConfig } from "@/lib/event-config";

export const metadata: Metadata = {
  title: `Lector del equipo · ${eventConfig.name}`,
};

export const dynamic = "force-dynamic";

export default async function CoordinatorScannerPage() {
  const hasAccess = await hasCoordinatorScannerSession();
  return hasAccess ? <CoordinatorScanner /> : <CoordinatorUnlockForm />;
}
