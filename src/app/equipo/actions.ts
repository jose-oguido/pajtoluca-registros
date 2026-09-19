"use server";

import { redirect } from "next/navigation";
import {
  COORDINATOR_SCANNER_COOKIE_NAME,
  COORDINATOR_SCANNER_SESSION_MAX_AGE,
  createCoordinatorScannerSession,
  hasCoordinatorScannerSession,
  validateCoordinatorScannerCode,
} from "@/lib/coordinator-scanner-access";
import { getRegistrationByTicketId, getRegistrationForBadgeQrToken } from "@/lib/registrations";
import type { CoordinatorAccessState, ScannerLookupState } from "./state";
import { cookies } from "next/headers";

function extractQrValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) ?? "");
  } catch {
    return trimmed.replace(/^\/?qr\//i, "");
  }
}

export async function unlockCoordinatorScannerAction(
  _prevState: CoordinatorAccessState,
  formData: FormData
): Promise<CoordinatorAccessState> {
  const code = String(formData.get("access_code") ?? "").trim();
  if (!code) return { status: "error", message: "Escribe el código de acceso del equipo." };

  if (!validateCoordinatorScannerCode(code)) {
    return { status: "error", message: "El código no es válido. Verifica con la coordinación." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COORDINATOR_SCANNER_COOKIE_NAME, createCoordinatorScannerSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COORDINATOR_SCANNER_SESSION_MAX_AGE,
    path: "/",
  });
  redirect("/equipo");
}

export async function lookupCoordinatorRegistrationAction(
  _prevState: ScannerLookupState,
  formData: FormData
): Promise<ScannerLookupState> {
  if (!(await hasCoordinatorScannerSession())) {
    return { status: "error", message: "Tu acceso venció. Ingresa el código nuevamente." };
  }

  const value = extractQrValue(String(formData.get("qr_value") ?? ""));
  if (!value) return { status: "error", message: "Escanea un QR o escribe un folio para buscar." };

  const registration = getRegistrationForBadgeQrToken(value) ?? getRegistrationByTicketId(value);
  if (!registration) {
    return { status: "error", message: "No encontramos un registro con ese QR o folio." };
  }

  return {
    status: "success",
    registration: {
      ticketId: registration.ticket_id,
      fullName: registration.full_name,
      age: registration.age,
      registrationType: registration.registration_type,
      parish: registration.parish_group,
      decanato: registration.decanato,
      phone: registration.phone,
      emergencyContactName: registration.emergency_contact_name,
      emergencyContactPhone: registration.emergency_contact_phone,
    },
  };
}

export async function lockCoordinatorScannerAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COORDINATOR_SCANNER_COOKIE_NAME);
  redirect("/equipo");
}
