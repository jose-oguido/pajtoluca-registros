import { NextRequest, NextResponse } from "next/server";
import { findParishById, getDecanatoById } from "@/lib/directory";
import { getRegistrationByTicketId, getRegistrationsForBadges } from "@/lib/registrations";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const folio = request.nextUrl.searchParams.get("folio")?.trim();
  const decanatoId = request.nextUrl.searchParams.get("decanato")?.trim();
  const parishId = request.nextUrl.searchParams.get("parish")?.trim();

  if (folio) {
    const registration =
      getRegistrationByTicketId(folio) ?? getRegistrationByTicketId(folio.toUpperCase());
    if (!registration) {
      return NextResponse.json({ error: "No encontramos ese folio." }, { status: 404 });
    }

    const role =
      registration.registration_type === "staff"
        ? "Staff"
        : registration.registration_type === "ministro_extraordinario"
          ? "Ministro Ex."
          : registration.registration_type === "sacerdote"
            ? "Staff"
            : registration.age <= 17
              ? "Adolescente"
              : "Joven";

    return NextResponse.json(
      {
        folio: registration.ticket_id,
        nombre_completo: registration.full_name,
        comunidad: registration.parish_group ?? "",
        decanato: registration.decanato ?? "",
        rol: role,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if ((!decanatoId && !parishId) || (decanatoId && parishId)) {
    return NextResponse.json(
      { error: "Elige un decanato o una parroquia para consultar los gafetes." },
      { status: 400 }
    );
  }

  if (decanatoId) {
    const decanato = getDecanatoById(decanatoId);
    if (!decanato) {
      return NextResponse.json({ error: "No encontramos ese decanato." }, { status: 404 });
    }
    return NextResponse.json(
      { registrations: getRegistrationsForBadges({ decanato: decanato.name }) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const parish = findParishById(parishId!);
  if (!parish) {
    return NextResponse.json({ error: "No encontramos esa parroquia." }, { status: 404 });
  }
  return NextResponse.json(
    { registrations: getRegistrationsForBadges({ parishId: parish.id }) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
