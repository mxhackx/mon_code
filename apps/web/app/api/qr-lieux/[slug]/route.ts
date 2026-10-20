import { NextResponse } from "next/server";
import { accesAutorise, REPONSE_REFUS } from "@/lib/qr-tool-auth";
import { enregistrerLieu, supprimerLieu, trouverLieu, urlLieu, type PageLieu } from "@/lib/qr-lieux";

export const dynamic = "force-dynamic";

const FORME_SLUG = /^[a-z0-9-]{3,40}$/;

function slugValide(slug: string): string | null {
  return FORME_SLUG.test(slug) ? slug : null;
}

/** Une page complète, pour l'éditeur et pour l'aperçu publié. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const slug = slugValide((await params).slug);
  if (!slug) {
    return NextResponse.json({ message: "Slug de lieu invalide." }, { status: 400 });
  }

  const page = await trouverLieu(slug);
  if (!page) {
    return NextResponse.json({ message: `Aucune page pour « ${slug} ».` }, { status: 404 });
  }
  return NextResponse.json({ page, urlPage: urlLieu(slug, req) });
}

/** Remplace la page derrière ce même slug. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const slug = slugValide((await params).slug);
  if (!slug) {
    return NextResponse.json({ message: "Slug de lieu invalide." }, { status: 400 });
  }
  if (!(await accesAutorise(req))) {
    return NextResponse.json(REPONSE_REFUS, { status: 403 });
  }

  let corps: Partial<PageLieu>;
  try {
    corps = (await req.json()) as Partial<PageLieu>;
  } catch {
    return NextResponse.json({ message: "Corps JSON illisible." }, { status: 400 });
  }

  const existante = await trouverLieu(slug);
  if (!existante) {
    return NextResponse.json({ message: `Aucune page pour « ${slug} ».` }, { status: 404 });
  }

  try {
    const resultat = await enregistrerLieu({ ...existante, ...corps, slug }, { req, slug });
    return NextResponse.json(resultat, { status: 200 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Stockage indisponible.";
    return NextResponse.json({ message: `Enregistrement impossible : ${message}` }, { status: 500 });
  }
}

/** Retire la page et ses images. Les PDF joints restent disponibles sur `/d/<slug>`. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const slug = slugValide((await params).slug);
  if (!slug) {
    return NextResponse.json({ message: "Slug de lieu invalide." }, { status: 400 });
  }
  if (!(await accesAutorise(req))) {
    return NextResponse.json(REPONSE_REFUS, { status: 403 });
  }

  const supprime = await supprimerLieu(slug);
  if (!supprime) {
    return NextResponse.json({ message: `Aucune page pour « ${slug} ».` }, { status: 404 });
  }
  return NextResponse.json({ supprime: true, slug });
}
