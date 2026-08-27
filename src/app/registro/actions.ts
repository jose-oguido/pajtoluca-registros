"use server";

import { redirect } from "next/navigation";
import { createRegistration } from "@/lib/registrations";
import { findParishById } from "@/lib/directory";
import type { RegistrationState } from "./state";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export async function submitRegistration(
  _prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const rawFullName = String(formData.get("full_name") ?? "").trim();
  const rawAge = String(formData.get("age") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const rawEmail = String(formData.get("email") ?? "").trim();
  const rawBelongsToGroup = String(formData.get("belongs_to_group") ?? "").trim();
  const rawParishId = String(formData.get("parish_id") ?? "").trim();
  const rawEmergencyName = String(formData.get("emergency_contact_name") ?? "").trim();
  const rawEmergencyPhone = String(formData.get("emergency_contact_phone") ?? "").trim();
  const rawNotes = String(formData.get("notes") ?? "").trim();

  const values: Record<string, string> = {
    full_name: rawFullName,
    age: rawAge,
    phone: rawPhone,
    email: rawEmail,
    belongs_to_group: rawBelongsToGroup,
    parish_id: rawParishId,
    emergency_contact_name: rawEmergencyName,
    emergency_contact_phone: rawEmergencyPhone,
    notes: rawNotes,
  };

  const errors: Record<string, string> = {};

  if (rawFullName.length < 3) {
    errors.full_name = "Escribe tu nombre completo.";
  }

  const age = Number(rawAge);
  if (!rawAge || !Number.isInteger(age) || age < 15 || age > 30) {
    errors.age = "Este es un evento para jóvenes: ingresa una edad entre 15 y 30 años.";
  }

  const phoneDigits = digitsOnly(rawPhone);
  if (phoneDigits.length !== 10) {
    errors.phone = "Ingresa un número de celular a 10 dígitos.";
  }

  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (rawBelongsToGroup !== "yes" && rawBelongsToGroup !== "no") {
    errors.belongs_to_group = "Indica si perteneces a un grupo o parroquia.";
  }

  let parish = null;
  if (rawBelongsToGroup === "yes") {
    parish = rawParishId ? findParishById(rawParishId) : undefined;
    if (!parish) {
      errors.parish_id = "Selecciona tu parroquia o grupo de la lista.";
    }
  }

  if (rawEmergencyPhone && digitsOnly(rawEmergencyPhone).length !== 10) {
    errors.emergency_contact_phone = "Ingresa un número a 10 dígitos, o deja el campo vacío.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values };
  }

  const belongsToGroup = rawBelongsToGroup === "yes";
  const { ticketId } = createRegistration({
    full_name: rawFullName,
    age,
    phone: phoneDigits,
    email: rawEmail || null,
    belongs_to_group: belongsToGroup,
    parish_id: parish?.id ?? null,
    parish_group: parish ? `${parish.name} (${parish.locality})` : null,
    decanato: parish?.decanato ?? null,
    zona_pastoral: parish?.zonaPastoral ?? null,
    emergency_contact_name: rawEmergencyName || null,
    emergency_contact_phone: rawEmergencyPhone ? digitsOnly(rawEmergencyPhone) : null,
    notes: rawNotes || null,
  });

  // Take the attendee straight to their ticket instead of an inline
  // confirmation screen they'd have to click through.
  redirect(`/boleto/${ticketId}`);
}
