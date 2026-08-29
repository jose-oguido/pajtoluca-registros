import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import db from "./db";
import {
  isStaffRegistrationType,
  STAFF_AREA_LABELS,
  STAFF_REGISTRATION_TYPES,
  type StaffRegistrationType,
} from "./registration-types";

type StaffCodeRow = {
  registration_type: StaffRegistrationType;
  code_hash: string;
  is_active: number;
};

function hashCode(code: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(code, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

function codeMatches(code: string, stored: string): boolean {
  const [salt, expectedKey] = stored.split(":");
  if (!salt || !expectedKey) return false;

  const actualKey = scryptSync(code, salt, 64).toString("hex");
  const expected = Buffer.from(expectedKey, "hex");
  const actual = Buffer.from(actualKey, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function resolveStaffRegistrationType(code: string): StaffRegistrationType | null {
  if (!code) return null;

  const rows = db
    .prepare(
      `SELECT registration_type, code_hash, is_active FROM staff_access_codes WHERE is_active = 1`
    )
    .all() as StaffCodeRow[];

  for (const row of rows) {
    if (codeMatches(code, row.code_hash)) return row.registration_type;
  }
  return null;
}

export function getStaffAccessCodeStatus(): {
  type: StaffRegistrationType;
  label: string;
  configured: boolean;
}[] {
  const configured = new Set(
    (
      db
        .prepare(`SELECT registration_type FROM staff_access_codes WHERE is_active = 1`)
        .all() as { registration_type: StaffRegistrationType }[]
    ).map((row) => row.registration_type)
  );

  return STAFF_REGISTRATION_TYPES.map((type) => ({
    type,
    label: STAFF_AREA_LABELS[type],
    configured: configured.has(type),
  }));
}

export function setStaffAccessCode(type: StaffRegistrationType, code: string): void {
  if (!isStaffRegistrationType(type)) {
    throw new Error("Tipo de registro de staff no válido.");
  }
  db.prepare(
    `
    INSERT INTO staff_access_codes (registration_type, code_hash, is_active, updated_at)
    VALUES (?, ?, 1, datetime('now'))
    ON CONFLICT(registration_type) DO UPDATE SET
      code_hash = excluded.code_hash,
      is_active = 1,
      updated_at = datetime('now')
    `
  ).run(type, hashCode(code));
}
