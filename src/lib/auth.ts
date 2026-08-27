// Sesión de administrador firmada con HMAC (Web Crypto), compatible con
// Edge Middleware y con el runtime de Node usado por los server actions.
export const SESSION_COOKIE_NAME = "jaj_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta SESSION_SECRET en las variables de entorno.");
  }
  return secret;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${exp}`;
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bufToHex(signature)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signatureHex] = token.split(".");
  if (!payload || !signatureHex) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  try {
    const secret = getSecret();
    const key = await importKey(secret);
    const expectedSignature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const expectedHex = bufToHex(expectedSignature);
    if (expectedHex.length !== signatureHex.length) return false;

    let diff = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      diff |= expectedHex.charCodeAt(i) ^ signatureHex.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    throw new Error("Faltan ADMIN_USERNAME o ADMIN_PASSWORD en las variables de entorno.");
  }
  return username === expectedUser && password === expectedPass;
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
