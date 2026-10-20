/**
 * Primitives de stockage partagées par les PDF (`/d/<slug>`) et les pages d'accueil de lieu
 * (`/l/<slug>`).
 *
 * Deux backends, choisis automatiquement :
 *
 *  1. Supabase Storage — si SUPABASE_URL et (SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY)
 *     sont définis. Bucket : SUPABASE_PDF_BUCKET (défaut "documents"). Indispensable si
 *     l'app est hébergée de façon éphémère (serverless), le disque n'y survit pas.
 *  2. Disque local — sinon, sous `storage/` à la racine de apps/web (dossier ignoré par git),
 *     ou QR_DOCUMENTS_DIR / QR_LIEUX_DIR pour un chemin explicite.
 *
 * Chaque espace (documents, lieux) a son dossier disque et son préfixe d'objet dans le bucket,
 * donc les deux partagent un seul bucket sans se marcher dessus.
 *
 * Écritures via REST Supabase (pas de SDK) : le paquet n'est pas une dépendance de apps/web.
 * Toutes les écritures passent par un fichier temporaire + rename : un lecteur concurrent ne
 * voit jamais un JSON ou un PDF à moitié copié.
 */

import fs from "node:fs/promises";
import path from "node:path";

export type BackendStockage = "supabase" | "disque";

export interface ConfigurationSupabase {
  url: string;
  cle: string;
  bucket: string;
}

export interface Espace {
  /** Dossier racine côté disque. */
  racine: string;
  /** Préfixe d'objet dans le bucket Supabase, sans slash final ("" = racine du bucket). */
  prefixe: string;
}

export function configurerSupabase(): ConfigurationSupabase | null {
  const url = process.env.SUPABASE_URL?.trim();
  const cle =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !cle) return null;
  return {
    url: url.replace(/\/+$/, ""),
    cle,
    bucket: process.env.SUPABASE_PDF_BUCKET?.trim() || "documents",
  };
}

export function backendActif(): BackendStockage {
  return configurerSupabase() ? "supabase" : "disque";
}

function dossierRacine(): string {
  return path.join(process.cwd(), "storage");
}

export function espaceDocuments(): Espace {
  return {
    racine: process.env.QR_DOCUMENTS_DIR?.trim() || path.join(dossierRacine(), "qr-documents"),
    prefixe: "",
  };
}

export function espaceLieux(): Espace {
  return {
    racine: process.env.QR_LIEUX_DIR?.trim() || path.join(dossierRacine(), "lieux"),
    prefixe: "lieux",
  };
}

export function tailleMaxOctets(): number {
  const mb = Number(process.env.QR_MAX_PDF_MB ?? 25);
  return (Number.isFinite(mb) && mb > 0 ? mb : 25) * 1024 * 1024;
}

/** Images de couverture et de galerie : plus petites qu'un PDF, même plafond par défaut. */
export function tailleMaxImageOctets(): number {
  const mb = Number(process.env.QR_MAX_IMAGE_MB ?? 5);
  return (Number.isFinite(mb) && mb > 0 ? mb : 5) * 1024 * 1024;
}

/** URL de base publiée : APP_URL sert pour les QR imprimés, sinon on devine depuis la requête. */
export function urlApplication(req?: Request): string {
  const depuisEnv =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (depuisEnv) return depuisEnv.replace(/\/+$/, "");
  if (req) return new URL(req.url).origin;
  return "http://localhost:3000";
}

export function urlDocument(slug: string, req?: Request): string {
  return `${urlApplication(req)}/d/${slug}`;
}

export function urlLieu(slug: string, req?: Request): string {
  return `${urlApplication(req)}/l/${slug}`;
}

// ---------------------------------------------------------------------------
// Identifiants et contrôles de contenu
// ---------------------------------------------------------------------------

const CARACTERES_SLUG = "abcdefghijklmnopqrstuvwxyz0123456789";

export function nouveauSlug(existants: Set<string>): string {
  let slug = "";
  do {
    slug = Array.from({ length: 8 }, () =>
      CARACTERES_SLUG.charAt(Math.floor(Math.random() * CARACTERES_SLUG.length)),
    ).join("");
  } while (existants.has(slug));
  return slug;
}

