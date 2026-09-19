import { NextRequest, NextResponse } from "next/server";
import { generateQrPng } from "@/lib/qrcode";
import { getRegistrationForBadgeQrToken } from "@/lib/registrations";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!getRegistrationForBadgeQrToken(token)) {
    return new NextResponse(null, { status: 404 });
  }

  const destination = new URL(`/qr/${encodeURIComponent(token)}`, request.url).toString();
  const image = await generateQrPng(destination);
  const body = new Uint8Array(image.byteLength);
  body.set(image);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
