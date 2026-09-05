import { randomUUID } from "crypto";
import db from "./db";
import { eventConfig } from "./event-config";

export type Registration = {
  id: number;
  ticket_id: string;
  full_name: string;
  age: number;
  phone: string;
  email: string | null;
  belongs_to_group: number;
  parish_id: string | null;
  parish_group: string | null;
  decanato: string | null;
  zona_pastoral: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  discovery_reason: string | null;
  notes: string | null;
  registration_type: string;
  created_at: string;
};

export type NewRegistration = {
  full_name: string;
  age: number;
  phone: string;
  email?: string | null;
  belongs_to_group: boolean;
  parish_id?: string | null;
  parish_group?: string | null;
  decanato?: string | null;
  zona_pastoral?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  discovery_reason?: string | null;
  notes?: string | null;
  registration_type?: string;
};

const ATTENDEE_ONLY = `WHERE registration_type = 'attendee'`;

const AGE_CATEGORY_CASE = `
  CASE
    WHEN age <= 12 THEN 'Niños'
    WHEN age <= 17 THEN 'Adolescentes'
    WHEN age <= 29 THEN 'Jóvenes'
    ELSE 'Adultos'
  END
`;

const NO_GROUP_LABEL = "Sin grupo";
export const COORDINATOR_REPORT_INTERVAL = 20;

function generateTicketId(): string {
  // Unique and unguessable: not sequential, so a ticket can't be inferred
  // from another one. Format: JAJ-XII-XXXXXXXX.
  const random = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${eventConfig.name}-${eventConfig.edition}-${random}`;
}

export function createRegistration(data: NewRegistration): { id: number; ticketId: string } {
  const stmt = db.prepare(`
    INSERT INTO registrations
      (ticket_id, full_name, age, phone, email, belongs_to_group, parish_id, parish_group, decanato, zona_pastoral, emergency_contact_name, emergency_contact_phone, discovery_reason, notes, registration_type)
    VALUES
      (@ticket_id, @full_name, @age, @phone, @email, @belongs_to_group, @parish_id, @parish_group, @decanato, @zona_pastoral, @emergency_contact_name, @emergency_contact_phone, @discovery_reason, @notes, @registration_type)
  `);

  // Collision odds are astronomically low, but retry defensively since the
  // UNIQUE index would otherwise reject the insert outright.
  for (let attempt = 0; attempt < 5; attempt++) {
    const ticketId = generateTicketId();
    try {
      const result = stmt.run({
        ticket_id: ticketId,
        full_name: data.full_name,
        age: data.age,
        phone: data.phone,
        email: data.email ?? null,
        belongs_to_group: data.belongs_to_group ? 1 : 0,
        parish_id: data.parish_id ?? null,
        parish_group: data.parish_group ?? null,
        decanato: data.decanato ?? null,
        zona_pastoral: data.zona_pastoral ?? null,
        emergency_contact_name: data.emergency_contact_name ?? null,
        emergency_contact_phone: data.emergency_contact_phone ?? null,
        discovery_reason: data.discovery_reason ?? null,
        notes: data.notes ?? null,
        registration_type: data.registration_type ?? "attendee",
      });
      return { id: Number(result.lastInsertRowid), ticketId };
    } catch (error) {
      const isUniqueViolation =
        error instanceof Error && error.message.includes("UNIQUE constraint failed");
      if (!isUniqueViolation || attempt === 4) throw error;
    }
  }
  throw new Error("No se pudo generar un folio único para el boleto.");
}

export function getRegistrationByTicketId(ticketId: string): Registration | undefined {
  return db.prepare(`SELECT * FROM registrations WHERE ticket_id = ?`).get(ticketId) as
    | Registration
    | undefined;
}

export function getTotalCount(): number {
  const row = db.prepare(`SELECT COUNT(*) as count FROM registrations ${ATTENDEE_ONLY}`).get() as {
    count: number;
  };
  return row.count;
}

export function getTodayCount(): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) as count FROM registrations ${ATTENDEE_ONLY} AND date(created_at) = date('now')`
    )
    .get() as { count: number };
  return row.count;
}

export function getAverageAge(): number {
  const row = db.prepare(`SELECT AVG(age) as avg FROM registrations ${ATTENDEE_ONLY}`).get() as {
    avg: number | null;
  };
  return row.avg ? Math.round(row.avg * 10) / 10 : 0;
}

export function getTopGroup(): { group: string; count: number } | null {
  const row = db
    .prepare(
      `SELECT parish_group as "group", COUNT(*) as count FROM registrations ${ATTENDEE_ONLY} AND belongs_to_group = 1 GROUP BY parish_group ORDER BY count DESC LIMIT 1`
    )
    .get() as { group: string; count: number } | undefined;
  return row ?? null;
}

export function getTimeline(days = 14): { date: string; count: number }[] {
  const rows = db
    .prepare(
      `
      SELECT date(created_at) as date, COUNT(*) as count
      FROM registrations
      ${ATTENDEE_ONLY} AND created_at >= datetime('now', ?)
      GROUP BY date(created_at)
      ORDER BY date ASC
      `
    )
    .all(`-${days} days`) as { date: string; count: number }[];

  const byDate = new Map(rows.map((r) => [r.date, r.count]));
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return result;
}

