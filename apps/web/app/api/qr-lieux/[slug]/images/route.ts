import { NextResponse } from "next/server";
import { accesAutorise, REPONSE_REFUS } from "@/lib/qr-tool-auth";
import { tailleMaxImageOctets } from "@/lib/qr-stockage";
import { ajouterImageLieu } from "@/lib/qr-lieux";

export const dynamic = "force-dynamic";

const FORME_SLUG = /^[a-z0-9-]{3,40}$/;

/**
 * Téléverse une image pour la couverture ou la galerie d'une page.
 * `brouillon` est accepté : une page non encore enregistrée peut déjà recevoir ses visuels.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const slug = (await params).slug;
  if (!FORME_SLUG.test(slug)) {
    return NextResponse.json({ message: "Slug de lieu invalide." }, { status: 400 });
  }
  if (!(await accesAutorise(req))) {
    return NextResponse.json(REPONSE_REFUS, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { message: "Formulaire illisible : envoyez l'image en multipart (champ « fichier »)." },
      { status: 400 },
    );
  }

  const fichier = form.get("fichier");
  if (!(fichier instanceof File)) {
    return NextResponse.json({ message: "Aucune image reçue." }, { status: 400 });
  }

  const limite = tailleMaxImageOctets();
  if (fichier.size > limite) {
    return NextResponse.json(
      { message: `« ${fichier.name} » dépasse ${Math.round(limite / 1024 / 1024)} Mo.` },
      { status: 413 },
    );
  }

  try {
    const octets = Buffer.from(await fichier.arrayBuffer());
    const image = await ajouterImageLieu({
      slug,
      octets,
      nomOriginal: fichier.name || "photo",
      legende: String(form.get("legende") ?? ""),
    });
    return NextResponse.json({ image }, { status: 201 });
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Stockage indisponible.";
    return NextResponse.json({ message: `Image refusée : ${message}` }, { status: 415 });
  }
}
