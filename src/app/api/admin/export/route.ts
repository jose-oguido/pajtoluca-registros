import { NextResponse } from "next/server";
import { getAllRegistrationsForExport } from "@/lib/registrations";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const rows = getAllRegistrationsForExport();

  const header = [
    "folio",
    "boleto_id",
    "nombre_completo",
    "edad",
    "telefono",
    "correo",
    "pertenece_a_grupo",
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
        csvEscape(row.full_name),
        String(row.age),
        csvEscape(row.phone),
        csvEscape(row.email ?? ""),
        row.belongs_to_group ? "si" : "no",
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
