import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import db from "./db";

export const COORDINATOR_SCANNER_COOKIE_NAME = "jaj_coordinator_scanner";
export const COORDINATOR_SCANNER_SESSION_MAX_AGE = 60 * 60 * 8;

const CODE_SETTING = "coordinator_scanner_code_hash";
const SESSION_SECRET_SETTING = "coordinator_scanner_session_secret";
const SESSION_VERSION_SETTING = "coordinator_scanner_session_version";

function getSetting(key: string): string | undefined {
  return (
    db.prepare(`SELECT value FROM app_settings WHERE key = ?`).get(key) as { value: string } | undefined
  )?.value;
}

function saveSetting(key: string, value: string): void {
  db.prepare(
    `
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `
  ).run(key, value);
}

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

function getSessionSecret(): string {
  const existing = getSetting(SESSION_SECRET_SETTING);
  if (existing) return existing;

  const generated = randomBytes(32).toString("base64url");
  db.prepare(
    `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`
  ).run(SESSION_SECRET_SETTING, generated);

  const saved = getSetting(SESSION_SECRET_SETTING);
  if (!saved) throw new Error("No se pudo preparar el acceso del equipo.");
  return saved;
}

function signSession(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function getCoordinatorScannerCodeStatus(): { configured: boolean } {
  return { configured: Boolean(getSetting(CODE_SETTING)) };
}

export function setCoordinatorScannerCode(code: string): void {
  const save = db.transaction(() => {
    saveSetting(CODE_SETTING, hashCode(code));
    // Changing the code invalidates every currently-open scanner session.
    saveSetting(SESSION_VERSION_SETTING, randomBytes(16).toString("base64url"));
  });
  save();
}

export function validateCoordinatorScannerCode(code: string): boolean {
  const stored = getSetting(CODE_SETTING);
  return Boolean(stored && codeMatches(code, stored));
}

export function createCoordinatorScannerSession(): string {
  const version = getSetting(SESSION_VERSION_SETTING);
  if (!version) throw new Error("Primero configura el código de acceso del equipo.");

  const expiresAt = Math.floor(Date.now() / 1000) + COORDINATOR_SCANNER_SESSION_MAX_AGE;
  const payload = `${version}.${expiresAt}`;
  return `${payload}.${signSession(payload)}`;
}

export async function hasCoordinatorScannerSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COORDINATOR_SCANNER_COOKIE_NAME)?.value;
  if (!token) return false;

  const [version, rawExpiresAt, signature, ...extra] = token.split(".");
  if (
    extra.length > 0 ||
    !version ||
    !rawExpiresAt ||
    !signature ||
    !/^\d{10,}$/.test(rawExpiresAt) ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature)
  ) {
    return false;
  }

  const expiresAt = Number(rawExpiresAt);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;
  if (version !== getSetting(SESSION_VERSION_SETTING)) return false;

  const payload = `${version}.${rawExpiresAt}`;
  const expected = Buffer.from(signSession(payload));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
