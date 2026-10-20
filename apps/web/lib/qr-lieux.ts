/**
 * Pages d'accueil de lieu, conçues depuis l'app et servies par nous sur `/l/<slug>`.
 *
 * Le modèle, les libellés des gabarits et la page de départ d'Exoticas vivent dans
 * `lib/lieux-modele.ts` (sans dépendance serveur, donc utilisables par l'éditeur et les
 * gabarits). Ce fichier ajoute le stockage et les contrôles d'entrée.
 *
 * Stockage partagé (`lib/qr-stockage.ts`), sous le préfixe `lieux/` :
 *   - `lieux/index.json`      : manifeste des pages
 *   - `lieux/<slug>.json`     : la page complète
 *   - `lieux/images/<slug>-…` : couverture et galerie téléversées depuis l'éditeur
 *
 * Le QR d'un lieu pointe sur `/l/<slug>`, une adresse qui ne change pas quand on refait la
 * page : un QR déjà imprimé sur une table continue d'ouvrir la nouvelle version.
 */

import {
  backendActif,
  ecrireJson,
  ecrireObjet,
  espaceLieux,
  lireJson,
  lireObjet,
  nettoyerNom,
  nouveauSlug,
  slugFromNom,
  supprimerObjet,
  typeImage,
  urlLieu,
} from "@/lib/qr-stockage";
import {
  ACCENT_PAR_DEFAUT,
  LIMITE,
  MODELES,
  pageExoticas,
  pageLieuVide,
  booleen,
  hexPropre,
  propre,
  texteLong,
  urlPropre,
  type CreneauLieu,
  type ImageLieu,
  type ModeleAccueil,
  type PageLieu,
  type PrestationLieu,
  type ReseauLieu,
  type ResumeLieu,
} from "@/lib/lieux-modele";

export type {
  CreneauLieu,
  DocumentJoint,
  ImageLieu,
  ModeleAccueil,
  PageLieu,
  PrestationLieu,
  ResumeLieu,
  ReseauLieu,
} from "@/lib/lieux-modele";
export {
  ACCENT_PAR_DEFAUT,
  LIMITE,
  MODELES,
  pageExoticas,
  pageLieuVide,
} from "@/lib/lieux-modele";
export { urlLieu };

interface ManifesteLieux {
  version: 1;
  lieux: ResumeLieu[];
}

const CHEMIN_MANIFESTE = "index.json";

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

async function lireManifeste(): Promise<ResumeLieu[]> {
  const data = await lireJson<Partial<ManifesteLieux>>(espaceLieux(), CHEMIN_MANIFESTE);
  return Array.isArray(data?.lieux) ? data!.lieux : [];
}

async function ecrireManifeste(lieux: ResumeLieu[]) {
  const corps: ManifesteLieux = { version: 1, lieux };
  await ecrireJson(espaceLieux(), CHEMIN_MANIFESTE, corps);
}

/**
 * Premier lancement : aucune page enregistrée. On écrit la page d'Exoticas pour que le QR
 * « Un lieu » fonctionne tout de suite, puis l'éditeur prend le relais. Idempotent : rien
 * n'est écrit dès qu'une page existe déjà.
 *
 * Une lecture publique ne doit jamais échouer parce que cette écriture est impossible
 * (disque en lecture seule, bucket absent, droits insuffisants) : l'échec est avalé ici,
 * la liste reste vide, et c'est l'écriture depuis l'éditeur qui affichera la vraie erreur.
 */
async function assurerPremierLancement(): Promise<ResumeLieu[]> {
  const existants = await lireManifeste();
  if (existants.length > 0) return existants;

  try {
    await enregistrerLieu(pageExoticas());
  } catch {
    return [];
  }
  return lireManifeste();
}

export async function listerLieux(): Promise<ResumeLieu[]> {
  const lieux = await assurerPremierLancement();
  return [...lieux].sort((a, b) => (a.majLe < b.majLe ? 1 : -1));
}

export async function trouverLieu(slug: string): Promise<PageLieu | null> {
  if (!estSlugValide(slug)) return null;
  const brut = await lireJson<PageLieu>(espaceLieux(), `${slug}.json`);
  if (!brut || brut.slug !== slug) return null;
  return normaliser(brut, slug);
}

