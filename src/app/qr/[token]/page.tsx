import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProgramContent } from "@/components/programa/ProgramContent";
import { getCurrentAdmin } from "@/lib/auth";
import { eventConfig } from "@/lib/event-config";
import { getRegistrationByTicketId, getRegistrationForBadgeQrToken } from "@/lib/registrations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Programa · ${eventConfig.edition} ${eventConfig.name}`,
  robots: { index: false, follow: false },
};

export default async function BadgeQrPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const registration = getRegistrationForBadgeQrToken(token) ?? getRegistrationByTicketId(token);

  if (registration && await getCurrentAdmin()) {
    redirect(`/admin/dashboard?q=${encodeURIComponent(registration.ticket_id)}`);
  }

  return <ProgramContent />;
}
