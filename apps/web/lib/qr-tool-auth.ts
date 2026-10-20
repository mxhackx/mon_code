/**
 * Garde d'accès aux écritures de l'outil QR (téléverser, remplacer, supprimer).
 * Dans l'ordre :
 *
 *  1. session Moncode déjà en place : le jeton est revérifié auprès de l'API Nest
 *     (`GET /auth/me`), exactement comme le fait /qr-studio ;
 *  2. clé partagée : en-tête `x-cle-outil` identique à `QR_TOOL_SHARED_TOKEN` ;
 *  3. hors production, on laisse passer sauf si `QR_TOOL_EXIGER_AUTH=1`, pour que l'outil
 *     reste utilisable sans API ni Supabase démarrés.
 *
 * Les lectures (`GET /api/qr-documents`, `/d/<slug>`, `/…/file`) restent publiques : c'est
 * le principe d'un QR code imprimé, il doit s'ouvrir sans compte.
 */

function exigerAuth(): boolean {
  if (process.env.QR_TOOL_EXIGER_AUTH === "1") return true;
  return process.env.NODE_ENV === "production";
}

function clePartageeFournie(req: Request): boolean {
  const cle = process.env.QR_TOOL_SHARED_TOKEN?.trim();
  if (!cle) return false;
  return req.headers.get("x-cle-outil")?.trim() === cle;
}

function jetonDepuis(req: Request): string | null {
  const entete = req.headers.get("authorization");
  if (entete?.startsWith("Bearer ")) return entete.slice(7).trim();
  const cookies = req.headers.get("cookie") ?? "";
  const trouve = /(?:^|;\s*)access_token=([^;]+)/.exec(cookies);
  return trouve ? decodeURIComponent(trouve[1]) : null;
}

async function sessionValide(jeton: string): Promise<boolean> {
  const apiUrl =
    process.env.API_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:5500";
  try {
    const reponse = await fetch(`${apiUrl.replace(/\/+$/, "")}/auth/me`, {
      headers: { Authorization: `Bearer ${jeton}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return reponse.ok;
  } catch {
    return false;
  }
}

export async function accesAutorise(req: Request): Promise<boolean> {
  if (clePartageeFournie(req)) return true;

  const jeton = jetonDepuis(req);
  if (jeton && (await sessionValide(jeton))) return true;

  return !exigerAuth();
}

export const REPONSE_REFUS = {
  message:
    "Accès refusé à l'outil QR. Connectez-vous (/connexion) ou définissez QR_TOOL_SHARED_TOKEN / QR_TOOL_EXIGER_AUTH.",
} as const;
