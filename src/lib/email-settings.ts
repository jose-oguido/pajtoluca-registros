import db from "./db";

const RESEND_API_KEY = "resend_api_key";
const RESEND_FROM_EMAIL = "resend_from_email";
const DEFAULT_FROM_EMAIL = "JAJ Pajtoluca <onboarding@resend.dev>";

function getSetting(key: string): string | null {
  const row = db.prepare(`SELECT value FROM app_settings WHERE key = ?`).get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

function setSetting(key: string, value: string): void {
  db.prepare(
    `
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `
  ).run(key, value);
}

export function getEmailSettings(): { apiKey: string | null; fromEmail: string } {
  return {
    apiKey: getSetting(RESEND_API_KEY),
    fromEmail: getSetting(RESEND_FROM_EMAIL) ?? DEFAULT_FROM_EMAIL,
  };
}

export function getEmailSettingsStatus(): { configured: boolean; fromEmail: string } {
  const { apiKey, fromEmail } = getEmailSettings();
  return { configured: Boolean(apiKey), fromEmail };
}

export function saveEmailSettings(data: { apiKey?: string; fromEmail?: string }): void {
  if (data.apiKey) setSetting(RESEND_API_KEY, data.apiKey);
  if (data.fromEmail) setSetting(RESEND_FROM_EMAIL, data.fromEmail);
}
