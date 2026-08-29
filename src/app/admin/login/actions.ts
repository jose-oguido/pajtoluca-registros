"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateAdmin,
  createSession,
  deleteSession,
  hasAdminUser,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/auth";
import type { LoginState } from "./state";

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Ingresa tu usuario y contraseña." };
  }

  if (!hasAdminUser()) {
    redirect("/admin/setup");
  }

  const user = authenticateAdmin(username, password);
  if (!user) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const token = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: "/",
  });

  redirect("/admin/dashboard");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  deleteSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
