"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import {
  createDecanato,
  createParish,
  deleteDecanato,
  deleteParish,
  updateDecanato,
  updateParish,
} from "@/lib/directory";

function refresh() {
  revalidatePath("/admin/directorio");
  revalidatePath("/registro");
}

export async function createDecanatoAction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const zonaPastoral = String(formData.get("zonaPastoral") ?? "").trim();
  if (!name || !zonaPastoral) return;

  createDecanato({ name, zonaPastoral });
  refresh();
}

export async function updateDecanatoAction(decanatoId: string, formData: FormData): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const zonaPastoral = String(formData.get("zonaPastoral") ?? "").trim();
  const coordinatorName = String(formData.get("coordinatorName") ?? "").trim();
  const coordinatorEmail = String(formData.get("coordinatorEmail") ?? "").trim();
  const coordinatorPhone = String(formData.get("coordinatorPhone") ?? "").trim();
  if (!name || !zonaPastoral) return;

  updateDecanato(decanatoId, {
    name,
    zonaPastoral,
    coordinatorName: coordinatorName || null,
    coordinatorEmail: coordinatorEmail || null,
    coordinatorPhone: coordinatorPhone || null,
  });
  refresh();
}

export async function deleteDecanatoAction(decanatoId: string): Promise<void> {
  await requireAdminSession();
  deleteDecanato(decanatoId);
  refresh();
}

export async function createParishAction(decanatoId: string, formData: FormData): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const locality = String(formData.get("locality") ?? "").trim();
  if (!name || !locality) return;

  createParish({ name, locality, decanatoId });
  refresh();
}

export async function updateParishAction(
  parishId: string,
  decanatoId: string,
  formData: FormData
): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const locality = String(formData.get("locality") ?? "").trim();
  if (!name || !locality) return;

  updateParish(parishId, { name, locality, decanatoId });
  refresh();
}

export async function deleteParishAction(parishId: string): Promise<void> {
  await requireAdminSession();
  deleteParish(parishId);
  refresh();
}
