import { Resend } from "resend";
import { getDecanatoById } from "./directory";
import { getAllRegistrationsForExport, type Registration } from "./registrations";
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar RESEND_API_KEY en las variables de entorno.");
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
  const from = process.env.RESEND_FROM_EMAIL || "JAJ Pajtoluca <onboarding@resend.dev>";
  const greetingName = decanato.coordinator_name ? decanato.coordinator_name : "";

  const { error } = await resend.emails.send({
    from,
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