export function getGroupBreakdown(): { group: string; count: number }[] {
  return db
    .prepare(
      `SELECT COALESCE(parish_group, '${NO_GROUP_LABEL}') as "group", COUNT(*) as count FROM registrations ${ATTENDEE_ONLY} GROUP BY "group" ORDER BY count DESC`
    )
    .all() as { group: string; count: number }[];
}

export function getDecanatoBreakdown(): { decanato: string; count: number }[] {
  return db
    .prepare(
      `SELECT COALESCE(decanato, '${NO_GROUP_LABEL}') as decanato, COUNT(*) as count FROM registrations ${ATTENDEE_ONLY} GROUP BY decanato ORDER BY count DESC`
    )
    .all() as { decanato: string; count: number }[];
}

export function getAgeCategoryBreakdown(): { category: string; count: number }[] {
  return db
    .prepare(
      `SELECT ${AGE_CATEGORY_CASE} as category, COUNT(*) as count FROM registrations ${ATTENDEE_ONLY} GROUP BY category ORDER BY count DESC`
    )
    .all() as { category: string; count: number }[];
}

export type DiscoveryReasonResponse = Pick<
  Registration,
  "id" | "full_name" | "discovery_reason" | "created_at"
>;

export function getDiscoveryReasonResponses(limit = 100): {
  total: number;
  responses: DiscoveryReasonResponse[];
} {
  const totalRow = db
    .prepare(
      `SELECT COUNT(*) as count FROM registrations WHERE NULLIF(TRIM(discovery_reason), '') IS NOT NULL`
    )
    .get() as { count: number };

  const responses = db
    .prepare(
      `
      SELECT id, full_name, discovery_reason, created_at
      FROM registrations
      WHERE NULLIF(TRIM(discovery_reason), '') IS NOT NULL
      ORDER BY created_at DESC
      LIMIT ?
      `
    )
    .all(limit) as DiscoveryReasonResponse[];

  return { total: totalRow.count, responses };
}

export function getRegistrationTypeBreakdown(): { type: string; count: number }[] {
  // Sacerdotes aren't part of the "staff / puestos" concept this powers —
  // they're admin-added one at a time and shown via their own count instead.
  return db
    .prepare(
      `SELECT registration_type as type, COUNT(*) as count FROM registrations WHERE registration_type NOT IN ('attendee', 'sacerdote') GROUP BY registration_type ORDER BY count DESC`
    )
    .all() as { type: string; count: number }[];
}

export function getSacerdoteCount(): number {
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM registrations WHERE registration_type = 'sacerdote'`)
    .get() as { count: number };
  return row.count;
}

export function listRegistrations(opts: { search?: string; limit?: number; offset?: number }): {
  rows: Registration[];
  total: number;
} {
  const { search = "", limit = 25, offset = 0 } = opts;
  const like = `%${search.trim()}%`;

  const whereClause = search.trim()
    ? `WHERE ticket_id LIKE @like OR full_name LIKE @like OR phone LIKE @like OR IFNULL(parish_group, '') LIKE @like OR IFNULL(decanato, '') LIKE @like OR IFNULL(email, '') LIKE @like`
    : "";

  const rows = db
    .prepare(
      `SELECT * FROM registrations ${whereClause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`
    )
    .all({ like, limit, offset }) as Registration[];

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM registrations ${whereClause}`)
    .get({ like }) as { count: number };

  return { rows, total: totalRow.count };
}

export function getAllRegistrationsForExport(): Registration[] {
  return db.prepare(`SELECT * FROM registrations ORDER BY created_at DESC`).all() as Registration[];
}

export function getDecanatoRegistrationCount(decanatoName: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM registrations WHERE decanato = ?`)
    .get(decanatoName) as { count: number };
  return row.count;
}

export function claimCoordinatorReportBatch(decanatoId: string, batchNumber: number): boolean {
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO coordinator_report_batches (decanato_id, batch_number) VALUES (?, ?)`
    )
    .run(decanatoId, batchNumber);
  return result.changes === 1;
}

export function markCoordinatorReportBatchSent(decanatoId: string, batchNumber: number): void {
  db.prepare(
    `UPDATE coordinator_report_batches SET sent_at = datetime('now') WHERE decanato_id = ? AND batch_number = ?`
  ).run(decanatoId, batchNumber);
}

export function releaseCoordinatorReportBatch(decanatoId: string, batchNumber: number): void {
  db.prepare(
    `DELETE FROM coordinator_report_batches WHERE decanato_id = ? AND batch_number = ? AND sent_at IS NULL`
  ).run(decanatoId, batchNumber);
}

export type DecanatoSendSummary = {
  id: string;
  name: string;
  coordinatorName: string | null;
  coordinatorEmail: string | null;
  count: number;
};

export function getDecanatoSendSummary(): DecanatoSendSummary[] {
  return db
    .prepare(
      `
      SELECT
        d.id as id,
        d.name as name,
        d.coordinator_name as coordinatorName,
        d.coordinator_email as coordinatorEmail,
        (SELECT COUNT(*) FROM registrations r WHERE r.decanato = d.name) as count
      FROM decanatos d
      ORDER BY d.sort_order ASC
      `
    )
    .all() as DecanatoSendSummary[];
}
