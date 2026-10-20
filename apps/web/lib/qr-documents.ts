/**
 * Stockage des PDF que les QR codes vont ouvrir (`/d/<slug>`).
 *
 * Les primitives de lecture/écriture (Supabase Storage en REST, ou disque) vivent dans
 * `lib/qr-stockage.ts`, partagé avec les pages d'accueil de lieu.
 *
 * Un manifeste `index.json`, stocké dans le même backend que les PDF, tient la liste des
 * documents. Le QR code pointe toujours vers `/d/<slug>` : cette URL ne change jamais, donc
 * un QR déjà imprimé reste valide si on remplace le PDF derrière le même slug.
 */

import {
  backendActif,
  configurerSupabase,
  ecrireJson,
  lireJson,
  lireObjet,
  nettoyerNom,
  nouveauSlug,
  supprimerObjet,
  tailleMaxOctets,
  urlApplication,
  urlDocument,
  ecrireObjet,
  espaceDocuments,
  sembleEtreUnPdf,
  type BackendStockage,
} from "@/lib/qr-stockage";

export type { BackendStockage } from "@/lib/qr-stockage";
export {
  backendActif,
  configurerSupabase,
  nettoyerNom,
  sembleEtreUnPdf,
  tailleMaxOctets,
  urlApplication,
  urlDocument,
};

export interface DocumentQr {
  slug: string;
  titre: string;
  fileName: string;
  contentType: string;
  tailleOctets: number;
  backend: BackendStockage;
  /** Clé dans le bucket, ou nom de fichier sur le disque. */
  chemin: string;
  creeLe: string;
  majLe: string;
}

interface Manifeste {
  version: 1;
  documents: DocumentQr[];
}

const CHEMIN_MANIFESTE = "index.json";

// ---------------------------------------------------------------------------
// Manifeste
// ---------------------------------------------------------------------------

export async function listerDocuments(): Promise<DocumentQr[]> {
  const data = await lireJson<Partial<Manifeste>>(espaceDocuments(), CHEMIN_MANIFESTE);
  const docs = Array.isArray(data?.documents) ? data!.documents : [];
  return docs.sort((a, b) => (a.majLe < b.majLe ? 1 : -1));
}

export async function trouverDocument(slug: string): Promise<DocumentQr | null> {
  const docs = await listerDocuments();
  return docs.find((d) => d.slug === slug) ?? null;
}

async function enregistrer(docs: DocumentQr[]) {
  const corps: Manifeste = { version: 1, documents: docs };
  await ecrireJson(espaceDocuments(), CHEMIN_MANIFESTE, corps);
}

// ---------------------------------------------------------------------------
// Fichiers
// ---------------------------------------------------------------------------

export interface ResultatAjout {
  document: DocumentQr;
  urlQr: string;
}

/**
 * Enregistre un PDF. Si `slug` est fourni, on remplace le document existant : le QR code
 * déjà imprimé continue de fonctionner, il ouvre simplement le nouveau fichier.
 */
export async function ajouterDocument(options: {
  octets: Buffer;
  nomOriginal: string;
  titre?: string;
  contentType?: string;
  slug?: string;
  req?: Request;
}): Promise<ResultatAjout> {
  const { octets, nomOriginal } = options;
  const nom = nettoyerNom(nomOriginal);
  const maintenant = new Date().toISOString();

  const docs = await listerDocuments();
  const existant = options.slug ? docs.find((d) => d.slug === options.slug) : undefined;
  const slug = existant?.slug ?? nouveauSlug(new Set(docs.map((d) => d.slug)));
  const chemin = existant?.chemin ?? `${slug}-${nom}`;

  await ecrireObjet(espaceDocuments(), chemin, octets, "application/pdf");

  const document: DocumentQr = {
    slug,
    titre: (options.titre ?? "").trim() || nom.replace(/\.pdf$/i, ""),
    fileName: nom,
    contentType: "application/pdf",
    tailleOctets: octets.length,
    backend: backendActif(),
    chemin,
    creeLe: existant?.creeLe ?? maintenant,
    majLe: maintenant,
  };

  await enregistrer([document, ...docs.filter((d) => d.slug !== slug)]);

  return { document, urlQr: urlDocument(slug, options.req) };
}

/** Renvoie les octets d'un document, quel que soit le backend. */
export async function lireDocument(document: DocumentQr): Promise<Buffer> {
  const brut = await lireObjet(espaceDocuments(), document.chemin);
  if (!brut) {
    throw new Error(
      document.backend === "supabase"
        ? "PDF introuvable dans le bucket"
        : "PDF introuvable sur le serveur",
    );
  }
  return brut;
}

export async function supprimerDocument(slug: string): Promise<boolean> {
  const docs = await listerDocuments();
  const cible = docs.find((d) => d.slug === slug);
  if (!cible) return false;

  await supprimerObjet(espaceDocuments(), cible.chemin);
  await enregistrer(docs.filter((d) => d.slug !== slug));
  return true;
}