export function nettoyerNom(fichier: string): string {
  return (
    fichier
      .replace(/[^\w.\-À-ÿ ]+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "document.pdf"
  );
}

/** Slug « lisible » pour un lieu : à partir du nom, en minuscules sans accents. */
export function slugFromNom(nom: string, existants: Set<string>): string {
  const base = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  const propre = base.length >= 3 ? base : `${base}lieu`;
  if (propre.length < 3) return nouveauSlug(existants);
  if (!existants.has(propre)) return propre;
  if (!existants.has(`${propre}-2`)) return `${propre}-2`;
  return nouveauSlug(existants);
}

/** Contrôle minimal : le fichier doit commencer par l'en-tête `%PDF-`. */
export function sembleEtreUnPdf(octets: Buffer): boolean {
  return octets.length >= 32 && octets.subarray(0, 5).toString("latin1") === "%PDF-";
}

const SIGNATURES_IMAGE: Array<{ mime: string; teste: (o: Buffer) => boolean }> = [
  { mime: "image/png", teste: (o) => o.length > 16 && o[0] === 0x89 && o.subarray(1, 4).toString("latin1") === "PNG" },
  { mime: "image/jpeg", teste: (o) => o.length > 16 && o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff },
  {
    mime: "image/webp",
    teste: (o) => o.length > 16 && o.subarray(0, 4).toString("latin1") === "RIFF" && o.subarray(8, 12).toString("latin1") === "WEBP",
  },
  { mime: "image/gif", teste: (o) => o.length > 16 && o.subarray(0, 6).toString("latin1").startsWith("GIF8") },
];

/** Renvoie le type réel d'une image à partir de ses octets, ou null si ce n'en est pas une. */
export function typeImage(octets: Buffer): string | null {
  return SIGNATURES_IMAGE.find((s) => s.teste(octets))?.mime ?? null;
}

// ---------------------------------------------------------------------------
// Lecture / écriture
// ---------------------------------------------------------------------------

function enTetes(conf: ConfigurationSupabase): Record<string, string> {
  return { Authorization: `Bearer ${conf.cle}`, apikey: conf.cle };
}

function cleObjet(espace: Espace, cheminRelatif: string): string {
  const propre = cheminRelatif.replace(/^\/+/, "");
  if (propre.includes("..")) throw new Error(`Chemin refusé : ${cheminRelatif}`);
  return espace.prefixe ? `${espace.prefixe}/${propre}` : propre;
}

function cheminDisque(espace: Espace, cheminRelatif: string): string {
  const cible = path.resolve(espace.racine, cheminRelatif.replace(/^\/+/, ""));
  if (cible !== espace.racine && !cible.startsWith(espace.racine + path.sep)) {
    throw new Error(`Chemin hors du dossier de stockage : ${cheminRelatif}`);
  }
  return cible;
}

async function ecrireAtomique(chemin: string, contenu: Buffer | string) {
  const temporaire = `${chemin}.${process.pid}.tmp`;
  await fs.writeFile(temporaire, contenu);
  await fs.rename(temporaire, chemin);
}

export async function ecrireObjet(
  espace: Espace,
  cheminRelatif: string,
  contenu: Buffer | string,
  contentType = "application/octet-stream",
): Promise<void> {
  const conf = configurerSupabase();
  if (conf) {
    const reponse = await fetch(
      `${conf.url}/storage/v1/object/${conf.bucket}/${cleObjet(espace, cheminRelatif)}`,
      {
        method: "PUT",
        headers: { ...enTetes(conf), "Content-Type": contentType, "x-upsert": "true" },
        body: typeof contenu === "string" ? contenu : new Uint8Array(contenu),
      },
    );
    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => "");
      throw new Error(`Échec du téléversement Supabase (${reponse.status}) ${detail}`.trim());
    }
    return;
  }

  const cible = cheminDisque(espace, cheminRelatif);
  await fs.mkdir(path.dirname(cible), { recursive: true });
  await ecrireAtomique(cible, contenu);
}

/** Renvoie null quand l'objet n'existe pas (backend joignable mais fichier absent). */
export async function lireObjet(espace: Espace, cheminRelatif: string): Promise<Buffer | null> {
  const conf = configurerSupabase();
  if (conf) {
    const reponse = await fetch(
      `${conf.url}/storage/v1/object/${conf.bucket}/${cleObjet(espace, cheminRelatif)}`,
      { headers: enTetes(conf), cache: "no-store" },
    );
    if (!reponse.ok) return null;
    return Buffer.from(await reponse.arrayBuffer());
  }

  try {
    return await fs.readFile(cheminDisque(espace, cheminRelatif));
  } catch (erreur) {
    if ((erreur as { code?: string }).code !== "ENOENT") {
      console.warn(`Lecture impossible (${cheminRelatif}) :`, erreur);
    }
    return null;
  }
}

export async function supprimerObjet(espace: Espace, cheminRelatif: string): Promise<void> {
  const conf = configurerSupabase();
  if (conf) {
    await fetch(
      `${conf.url}/storage/v1/object/${conf.bucket}/${cleObjet(espace, cheminRelatif)}`,
      { method: "DELETE", headers: enTetes(conf) },
    ).catch(() => undefined);
    return;
  }

  await fs
    .rm(cheminDisque(espace, cheminRelatif), { force: true })
    .catch(() => undefined);
}

export async function lireJson<T>(espace: Espace, cheminRelatif: string): Promise<T | null> {
  const brut = await lireObjet(espace, cheminRelatif);
  if (!brut) return null;
  try {
    return JSON.parse(brut.toString("utf8")) as T;
  } catch (erreur) {
    console.warn(`JSON illisible (${cheminRelatif}) :`, erreur);
    return null;
  }
}

export async function ecrireJson(espace: Espace, cheminRelatif: string, data: unknown): Promise<void> {
  await ecrireObjet(espace, cheminRelatif, JSON.stringify(data, null, 2), "application/json");
}
