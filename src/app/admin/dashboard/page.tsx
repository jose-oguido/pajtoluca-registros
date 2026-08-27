import type { Metadata } from "next";
import { ChartLineUp, Trophy, UserPlus, Users } from "@phosphor-icons/react/dist/ssr";
import {
  getAgeCategoryBreakdown,
  getAverageAge,
  getDecanatoBreakdown,
  getDecanatoSendSummary,
  getGroupBreakdown,
  getTimeline,
  getTodayCount,
  getTopGroup,
  getTotalCount,
  listRegistrations,
} from "@/lib/registrations";
import { StatTile } from "@/components/admin/StatTile";
import { TimelineChart } from "@/components/admin/TimelineChart";
import { GroupBreakdown } from "@/components/admin/GroupBreakdown";
import { DecanatoBreakdown } from "@/components/admin/DecanatoBreakdown";
import { AgeCategoryBreakdown } from "@/components/admin/AgeCategoryBreakdown";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { CoordinatorSendList } from "@/components/admin/CoordinatorSendList";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { eventConfig } from "@/lib/event-config";

export const metadata: Metadata = {
  title: `Panel de organizadores · ${eventConfig.name}`,
};

const PAGE_SIZE = 25;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const total = getTotalCount();
  const todayCount = getTodayCount();
  const avgAge = getAverageAge();
  const topGroup = getTopGroup();
  const timeline = getTimeline(14);
  const groupBreakdown = getGroupBreakdown();
  const decanatoBreakdown = getDecanatoBreakdown();
  const ageBreakdown = getAgeCategoryBreakdown();
  const coordinatorSummary = getDecanatoSendSummary();
  const { rows, total: searchTotal } = listRegistrations({
    search,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const remaining = Math.max(0, eventConfig.capacity - total);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminHeader />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={Users} label="Total registrados" value={total.toLocaleString("es-MX")} hint={`${remaining.toLocaleString("es-MX")} lugares disponibles`} />
          <StatTile icon={UserPlus} label="Registrados hoy" value={todayCount.toLocaleString("es-MX")} />
          <StatTile icon={ChartLineUp} label="Edad promedio" value={avgAge ? avgAge.toString() : "—"} hint="años" />
          <StatTile
            icon={Trophy}
            label="Grupo con más registros"
            value={topGroup ? topGroup.count.toString() : "—"}
            hint={topGroup?.group ?? "Aún sin datos"}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TimelineChart data={timeline} />
          </div>
          <AgeCategoryBreakdown data={ageBreakdown} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GroupBreakdown data={groupBreakdown} />
          <DecanatoBreakdown data={decanatoBreakdown} />
        </div>

        <div className="mt-6">
          <CoordinatorSendList decanatos={coordinatorSummary} />
        </div>

        <div className="mt-6">
          <RegistrationsTable
            rows={rows}
            total={searchTotal}
            page={page}
            pageSize={PAGE_SIZE}
            search={search}
          />
        </div>
      </div>
    </main>
  );
}
