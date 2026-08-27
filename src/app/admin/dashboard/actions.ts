"use server";

import { sendDecanatoReport } from "@/lib/mailer";
import type { SendReportState } from "./state";

export async function sendReportAction(
  decanatoId: string,
  _prevState: SendReportState,
  _formData: FormData
): Promise<SendReportState> {
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
