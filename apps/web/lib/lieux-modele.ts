/**
 * Modèle des pages d'accueil de lieu, sans aucune dépendance serveur : ce fichier est lu
 * aussi bien par le stockage (`lib/qr-lieux.ts`, côté serveur) que par l'éditeur et les
 * gabarits (côté client). Les contrôles d'entrée et l'écriture vivent dans `lib/qr-lieux.ts`.
 *
 * Toutes les sections portent un drapeau `visible` : on choisit ce que le lieu affiche,
 * et le reste n'apparaît pas sur la page.
 */

export type ModeleAccueil = "sobre" | "liste" | "vitrine";

export interface ModeleInfo {
  id: ModeleAccueil;
  libelle: string;
  description: string;
}

export const MODELES: ModeleInfo[] = [
  {
    id: "sobre",
    libelle: "Sobre",
    description: "Nom et accroche sur fond blanc, une seule colonne, les infos en bas. Se lit en plein soleil.",
  },
  {
    id: "liste",
    libelle: "Liste",
    description: "Accroche courte puis les prestations numérotées. Pour un salon, une salle de sport, un atelier.",
  },
  {
    id: "vitrine",
    libelle: "Vitrine",
    description: "Grande image de couverture, bandeau de nom dessous, puis les sections les unes après les autres.",
  },
];

export const ACCENT_PAR_DEFAUT = "#15803d";

export interface ImageLieu {
  /** Nom du fichier dans le stockage (`<slug>-photo.jpg`). */
  chemin: string;
  legende: string;
  contentType: string;
  tailleOctets: number;
}

export interface PrestationLieu {
  nom: string;
  detail: string;
}

export interface CreneauLieu {
  jour: string;
  heure: string;
}

export interface ReseauLieu {
  libelle: string;
  url: string;
}

export interface SectionPresentation {
  visible: boolean;
  titre: string;
  texte: string;
}

export interface SectionPrestations {
  visible: boolean;
  titre: string;
  items: PrestationLieu[];
}

export interface SectionInfos {
  visible: boolean;
  titre: string;
  adresse: string;
  creneaux: CreneauLieu[];
  telephone: string;
  whatsapp: string;
  reseaux: ReseauLieu[];
}

export interface SectionGalerie {
  visible: boolean;
  titre: string;
  images: ImageLieu[];
}

export interface SectionDocuments {
  visible: boolean;
  titre: string;
  /** Slugs des PDF déjà stockés, ouverts sur `/d/<slug>`. */
  slugs: string[];
}

export interface PageLieu {
  slug: string;
  nom: string;
  accroche: string;
  modele: ModeleAccueil;
  /** Couleur d'accent, hexadécimale à 6 chiffres. */
  accent: string;
  couverture: ImageLieu | null;
  presentation: SectionPresentation;
  prestations: SectionPrestations;
  infos: SectionInfos;
  galerie: SectionGalerie;
  documents: SectionDocuments;
  seo: { titre: string; description: string; noindex: boolean };
  /** Sert quand le lieu a déjà son propre site : `/l/<slug>` redirige alors dessus. */
  siteExterne: string;
  backend: "supabase" | "disque";
  creeLe: string;
  majLe: string;
}

export interface ResumeLieu {
  slug: string;
  nom: string;
  accroche: string;
  modele: ModeleAccueil;
  backend: "supabase" | "disque";
  creeLe: string;
  majLe: string;
}

/** Un PDF joint, avec son titre réel récupéré côté serveur. */
export interface DocumentJoint {
  slug: string;
  titre: string;
  tailleOctets: number;
}

export const LIMITE = {
  nom: 80,
  accroche: 160,
  titre: 70,
  texte: 1200,
  items: 12,
  creneaux: 8,
  reseaux: 6,
  images: 12,
  documents: 8,
};

