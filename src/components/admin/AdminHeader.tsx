import { LogoutButton } from "./LogoutButton";
import { AdminTabs } from "./AdminTabs";
import { eventConfig } from "@/lib/event-config";

export function AdminHeader() {
  return (
    <div className="mb-5 sm:mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">
            Panel de organizadores
          </h1>
          <p className="text-sm text-muted-foreground">
            {eventConfig.edition} {eventConfig.name} · {eventConfig.organizer}
          </p>
        </div>
        <LogoutButton />
      </div>
      <div className="mt-6">
        <AdminTabs />
      </div>
    </div>
  );
}
