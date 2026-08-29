import type { Metadata } from "next";
import { AccessSettings } from "@/components/admin/AccessSettings";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdminSession } from "@/lib/auth";
import { getEmailSettingsStatus } from "@/lib/email-settings";
import { eventConfig } from "@/lib/event-config";
import { getStaffAccessCodeStatus } from "@/lib/staff-access";

export const metadata: Metadata = {
  title: `Accesos · ${eventConfig.name}`,
};

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const admin = await requireAdminSession();
  const staffCodes = getStaffAccessCodeStatus();
  const emailSettings = getEmailSettingsStatus();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <AdminHeader />
        <p className="max-w-[65ch] text-sm text-muted-foreground">
          Configura la cuenta de organizadores, los accesos del registro staff y el correo de los coordinadores. Estos datos viven en la base de datos local y no en <code>.env.local</code>.
        </p>
        <div className="mt-6">
          <AccessSettings username={admin.username} staffCodes={staffCodes} emailSettings={emailSettings} />
        </div>
      </div>
    </main>
  );
}
