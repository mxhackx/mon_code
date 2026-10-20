import { NextResponse } from "next/server";
import { accesAutorise, REPONSE_REFUS } from "@/lib/qr-tool-auth";
import {
  ajouterDocument,
  listerDocuments,
  nettoyerNom,
  sembleEtreUnPdf,
  tailleMaxOctets,
  urlDocument,
  backendActif,
  type DocumentQr,
} from "@/lib/qr-documents";

export const dynamic = "force-dynamic";

interface ReponseDocument extends DocumentQr {
  urlQr: string;
}

function avecUrl(doc: DocumentQr, req: Request): ReponseDocument {
  return { ...doc, urlQr: urlDocument(doc.slug, req) };
}

/** Liste des PDF stockés — lecture publique, un QR imprimé doit s'ouvrir sans compte. */
export async function GET(req: Request) {
  const docs = await listerDocuments();
  return NextResponse.json({
    backend: backendActif(),
    tailleMaxOctets: tailleMaxOctets(),
    documents: docs.map((doc) => avecUrl(doc, req)),
  });
}

/**
 * Téléverse un PDF. Sans `slug` dans le formulaire, crée un nouveau document ;
 * avec un `slug`, remplace le fichier derrière ce même slug (le QR imprimé reste valide).
 */
export async function POST(req: Request) {
  if (!(await accesAutorise(req))) {
    return NextResponse.json(REPONSE_REFUS, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { message: "Formulaire illisible : envoyez le PDF en multipart (champ « fichier »)." },
      { status: 400 },
    );
  }

  const fichier = form.get("fichier");
  if (!(fichier instanceof File)) {
    return NextResponse.json({ message: "Aucun fichier reçu." }, { status: 400 });
  }

  const nom = nettoyerNom(fichier.name || "document.pdf");
  if (!/\.pdf$/i.test(nom) && fichier.type && fichier.type !== "application/pdf") {
    return NextResponse.json(
      { message: `« ${nom} » n'est pas un PDF. Formats acceptés : .pdf uniquement.` },
      { status: 415 },
    );
  }

  const limite = tailleMaxOctets();
  if (fichier.size > limite) {
    return NextResponse.json(
      { message: `« ${nom} » dépasse la taille autorisée (${Math.round(limite / 1024 / 1024)} Mo).` },
      { status: 413 },
    );
  }

  const octets = Buffer.from(await fichier.arrayBuffer());
  if (!sembleEtreUnPdf(octets)) {
    return NextResponse.json(
      { message: `Le contenu de « ${nom} » n'est pas un PDF valide.` },
      { status: 415 },
    );
  }

  const slugDemande = String(form.get("slug") ?? "").trim() || undefined;
  const titre = String(form.get("titre") ?? "").trim();

  try {
    const { document, urlQr } = await ajouterDocument({
      octets,
      nomOriginal: nom,
      titre,
      contentType: "application/pdf",
      slug: slugDemande,
      req,
    });
    return NextResponse.json(
      { document: avecUrl(document, req), urlQr },
      { status: slugDemande ? 200 : 201 },
    );
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "Stockage indisponible.";
    return NextResponse.json(
      { message: `Téléversement impossible : ${message} Vérifiez le bucket SUPABASE_PDF_BUCKET ou les droits d'écriture du dossier de stockage.` },
      { status: 500 },
    );
  }
}
