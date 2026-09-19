import { NextRequest, NextResponse } from "next/server";
import { findParishById, getDecanatoById } from "@/lib/directory";
import { getRegistrationsForBadges } from "@/lib/registrations";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const decanatoId = request.nextUrl.searchParams.get("decanato")?.trim();
  const parishId = request.nextUrl.searchParams.get("parish")?.trim();

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
