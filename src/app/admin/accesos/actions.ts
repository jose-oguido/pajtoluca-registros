"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession, updateAdminAccount } from "@/lib/auth";
import { getEmailSettingsStatus, saveEmailSettings } from "@/lib/email-settings";
import { setStaffAccessCode } from "@/lib/staff-access";
import { isStaffRegistrationType, type StaffRegistrationType } from "@/lib/registration-types";
import type { AccessSettingsState } from "./state";

export async function updateAccountAction(
  _prevState: AccessSettingsState,
  formData: FormData
): Promise<AccessSettingsState> {
  const admin = await requireAdminSession();
  const username = String(formData.get("username") ?? "").trim();
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_new_password") ?? "");

  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
    return { status: "error", message: "El usuario debe tener de 3 a 50 caracteres sin espacios." };
  }
  if (!currentPassword) {
    return { status: "error", message: "Escribe tu contraseña actual para confirmar el cambio." };
  }
  if (newPassword && newPassword.length < 12) {
    return { status: "error", message: "La nueva contraseña debe tener al menos 12 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: "La confirmación de la nueva contraseña no coincide." };
  }

  const result = updateAdminAccount(admin.id, { username, currentPassword, newPassword: newPassword || undefined });
  if (!result.ok) return { status: "error", message: result.error };

  revalidatePath("/admin/accesos");
  return { status: "success", message: "La cuenta de administrador se actualizó." };
}

export async function updateStaffCodeAction(
  type: StaffRegistrationType,
  _prevState: AccessSettingsState,
  formData: FormData
): Promise<AccessSettingsState> {
  await requireAdminSession();
  if (!isStaffRegistrationType(type)) {
    return { status: "error", message: "El tipo de acceso no es válido." };
  }
  const code = String(formData.get("access_code") ?? "").trim();

  if (code.length < 8) {
    return { status: "error", message: "El código debe tener al menos 8 caracteres." };
  }

  setStaffAccessCode(type, code);
  revalidatePath("/admin/accesos");
  return { status: "success", message: "El código se guardó. Comparte sólo la nueva versión con el equipo." };
}

export async function updateEmailSettingsAction(
  _prevState: AccessSettingsState,
  formData: FormData
): Promise<AccessSettingsState> {
  await requireAdminSession();
  const apiKey = String(formData.get("resend_api_key") ?? "").trim();
  const fromEmail = String(formData.get("resend_from_email") ?? "").trim();
  const current = getEmailSettingsStatus();

  if (!current.configured && !apiKey) {
    return { status: "error", message: "Ingresa la clave API de Resend para activar los envíos." };
  }
  if (fromEmail && !fromEmail.includes("@")) {
    return { status: "error", message: "Ingresa una dirección de envío válida." };
  }

  saveEmailSettings({ apiKey: apiKey || undefined, fromEmail: fromEmail || undefined });
  revalidatePath("/admin/accesos");
  return { status: "success", message: "La configuración de correo se guardó." };
}
