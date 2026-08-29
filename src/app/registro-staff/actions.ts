"use server";

import { redirect } from "next/navigation";
import { createRegistration } from "@/lib/registrations";
import { findParishById } from "@/lib/directory";
import { resolveStaffRegistrationType } from "@/lib/staff-access";
import { sendAutomaticDecanatoReportIfDue } from "@/lib/mailer";
import type { StaffRegistrationState } from "./state";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export async function submitStaffRegistration(
  _prevState: StaffRegistrationState,
  formData: FormData
): Promise<StaffRegistrationState> {
  const rawAccessCode = String(formData.get("access_code") ?? "").trim();
  const rawFullName = String(formData.get("full_name") ?? "").trim();
  const rawAge = String(formData.get("age") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const rawEmail = String(formData.get("email") ?? "").trim();
  const rawParishId = String(formData.get("parish_id") ?? "").trim();
  const rawEmergencyName = String(formData.get("emergency_contact_name") ?? "").trim();
  const rawEmergencyPhone = String(formData.get("emergency_contact_phone") ?? "").trim();
  const rawNotes = String(formData.get("notes") ?? "").trim();

  const values: Record<string, string> = {
    access_code: rawAccessCode,
    full_name: rawFullName,
    age: rawAge,
    phone: rawPhone,
    email: rawEmail,
    parish_id: rawParishId,
    emergency_contact_name: rawEmergencyName,
    emergency_contact_phone: rawEmergencyPhone,
    notes: rawNotes,
  };

  const errors: Record<string, string> = {};

  const registrationType = resolveStaffRegistrationType(rawAccessCode);
  if (!registrationType) {
    errors.access_code = "Código de acceso inválido.";
  }

  if (rawFullName.length < 3) {
    errors.full_name = "Escribe tu nombre completo.";
  }

  const age = Number(rawAge);
  if (!rawAge || !Number.isInteger(age) || age < 12 || age > 45) {
    errors.age = "Ingresa una edad entre 12 y 45 años.";
  }

  const phoneDigits = digitsOnly(rawPhone);
  if (phoneDigits.length !== 10) {
    errors.phone = "Ingresa un número de celular a 10 dígitos.";
  }

  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  const parish = rawParishId ? findParishById(rawParishId) : undefined;
  if (!parish) {
    errors.parish_id = "Selecciona tu parroquia de la lista.";
  }

  if (rawEmergencyName.length < 3) {
    errors.emergency_contact_name = "Escribe el nombre de tu contacto de emergencia.";
  }

  if (digitsOnly(rawEmergencyPhone).length !== 10) {
    errors.emergency_contact_phone = "Ingresa un número de contacto de emergencia a 10 dígitos.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values };
  }

  const { ticketId } = createRegistration({
    full_name: rawFullName,
    age,
    phone: phoneDigits,
    email: rawEmail,
    belongs_to_group: true,
    parish_id: parish!.id,
    parish_group: `${parish!.name} (${parish!.locality})`,
    decanato: parish!.decanato,
    zona_pastoral: parish!.zonaPastoral,
    emergency_contact_name: rawEmergencyName,
    emergency_contact_phone: digitsOnly(rawEmergencyPhone),
    notes: rawNotes || null,
    registration_type: registrationType!,
  });

  await sendAutomaticDecanatoReportIfDue(parish!.decanato);

  redirect(`/boleto/${ticketId}`);
}
