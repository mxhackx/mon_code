import { NextResponse } from "next/server";
import { lireDocument, trouverDocument } from "@/lib/qr-documents";

export const dynamic = "force-dynamic";

/** Sert le PDF lui-même, depuis le bucket Supabase ou le disque. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const document = await trouverDocument(slug);
  if (!document) {
    return NextResponse.json({ message: `Aucun document pour « ${slug} ».` }, { status: 404 });
  }

  const etag = `"${document.slug}-${document.tailleOctets}-${document.majLe}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  let octets: Buffer;
  try {
    octets = await lireDocument(document);
  } catch {
    return NextResponse.json(
      { message: `Le fichier de « ${slug} » est introuvable côté stockage (${document.backend}).` },
      { status: 410 },
    );
  }

  return new NextResponse(new Uint8Array(octets), {
    headers: {
      "Content-Type": document.contentType,
      // « inline » : le scanner ouvre le PDF dans le navigateur au lieu de le télécharger.
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
      "Content-Length": String(octets.length),
      ETag: etag,
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
