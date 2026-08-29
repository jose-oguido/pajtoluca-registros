import { Resend } from "resend";
import { getDecanatoById, getDecanatoByName } from "./directory";
import { getEmailSettings, getEmailSettingsStatus } from "./email-settings";
import {
  claimCoordinatorReportBatch,
  COORDINATOR_REPORT_INTERVAL,
  getAllRegistrationsForExport,
  getDecanatoRegistrationCount,
  markCoordinatorReportBatchSent,
  releaseCoordinatorReportBatch,
  type Registration,
} from "./registrations";
import { eventConfig } from "./event-config";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: Registration[]): string {
  const header = [
    "folio",
    "boleto_id",
    "nombre_completo",
    "edad",
    "telefono",
    "correo",
    "como_se_entero_y_motivo",
    "notas",
    "registrado_en",
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        String(row.id),
        csvEscape(row.ticket_id),
        csvEscape(row.full_name),
        String(row.age),
        csvEscape(row.phone),
        csvEscape(row.email ?? ""),
        csvEscape(row.discovery_reason ?? ""),
        csvEscape(row.notes ?? ""),
        row.created_at,
      ].join(",")
    );
  }
  return lines.join("\n");
}

export async function sendDecanatoReport(
  decanatoId: string
): Promise<{ count: number; decanatoName: string; email: string }> {
  const { apiKey, fromEmail } = getEmailSettings();
  if (!apiKey) {
    throw new Error("Configura el correo de envío en Admin > Accesos antes de enviar reportes.");
  }

  const decanato = getDecanatoById(decanatoId);
  if (!decanato) {
    throw new Error("Decanato no encontrado.");
  }
  if (!decanato.coordinator_email) {
    throw new Error("Este decanato no tiene un correo de coordinador configurado.");
  }

  const rows = getAllRegistrationsForExport().filter((r) => r.decanato === decanato.name);
  if (rows.length === 0) {
    throw new Error("Este decanato todavía no tiene registros.");
  }

  const csv = buildCsv(rows);
  const resend = new Resend(apiKey);
  const greetingName = decanato.coordinator_name ? decanato.coordinator_name : "";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: decanato.coordinator_email,
    subject: `Registros de la ${eventConfig.edition} ${eventConfig.name} - Decanato ${decanato.name}`,
    text: [
      `Hola ${greetingName},`,
      "",
      `Adjunto la lista de ${rows.length} jóvenes registrados del decanato ${decanato.name} para la ${eventConfig.edition} ${eventConfig.name}.`,
      "",
      "Saludos,",
      `Equipo organizador de ${eventConfig.organizer}`,
    ].join("\n"),
    attachments: [
      {
        filename: `registros-${decanato.id}-${decanato.name.toLowerCase().replace(/\s+/g, "-")}.csv`,
        content: Buffer.from(csv, "utf-8"),
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }

  return { count: rows.length, decanatoName: decanato.name, email: decanato.coordinator_email };
}

export async function sendAutomaticDecanatoReportIfDue(
  decanatoName: string | null | undefined
): Promise<{ sent: boolean }> {
  if (!decanatoName || !getEmailSettingsStatus().configured) return { sent: false };

  const decanato = getDecanatoByName(decanatoName);
  if (!decanato?.coordinator_email) return { sent: false };

  const registrationCount = getDecanatoRegistrationCount(decanato.name);
  const batchNumber = Math.floor(registrationCount / COORDINATOR_REPORT_INTERVAL);
  if (batchNumber < 1) return { sent: false };

  // The unique batch record is an atomic claim. Concurrent registrations can
  // both reach the threshold, but only one request gets to send that report.
  if (!claimCoordinatorReportBatch(decanato.id, batchNumber)) return { sent: false };

  try {
    await sendDecanatoReport(decanato.id);
    markCoordinatorReportBatchSent(decanato.id, batchNumber);
    return { sent: true };
  } catch (error) {
    // A failed delivery never blocks someone from receiving their ticket. By
    // releasing the claim, a later registration (or the manual button) can retry.
    releaseCoordinatorReportBatch(decanato.id, batchNumber);
    console.error(`No se pudo enviar el reporte automático de ${decanato.name}.`, error);
    return { sent: false };
  }
}
