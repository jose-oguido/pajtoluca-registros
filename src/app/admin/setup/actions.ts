"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createFirstAdmin,
  createSession,
  hasAdminUser,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import type { SetupState } from "./state";

export async function setupFirstAdmin(
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  if (hasAdminUser()) {
    redirect("/admin/login");
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
    return { error: "El usuario debe tener de 3 a 50 caracteres sin espacios." };
  }
  if (password.length < 12) {
    return { error: "La contraseña debe tener al menos 12 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  try {
    const user = createFirstAdmin(username, password);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, createSession(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ya fue configurada")) {
      redirect("/admin/login");
    }
    throw error;
  }

  redirect("/admin/accesos");
}
