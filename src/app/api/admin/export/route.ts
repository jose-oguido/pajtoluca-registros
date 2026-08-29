import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getAllRegistrationsForExport } from "@/lib/registrations";
import { getTicketTypeLabel } from "@/lib/registration-types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const rows = getAllRegistrationsForExport();

  const header = [
    "folio",
    "boleto_id",
    "tipo_registro",
    "nombre_completo",
    "edad",
    "telefono",
    "correo",
    "pertenece_a_grupo",
    "como_se_entero_y_motivo",
    "parroquia_grupo",
    "decanato",
    "zona_pastoral",
    "contacto_emergencia_nombre",
    "contacto_emergencia_telefono",
    "notas",
    "registrado_en",
  ];

  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        String(row.id),
        csvEscape(row.ticket_id),
        csvEscape(getTicketTypeLabel(row.registration_type, row.age)),
        csvEscape(row.full_name),
        String(row.age),
        csvEscape(row.phone),
        csvEscape(row.email ?? ""),
        row.belongs_to_group ? "si" : "no",
        csvEscape(row.discovery_reason ?? ""),
        csvEscape(row.parish_group ?? ""),
        csvEscape(row.decanato ?? ""),
        csvEscape(row.zona_pastoral ?? ""),
        csvEscape(row.emergency_contact_name ?? ""),
        csvEscape(row.emergency_contact_phone ?? ""),
        csvEscape(row.notes ?? ""),
        row.created_at,
      ].join(",")
    );
  }

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registros-jaj.csv"`,
    },
  });
}