export function estSlugValide(slug: string): boolean {
  return /^[a-z0-9-]{3,40}$/.test(slug);
}

// ---------------------------------------------------------------------------
// Contrôle d'entrée
// ---------------------------------------------------------------------------

function nettoyerCheminImage(chemin: unknown): string {
  return String(chemin ?? "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "")
    .replace(/\.\./g, "")
    .slice(0, 120);
}

function liste<T, R>(valeur: unknown, max: number, mapper: (entree: T) => R): R[] {
  return Array.isArray(valeur) ? valeur.slice(0, max).map(mapper) : [];
}

function imageControlee(entree: unknown): ImageLieu | null {
  const brut = entree as Partial<ImageLieu> | null;
  const chemin = nettoyerCheminImage(brut?.chemin);
  if (!chemin) return null;
  return {
    chemin,
    legende: propre(brut?.legende, 120),
    contentType: String(brut?.contentType ?? "image/jpeg").slice(0, 60),
    tailleOctets: Number(brut?.tailleOctets ?? 0) || 0,
  };
}

/**
 * Remet une page — lue du stockage ou envoyée par l'éditeur — dans un état sain et borné :
 * chaînes tronquées, URLs filtrées, couleur validée, listes plafonnées.
 */
export function normaliser(entree: Partial<PageLieu>, slugForce?: string): PageLieu {
  const defaut = pageLieuVide();
  const modele = MODELES.some((m) => m.id === entree.modele)
    ? (entree.modele as ModeleAccueil)
    : defaut.modele;

  const slug =
    slugForce ??
    (typeof entree.slug === "string" && estSlugValide(entree.slug) ? entree.slug : "");

  return {
    slug,
    nom: propre(entree.nom, LIMITE.nom) || "Sans nom",
    accroche: propre(entree.accroche, LIMITE.accroche),
    modele,
    accent: hexPropre(entree.accent, ACCENT_PAR_DEFAUT),
    couverture: imageControlee(entree.couverture),
    presentation: {
      visible: booleen(entree.presentation?.visible),
      titre: propre(entree.presentation?.titre, LIMITE.titre),
      texte: texteLong(entree.presentation?.texte, LIMITE.texte),
    },
    prestations: {
      visible: booleen(entree.prestations?.visible),
      titre: propre(entree.prestations?.titre, LIMITE.titre),
      items: liste<PrestationLieu, PrestationLieu>(
        entree.prestations?.items,
        LIMITE.items,
        (item) => ({ nom: propre(item?.nom, 80), detail: texteLong(item?.detail, 300) }),
      ).filter((item) => item.nom || item.detail),
    },
    infos: {
      visible: booleen(entree.infos?.visible),
      titre: propre(entree.infos?.titre, LIMITE.titre),
      adresse: propre(entree.infos?.adresse, 200),
      creneaux: liste<CreneauLieu, CreneauLieu>(entree.infos?.creneaux, LIMITE.creneaux, (creneau) => ({
        jour: propre(creneau?.jour, 40),
        heure: propre(creneau?.heure, 60),
      })).filter((creneau) => creneau.jour || creneau.heure),
      telephone: propre(entree.infos?.telephone, 30),
      whatsapp: propre(entree.infos?.whatsapp, 30),
      reseaux: liste<ReseauLieu, ReseauLieu>(entree.infos?.reseaux, LIMITE.reseaux, (reseau) => ({
        libelle: propre(reseau?.libelle, 30),
        url: urlPropre(reseau?.url),
      })).filter((reseau) => reseau.libelle && reseau.url),
    },
    galerie: {
      visible: booleen(entree.galerie?.visible),
      titre: propre(entree.galerie?.titre, LIMITE.titre),
      images: liste(entree.galerie?.images, LIMITE.images, (image) => imageControlee(image)).filter(
        (image): image is ImageLieu => image !== null,
      ),
    },
    documents: {
      visible: booleen(entree.documents?.visible),
      titre: propre(entree.documents?.titre, LIMITE.titre),
      slugs: liste<string, string>(entree.documents?.slugs, LIMITE.documents, (slugJoint) =>
        String(slugJoint ?? "").replace(/[^a-z0-9]/g, "").slice(0, 20),
      ).filter(Boolean),
    },
    seo: {
      titre: propre(entree.seo?.titre, 120),
      description: propre(entree.seo?.description, 200),
      noindex: booleen(entree.seo?.noindex),
    },
    siteExterne: urlPropre(entree.siteExterne),
    backend: backendActif(),
    creeLe:
      typeof entree.creeLe === "string" && entree.creeLe ? entree.creeLe : new Date().toISOString(),
    majLe: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Écriture
// ---------------------------------------------------------------------------

export interface ResultatEnregistrementLieu {
  page: PageLieu;
  urlPage: string;
  cree: boolean;
}

/**
 * Crée ou remplace une page de lieu. Quand le slug correspond déjà à une page enregistrée,
 * on écrase derrière ce même slug : l'adresse `/l/<slug>` et le QR imprimé ne bougent pas.
 */
export async function enregistrerLieu(
  entree: Partial<PageLieu>,
  options: { req?: Request; slug?: string } = {},
): Promise<ResultatEnregistrementLieu> {
  const lieux = await lireManifeste();
  const slugDemande = (options.slug ?? entree.slug ?? "").trim();
  const existant = estSlugValide(slugDemande)
    ? lieux.find((lieu) => lieu.slug === slugDemande)
    : undefined;
  const slug = existant?.slug ?? slugFromNom(entree.nom ?? "", new Set(lieux.map((l) => l.slug)));

  const page = normaliser(entree, slug);
  await ecrireJson(espaceLieux(), `${slug}.json`, page);

  const resume: ResumeLieu = {
    slug,
    nom: page.nom,
    accroche: page.accroche,
    modele: page.modele,
    backend: page.backend,
    creeLe: existant?.creeLe ?? page.creeLe,
    majLe: page.majLe,
  };

  await ecrireManifeste([resume, ...lieux.filter((l) => l.slug !== slug)]);

  return { page, urlPage: urlLieu(slug, options.req), cree: !existant };
}

/**
 * Téléverse une image de lieu (couverture ou galerie) et renvoie la référence à mettre dans
 * la page. Le nom final porte le slug pour éviter les collisions entre lieux.
 */
export async function ajouterImageLieu(options: {
  slug: string;
  octets: Buffer;
  nomOriginal: string;
  legende?: string;
}): Promise<ImageLieu> {
  const mime = typeImage(options.octets);
  if (!mime) throw new Error("Contenu non reconnu : PNG, JPEG, WebP ou GIF attendus.");

  const extension =
    { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif" }[mime] ??
    ".jpg";
  const base = nettoyerNom(options.nomOriginal).replace(/\.[^.]+$/, "").slice(0, 40) || "photo";
  const chemin = `${options.slug}-${base}${extension}`;

  await ecrireObjet(espaceLieux(), `images/${chemin}`, options.octets, mime);

  return {
    chemin,
    legende: propre(options.legende ?? "", 120),
    contentType: mime,
    tailleOctets: options.octets.length,
  };
}

export async function lireImageLieu(
  chemin: string,
): Promise<{ octets: Buffer; contentType: string } | null> {
  const cheminPropre = nettoyerCheminImage(chemin);
  if (!cheminPropre) return null;
  const octets = await lireObjet(espaceLieux(), `images/${cheminPropre}`);
  if (!octets) return null;
  return { octets, contentType: typeImage(octets) ?? "application/octet-stream" };
}

/** Retire la page et ses images. Les PDF joints ne sont pas touchés. */
export async function supprimerLieu(slug: string): Promise<boolean> {
  const lieux = await lireManifeste();
  if (!lieux.some((lieu) => lieu.slug === slug)) return false;

  const page = await trouverLieu(slug);
  const chemins = new Set<string>();
  if (page?.couverture?.chemin) chemins.add(page.couverture.chemin);
  for (const image of page?.galerie.images ?? []) chemins.add(image.chemin);

  for (const chemin of chemins) await supprimerObjet(espaceLieux(), `images/${chemin}`);
  await supprimerObjet(espaceLieux(), `${slug}.json`);
  await ecrireManifeste(lieux.filter((lieu) => lieu.slug !== slug));
  return true;
}

export function nouveauSlugLieu(existants: Set<string>): string {
  return nouveauSlug(existants);
}
