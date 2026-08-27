import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { SEED_GROUPS } from "./directory-seed";

declare global {
  var __jajDb: Database.Database | undefined;
}

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = global.__jajDb ?? new Database(path.join(dataDir, "jaj.db"));

if (process.env.NODE_ENV !== "production") {
  global.__jajDb = db;
}

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    belongs_to_group INTEGER NOT NULL DEFAULT 0,
    parish_id TEXT,
    parish_group TEXT,
    decanato TEXT,
    zona_pastoral TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
  CREATE INDEX IF NOT EXISTS idx_registrations_parish_group ON registrations(parish_group);
  CREATE INDEX IF NOT EXISTS idx_registrations_decanato ON registrations(decanato);

  CREATE TABLE IF NOT EXISTS decanatos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    zona_pastoral TEXT NOT NULL,
    coordinator_name TEXT,
    coordinator_email TEXT,
    coordinator_phone TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS parishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    locality TEXT NOT NULL,
    decanato_id TEXT NOT NULL REFERENCES decanatos(id),
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_parishes_decanato_id ON parishes(decanato_id);
`);

// Migration: older databases created before ticket_id existed. Safe to run
// on every startup since it checks the column first.
const registrationColumns = db.prepare(`PRAGMA table_info(registrations)`).all() as {
  name: string;
}[];
if (!registrationColumns.some((col) => col.name === "ticket_id")) {
  db.exec(`ALTER TABLE registrations ADD COLUMN ticket_id TEXT`);
}

db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_ticket_id ON registrations(ticket_id)`);

const decanatoCount = (db.prepare(`SELECT COUNT(*) as count FROM decanatos`).get() as { count: number })
  .count;

if (decanatoCount === 0) {
  // OR IGNORE: Next.js can evaluate this module from several worker
  // processes concurrently during the build, so more than one process may
  // race to seed at once. Ignoring conflicts keeps that race harmless.
  const insertDecanato = db.prepare(`
    INSERT OR IGNORE INTO decanatos (id, name, zona_pastoral, sort_order)
    VALUES (@id, @name, @zonaPastoral, @sortOrder)
  `);
  const insertParish = db.prepare(`
    INSERT OR IGNORE INTO parishes (id, name, locality, decanato_id, sort_order)
    VALUES (@id, @name, @locality, @decanatoId, @sortOrder)
  `);

  const seedAll = db.transaction(() => {
    let parishCounter = 0;
    SEED_GROUPS.forEach((group, groupIndex) => {
      insertDecanato.run({
        id: group.id,
        name: group.decanato,
        zonaPastoral: group.zonaPastoral,
        sortOrder: groupIndex,
      });
      group.parishes.forEach(([name, locality], parishIndex) => {
        parishCounter += 1;
        insertParish.run({
          id: `p${String(parishCounter).padStart(3, "0")}`,
          name,
          locality,
          decanatoId: group.id,
          sortOrder: parishIndex,
        });
      });
    });
  });

  seedAll();
}

export default db;
