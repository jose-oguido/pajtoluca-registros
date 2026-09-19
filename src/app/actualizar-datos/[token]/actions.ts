"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findParishById } from "@/lib/directory";
import { sendAutomaticDecanatoReportIfDue } from "@/lib/mailer";
import { completeParishUpdate } from "@/lib/registrations";
import type { ParishUpdateState } from "./state";

export async function submitParishUpdate(
  _prevState: ParishUpdateState,
  formData: FormData
): Promise<ParishUpdateState> {
  const token = String(formData.get("token") ?? "").trim();
  const parishId = String(formData.get("parish_id") ?? "").trim();
  const parish = parishId ? findParishById(parishId) : undefined;

  if (!parish) {
    return { status: "error", message: "Selecciona una parroquia de la lista." };
  }

  const result = completeParishUpdate(token, parish);
  if (!result) {
    return {
      status: "error",
      message: "Este enlace ya se utilizó, venció o ya no requiere actualización.",
    };
  }

  await sendAutomaticDecanatoReportIfDue(result.decanato);
  revalidatePath("/admin/dashboard");
  revalidatePath("/gafetes");
  redirect("/actualizar-datos/listo");
}
