"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { sendDecanatoReport } from "@/lib/mailer";
import { createRegistration } from "@/lib/registrations";
import type { SendReportState } from "./state";

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

  const { ticketId } = createRegistration({
    full_name: fullName,
    age,
    phone,
    belongs_to_group: false,
    registration_type: "sacerdote",
  });

  revalidatePath("/admin/dashboard");
  return { status: "success", message: `Registrado. Folio: ${ticketId}` };
}
