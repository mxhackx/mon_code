import { NextResponse } from "next/server";
import { accesAutorise, REPONSE_REFUS } from "@/lib/qr-tool-auth";
import { backendActif, tailleMaxImageOctets } from "@/lib/qr-stockage";
import { MODELES, enregistrerLieu, listerLieux, urlLieu, type PageLieu } from "@/lib/qr-lieux";

export const dynamic = "force-dynamic";

/**
 * Liste des pages d'accueil de lieu — lecture publique : un QR scanné sur une table doit
 * pouvoir ouvrir la page et l'aperçu sans compte.
 */
export async function GET(req: Request) {
  const lieux = await listerLieux();
  return NextResponse.json({
    backend: backendActif(),
    tailleMaxImageOctets: tailleMaxImageOctets(),
    modeles: MODELES,
    lieux: lieux.map((lieu) => ({ ...lieu, urlPage: urlLieu(lieu.slug, req) })),
  });
}

/**
 * Enregistre une page. Avec un `slug` (dans le corps ou dans `page.slug`) on écrase la page
 * existante : l'adresse `/l/<slug>` et le QR déjà imprimé ne changent pas.
 */
export async function POST(req: Request) {
  if (!(await accesAutorise(req))) {
    return NextResponse.json(REPONSE_REFUS, { status: 403 });
  }

  let corps: { page?: Partial<PageLieu>; slug?: string };
  try {
    corps = (await req.json()) as { page?: Partial<PageLieu>; slug?: string };
  } catch {
    return NextResponse.json(
      { message: "Corps illisible : envoyez le JSON de la page (champ « page »)." },
      { status: 400 },
    );
  }

  if (!corps.page || typeof corps.page !== "object") {
    return NextResponse.json({ message: "Aucune page reçue." }, { status: 400 });
  }
  if (!String(corps.page.nom ?? "").trim()) {
    return NextResponse.json({ message: "Le nom du lieu est obligatoire." }, { status: 400 });
  }

  try {
    const resultat = await enregistrerLieu(corps.page, {
      req,
      slug: String(corps.slug ?? "").trim() || undefined,
    });
    return NextResponse.json(resultat, { status: resultat.cree ? 201 : 200 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Stockage indisponible.";
    return NextResponse.json(
      {
        message: `Enregistrement impossible : ${message} Vérifiez le bucket SUPABASE_PDF_BUCKET ou les droits d'écriture du dossier de stockage.`,
      },
      { status: 500 },
    );
  }
}
