import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "./db";

export const SESSION_COOKIE_NAME = "jaj_admin_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 8;

export type AdminUser = {
  id: number;
  username: string;
};

type AdminUserRow = AdminUser & {
  password_hash: string;
};

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

function passwordMatches(password: string, stored: string): boolean {
  const [salt, expectedKey] = stored.split(":");
  if (!salt || !expectedKey) return false;

  const actualKey = scryptSync(password, salt, 64).toString("hex");
  const expected = Buffer.from(expectedKey, "hex");
  const actual = Buffer.from(actualKey, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function getAdminByUsername(username: string): AdminUserRow | undefined {
  return db
    .prepare(`SELECT id, username, password_hash FROM admin_users WHERE username = ?`)
    .get(username) as AdminUserRow | undefined;
}

export function hasAdminUser(): boolean {
  const row = db.prepare(`SELECT COUNT(*) as count FROM admin_users`).get() as { count: number };
  return row.count > 0;
}

export function createFirstAdmin(username: string, password: string): AdminUser {
  const create = db.transaction(() => {
    if (hasAdminUser()) {
      throw new Error("La cuenta de administrador ya fue configurada.");
    }

    const result = db
      .prepare(`INSERT INTO admin_users (username, password_hash) VALUES (?, ?)`)
      .run(username, hashPassword(password));
    return { id: Number(result.lastInsertRowid), username };
  });

  return create();
}

export function authenticateAdmin(username: string, password: string): AdminUser | null {
  const user = getAdminByUsername(username);
  if (!user || !passwordMatches(password, user.password_hash)) return null;
  return { id: user.id, username: user.username };
}

export function updateAdminAccount(
  adminId: number,
  data: { username: string; currentPassword: string; newPassword?: string }
): { ok: true; username: string } | { ok: false; error: string } {
  const user = db
    .prepare(`SELECT id, username, password_hash FROM admin_users WHERE id = ?`)
    .get(adminId) as AdminUserRow | undefined;

  if (!user || !passwordMatches(data.currentPassword, user.password_hash)) {
    return { ok: false, error: "La contraseña actual no es correcta." };
  }

  try {
    if (data.newPassword) {
      db.prepare(`UPDATE admin_users SET username = ?, password_hash = ? WHERE id = ?`).run(
        data.username,
        hashPassword(data.newPassword),
        adminId
      );
    } else {
      db.prepare(`UPDATE admin_users SET username = ? WHERE id = ?`).run(data.username, adminId);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return { ok: false, error: "Ese usuario ya está en uso." };
    }
    throw error;
  }

  return { ok: true, username: data.username };
}

export function createSession(adminUserId: number): string {
  db.prepare(`DELETE FROM admin_sessions WHERE julianday(expires_at) <= julianday('now')`).run();

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_COOKIE_MAX_AGE * 1000).toISOString();
  db.prepare(
    `INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at) VALUES (?, ?, ?)`
  ).run(adminUserId, hashValue(token), expiresAt);
  return token;
}

export function deleteSession(token: string | undefined): void {
  if (!token) return;
  db.prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`).run(hashValue(token));
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  db.prepare(`DELETE FROM admin_sessions WHERE julianday(expires_at) <= julianday('now')`).run();
  const user = db
    .prepare(
      `
      SELECT admin_users.id, admin_users.username
      FROM admin_sessions
      JOIN admin_users ON admin_users.id = admin_sessions.admin_user_id
      WHERE admin_sessions.token_hash = ?
        AND julianday(admin_sessions.expires_at) > julianday('now')
      `
    )
    .get(hashValue(token)) as AdminUser | undefined;

  return user ?? null;
}

export async function requireAdminSession(): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
