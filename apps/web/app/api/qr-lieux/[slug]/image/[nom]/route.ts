import { NextResponse } from "next/server";
import { lireImageLieu } from "@/lib/qr-lieux";

export const dynamic = "force-dynamic";

/** Sert une image de couverture ou de galerie, quel que soit le backend de stockage. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; nom: string }> },
) {
  const { nom } = await params;
  const image = await lireImageLieu(nom);
  if (!image) {
    return NextResponse.json({ message: `Image introuvable : ${nom}` }, { status: 404 });
  }

  const entites = new Headers({
    "Content-Type": image.contentType,
    "Content-Length": String(image.octets.length),
    "Cache-Control": "public, max-age=0, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(nom)}`,
  });

  const etag = `"${nom}-${image.octets.length}"`;
  entites.set("ETag", etag);
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: entites });
  }

  return new NextResponse(new Uint8Array(image.octets), { status: 200, headers: entites });
}