export function propre(valeur: unknown, max: number): string {
  return String(valeur ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function texteLong(valeur: unknown, max: number): string {
  return String(valeur ?? "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim().slice(0, max);
}

export function booleen(valeur: unknown): boolean {
  return valeur === true;
}

export function hexPropre(valeur: unknown, secour: string): string {
  const brut = String(valeur ?? "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(brut) ? brut : secour;
}

export function urlPropre(valeur: unknown): string {
  const brut = String(valeur ?? "").trim().slice(0, 300);
  if (!brut) return "";
  const avecProto = /^https?:\/\//i.test(brut) ? brut : `https://${brut}`;
  try {
    const url = new URL(avecProto);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString().slice(0, 300);
  } catch {
    return "";
  }
}

/** Page vide : les trois sections sans média sont déjà cochées, galerie et documents non. */
export function pageLieuVide(nom = ""): PageLieu {
  const maintenant = new Date().toISOString();
  return {
    slug: "",
    nom: propre(nom, LIMITE.nom),
    accroche: "",
    modele: "sobre",
    accent: ACCENT_PAR_DEFAUT,
    couverture: null,
    presentation: { visible: true, titre: "Le lieu", texte: "" },
    prestations: { visible: true, titre: "Ce que nous proposons", items: [] },
    infos: {
      visible: true,
      titre: "Nous trouver",
      adresse: "",
      creneaux: [],
      telephone: "",
      whatsapp: "",
      reseaux: [],
    },
    galerie: { visible: false, titre: "Le lieu en images", images: [] },
    documents: { visible: false, titre: "Documents", slugs: [] },
    seo: { titre: "", description: "", noindex: false },
    siteExterne: "",
    backend: "disque",
    creeLe: maintenant,
    majLe: maintenant,
  };
}

/**
 * Exoticas : le lieu demandé au lancement de l'outil. Le contenu est une base de travail,
 * il se corrige dans l'éditeur ; l'adresse `/l/exoticas` ne bouge pas d'une modification à l'autre.
 */
export function pageExoticas(): PageLieu {
  const base = pageLieuVide("Exoticas");
  return {
    ...base,
    slug: "exoticas",
    accroche: "Bar, terrasse et soirées au bord de l'eau",
    modele: "vitrine",
    presentation: {
      visible: true,
      titre: "Le lieu",
      texte:
        "Exoticas est un bar-restaurant ouvert sur la terrasse et la plage. Cocktails maison, grillades le midi, musique live les vendredis et samedis soir.",
    },
    prestations: {
      visible: true,
      titre: "Ce que nous proposons",
      items: [
        { nom: "Carte du midi", detail: "Grillades, poisson frais et plats végétariens, servis de 12h à 15h." },
        { nom: "Bar et cocktails", detail: "Cocktails frais, jus locaux, bières pression et spiritueux." },
        { nom: "Soirées", detail: "Musique live le vendredi, DJ le samedi à partir de 21h." },
        { nom: "Privatisation", detail: "Terrasse et salon réservés pour anniversaires, séminaires et groupes." },
      ],
    },
    infos: {
      visible: true,
      titre: "Nous trouver",
      adresse: "Front de mer, Cotonou",
      creneaux: [
        { jour: "Lundi – Jeudi", heure: "11h – 23h" },
        { jour: "Vendredi – Samedi", heure: "11h – 02h" },
        { jour: "Dimanche", heure: "15h – 23h" },
      ],
      telephone: "+229 01 00 00 00 00",
      whatsapp: "+229 01 00 00 00 00",
      reseaux: [
        { libelle: "Instagram", url: "https://instagram.com/exoticas" },
        { libelle: "Facebook", url: "https://facebook.com/exoticas" },
      ],
    },
    seo: {
      titre: "Exoticas — bar, terrasse et soirées au bord de l'eau",
      description:
        "Exoticas : carte du midi, cocktails, musique live et privatisation de la terrasse. Horaires, adresse et contacts.",
      noindex: false,
    },
  };
}
