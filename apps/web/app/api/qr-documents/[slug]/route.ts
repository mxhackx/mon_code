import { NextResponse } from "next/server";
import { accesAutorise, REPONSE_REFUS } from "@/lib/qr-tool-auth";
import { supprimerDocument, trouverDocument, urlDocument } from "@/lib/qr-documents";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const document = await trouverDocument(slug);
  if (!document) {
    return NextResponse.json({ message: `Aucun document pour « ${slug} ».` }, { status: 404 });
  }
  return NextResponse.json({ document: { ...document, urlQr: urlDocument(slug, req) } });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!(await accesAutorise(req))) {
    return NextResponse.json(REPONSE_REFUS, { status: 403 });
  }
  const supprime = await supprimerDocument(slug);
  if (!supprime) {
    return NextResponse.json({ message: `Aucun document pour « ${slug} ».` }, { status: 404 });
  }
  return NextResponse.json({ supprime: true, slug });
}
