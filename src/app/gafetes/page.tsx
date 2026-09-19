import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eventConfig } from "@/lib/event-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Gafetes · ${eventConfig.name}`,
  description: `Consulta e imprime tus gafetes para la ${eventConfig.edition} ${eventConfig.fullName}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function GafetesPage() {
  redirect("/gafetes.html");
}
