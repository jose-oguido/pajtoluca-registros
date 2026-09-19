import type { Metadata } from "next";
import { ProgramContent } from "@/components/programa/ProgramContent";
import { eventConfig } from "@/lib/event-config";

export const metadata: Metadata = {
  title: `Programa · ${eventConfig.edition} ${eventConfig.name}`,
  robots: { index: false, follow: false },
};

export default function ProgramaPage() {
  return <ProgramContent />;
}
