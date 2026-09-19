"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { sendAutomaticDecanatoReportIfDue, sendDecanatoReport } from "@/lib/mailer";
import { getDecanatoById } from "@/lib/directory";
import {
  assignRegistrationDecanato,
  createParishUpdateToken,
  createRegistration,
} from "@/lib/registrations";
import type { ParishUpdateLinkState, SendReportState } from "./state";

export async function sendReportAction(
  decanatoId: string,
  _prevState: SendReportState,
  _formData: FormData
): Promise<SendReportState> {
  await requireAdminSession();
  try {
    const result = await sendDecanatoReport(decanatoId);
    return {
      status: "success",
      message: `Se enviaron ${result.count} registros a ${result.email}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo enviar el correo.",
    };
  }
}

// Sacerdotes don't self-register through a public form: an organizer adds
// them directly here, so there's no extra access code to hand out and
// potentially leak for a category with so few, well-known people.
export async function addSacerdoteAction(
  _prevState: SendReportState,
  formData: FormData
): Promise<SendReportState> {
  await requireAdminSession();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const rawAge = String(formData.get("age") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const rawDecanatoId = String(formData.get("decanato_id") ?? "").trim();
  const phone = rawPhone.replace(/\D/g, "");

  if (fullName.length < 3) {
    return { status: "error", message: "Escribe el nombre completo del sacerdote." };
  }
  const age = Number(rawAge);
  if (!rawAge || !Number.isInteger(age) || age < 18 || age > 99) {
    return { status: "error", message: "Ingresa una edad válida." };
  }
  if (phone.length !== 10) {
    return { status: "error", message: "Ingresa un número de celular a 10 dígitos." };
  }
  const decanato = rawDecanatoId ? getDecanatoById(rawDecanatoId) : undefined;
  if (!decanato) {
    return { status: "error", message: "Selecciona el decanato del sacerdote." };
  }

  const { ticketId } = createRegistration({
    full_name: fullName,
    age,
    phone,
    belongs_to_group: false,
    decanato: decanato.name,
    zona_pastoral: decanato.zona_pastoral,
    registration_type: "sacerdote",
  });

  await sendAutomaticDecanatoReportIfDue(decanato.name);
  revalidatePath("/admin/dashboard");
  return { status: "success", message: `Registrado. Folio: ${ticketId}` };
}

export async function assignDecanatoAction(registrationId: number, formData: FormData): Promise<void> {
  await requireAdminSession();
  const decanatoId = String(formData.get("decanato_id") ?? "").trim();
  const decanato = decanatoId ? getDecanatoById(decanatoId) : undefined;
  if (!decanato) return;

  assignRegistrationDecanato({
    registrationId,
    decanato: decanato.name,
    zonaPastoral: decanato.zona_pastoral,
  });
  await sendAutomaticDecanatoReportIfDue(decanato.name);
  revalidatePath("/admin/dashboard");
  revalidatePath("/gafetes");
}

export async function prepareParishUpdateLinkAction(
  registrationId: number,
  _prevState: ParishUpdateLinkState,
  _formData: FormData
): Promise<ParishUpdateLinkState> {
  await requireAdminSession();
  if (!Number.isSafeInteger(registrationId) || registrationId < 1) {
    return { status: "error", message: "No encontramos este registro." };
  }

  const token = createParishUpdateToken(registrationId);
  if (!token) {
    return {
      status: "error",
      message: "Este registro ya fue actualizado o no necesita solicitar parroquia.",
    };
  }

  return { status: "success", token };
}
