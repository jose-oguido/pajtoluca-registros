import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { SEED_GROUPS } from "./directory-seed";

declare global {
  var __jajDb: Database.Database | undefined;
}

const dbPath = process.env.DATABASE_PATH
  ? process.env.DATABASE_PATH
  : path.join(process.cwd(), "data", "jaj.db");

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// timeout: Next.js can spawn several build workers that open this same
// file at once. On a brand-new database (no volume yet, e.g. a fresh
// Railway deploy) the very first writes race and throw SQLITE_BUSY; this
// tells better-sqlite3 to retry for a bit instead of failing immediately.
const db = global.__jajDb ?? new Database(dbPath, { timeout: 10000 });

if (process.env.NODE_ENV !== "production") {
  global.__jajDb = db;
}

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

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
    discovery_reason TEXT,
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

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

  CREATE TABLE IF NOT EXISTS staff_access_codes (
    registration_type TEXT PRIMARY KEY,
    code_hash TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coordinator_report_batches (
    decanato_id TEXT NOT NULL REFERENCES decanatos(id) ON DELETE CASCADE,
    batch_number INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    sent_at TEXT,
    PRIMARY KEY (decanato_id, batch_number)
  );
`);

// Migration: older databases created before ticket_id existed. Safe to run
// on every startup since it checks the column first.
const registrationColumns = db.prepare(`PRAGMA table_info(registrations)`).all() as {
  name: string;
}[];
if (!registrationColumns.some((col) => col.name === "ticket_id")) {
  db.exec(`ALTER TABLE registrations ADD COLUMN ticket_id TEXT`);
}
if (!registrationColumns.some((col) => col.name === "registration_type")) {
  db.exec(`ALTER TABLE registrations ADD COLUMN registration_type TEXT NOT NULL DEFAULT 'attendee'`);
}
if (!registrationColumns.some((col) => col.name === "discovery_reason")) {
  db.exec(`ALTER TABLE registrations ADD COLUMN discovery_reason TEXT`);
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
