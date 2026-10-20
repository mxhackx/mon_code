/**
 * Styles de QR codes pour l'outil de génération.
 *
 * Deux réglages de base : `STYLE_SIMPLE` (le plus fiable au scan, noir sur blanc, motifs
 * carrés) et `STYLE_PERSONNALISE` (point de départ avant réglages). Les palettes vertes
 * proposées sont volontairement sombres : un QR se scanne d'abord par contraste.
 */

export type MotifPoints =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

export type FormeCoins = "square" | "extra-rounded" | "dot";

export type NiveauCorrection = "L" | "M" | "Q" | "H";

export interface ConfigQr {
  /** Couleur des modules (les « pixels » du QR). */
  modules: string;
  /** Couleur du fond. */
  fond: string;
  motifPoints: MotifPoints;
  formeCoins: FormeCoins;
  correction: NiveauCorrection;
  /** Marge autour du QR, en pixels rendus. */
  marge: number;
  /** Taille du fichier exporté, en pixels carrés. */
  export: 512 | 1024 | 2048;
}

export const STYLE_SIMPLE: ConfigQr = {
  modules: "#000000",
  fond: "#ffffff",
  motifPoints: "square",
  formeCoins: "square",
  correction: "M",
  marge: 12,
  export: 1024,
};

export const STYLE_PERSONNALISE: ConfigQr = {
  ...STYLE_SIMPLE,
  modules: "#15803d",
  motifPoints: "rounded",
  formeCoins: "extra-rounded",
  correction: "Q",
};

export interface PresetQr {
  id: string;
  nom: string;
  config: ConfigQr;
}

export const PRESETS: PresetQr[] = [
  {
    id: "vert-classic",
    nom: "Vert classique",
    config: { ...STYLE_PERSONNALISE, modules: "#15803d", fond: "#ffffff", motifPoints: "square", formeCoins: "square" },
  },
  {
    id: "vert-arrondi",
    nom: "Vert arrondi",
    config: { ...STYLE_PERSONNALISE, modules: "#166534", fond: "#ffffff" },
  },
  {
    id: "blanc-sur-vert",
    nom: "Blanc sur vert",
    config: { ...STYLE_PERSONNALISE, modules: "#ffffff", fond: "#166534", motifPoints: "dots", formeCoins: "dot" },
  },
  {
    id: "foret-claire",
    nom: "Forêt sur clair",
    config: { ...STYLE_PERSONNALISE, modules: "#14532d", fond: "#f0fdf4", motifPoints: "classy-rounded", formeCoins: "extra-rounded" },
  },
];

export const MOTIFS: { valeur: MotifPoints; libelle: string }[] = [
  { valeur: "square", libelle: "Carrés (le plus fiable)" },
  { valeur: "rounded", libelle: "Arrondis" },
  { valeur: "dots", libelle: "Points" },
  { valeur: "classy", libelle: "Élégant" },
  { valeur: "classy-rounded", libelle: "Élégant arrondi" },
  { valeur: "extra-rounded", libelle: "Très arrondi" },
];

export const FORMES_COINS: { valeur: FormeCoins; libelle: string }[] = [
  { valeur: "square", libelle: "Carrés" },
  { valeur: "extra-rounded", libelle: "Arrondis" },
  { valeur: "dot", libelle: "Ronds" },
];

export const CORRECTIONS: { valeur: NiveauCorrection; libelle: string }[] = [
  { valeur: "L", libelle: "L — ~7 % de tolérance" },
  { valeur: "M", libelle: "M — ~15 % (défaut)" },
  { valeur: "Q", libelle: "Q — ~25 %" },
  { valeur: "H", libelle: "H — ~30 % (obligatoire avec un logo)" },
];

export const TAILLES_EXPORT: { valeur: ConfigQr["export"]; libelle: string }[] = [
  { valeur: 512, libelle: "512 px — affiche A6, écran" },
  { valeur: 1024, libelle: "1024 px — flyer, carte" },
  { valeur: 2048, libelle: "2048 px — grand format" },
];

// ---------------------------------------------------------------------------
// Lisibilité : contraste et réserves d'impression
// ---------------------------------------------------------------------------

function composante(hex: string, index: number): number {
  const propre = hex.replace("#", "").trim();
  const developpe =
    propre.length === 3
      ? propre.split("").map((c) => c + c).join("")
      : propre.padEnd(6, "0").slice(0, 6);
  const octet = parseInt(developpe.slice(index * 2, index * 2 + 2), 16);
  const normalise = Number.isFinite(octet) ? octet / 255 : 0;
  return normalise <= 0.03928 ? normalise / 12.92 : ((normalise + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  return 0.2126 * composante(hex, 0) + 0.7152 * composante(hex, 1) + 0.0722 * composante(hex, 2);
}

/** Rapport de contraste WCAG entre deux couleurs (1 → identiques, 21 → noir/blanc). */
export function contraste(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [clair, sombre] = la >= lb ? [la, lb] : [lb, la];
  return (clair + 0.05) / (sombre + 0.05);
}

export function estHexValide(valeur: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(valeur.trim());
}

export function normaliseHex(valeur: string, secours: string): string {
  const brute = valeur.trim();
  const avecDièse = brute.startsWith("#") ? brute : `#${brute}`;
  return estHexValide(avecDièse) ? avecDièse.toLowerCase() : secours;
}

/**
 * Réserves affichées sous l'aperçu. On ne bloque jamais la génération : un QR moche
 * reste un QR, mais il faut que l'on sache qu'il se scanne moins bien.
 */
export function avertissements(config: ConfigQr, options: { avecLogo: boolean; longueurCible: number }): string[] {
  const reserves: string[] = [];
  const ratio = contraste(config.modules, config.fond);

  if (ratio < 3) {
    reserves.push(
      `Contraste trop faible (${ratio.toFixed(1)}:1) : visez au moins 4:1, sinon beaucoup de téléphones ne liront pas ce QR.`,
    );
  } else if (luminance(config.modules) > luminance(config.fond)) {
    reserves.push(
      "Couleurs inversées (modules plus clairs que le fond) : certains scanners liront mal. Le blanc sur vert doit rester très foncé.",
    );
  }

  if (options.avecLogo && config.correction !== "H") {
    reserves.push(
      `Logo au centre avec une correction « ${config.correction} » : passez en H pour garder la lecture possible si le QR est abîmé.`,
    );
  }

  if (config.marge < 8) {
    reserves.push("Marge quasi nulle : laissez au moins 8 px de fond autour du QR, l'impression la mange en partie.");
  }

  if (options.longueurCible > 700) {
    reserves.push("Lien très long : le QR aura beaucoup de modules et sera dur à scanner en petit. Privilégiez une URL courte.");
  }

  return reserves;
}
