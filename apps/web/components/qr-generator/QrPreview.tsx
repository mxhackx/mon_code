"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import { AlertTriangle, Check, Copy, Download, FileCode2 } from "lucide-react";
import { avertissements, type ConfigQr } from "./qrStyles";

/** Taille d'affichage : l'export utilise `config.export`, indépendamment de l'aperçu. */
const TAILLE_APERCU = 236;

interface Props {
  cible: string;
  config: ConfigQr;
  logo?: string | null;
  nomFichier: string;
  legende?: string;
}

function nomDuFichier(nom: string, cible: string): string {
  const brut = nom.trim() || (cible ? new URL(cible).hostname.replace(/\W+/g, "-") : "qr-code");
  return brut.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "qr-code";
}

export default function QrPreview({ cible, config, logo = null, nomFichier, legende }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const instance = useRef<QRCodeStyling | null>(null);
  const [pret, setPret] = useState(false);
  const [copie, setCopie] = useState(false);

  const urlValide = useMemo(() => {
    if (!cible) return false;
    try {
      const url = new URL(cible);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, [cible]);

  // L'instance est créée une seule fois, puis mise à jour : c'est ce que fait
  // qr-code-styling en interne, et évite d'empiler les <svg> dans le conteneur.
  useEffect(() => {
    let monte = true;
    import("qr-code-styling").then((module) => {
      if (!monte || !conteneur.current) return;
      const qr = new module.default({
        width: TAILLE_APERCU,
        height: TAILLE_APERCU,
        data: urlValide ? cible : "https://moncode.app",
        margin: config.marge,
        imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.35 },
        qrOptions: { errorCorrectionLevel: config.correction },
        dotsOptions: { color: config.modules, type: config.motifPoints },
        cornersSquareOptions: { color: config.modules, type: config.formeCoins },
        cornersDotOptions: { color: config.modules, type: config.formeCoins },
        backgroundOptions: { color: config.fond },
        image: logo || undefined,
      });
      qr.append(conteneur.current);
      instance.current = qr;
      setPret(true);
    });
    return () => {
      monte = false;
      instance.current = null;
      setPret(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!instance.current || !urlValide) return;
    instance.current.update({
      data: cible,
      width: TAILLE_APERCU,
      height: TAILLE_APERCU,
      margin: config.marge,
      image: logo || undefined,
      qrOptions: { errorCorrectionLevel: config.correction },
      dotsOptions: { color: config.modules, type: config.motifPoints },
      cornersSquareOptions: { color: config.modules, type: config.formeCoins },
      cornersDotOptions: { color: config.modules, type: config.formeCoins },
      backgroundOptions: { color: config.fond },
    });
  }, [cible, config, logo, urlValide]);

  const telecharger = async (extension: "png" | "svg") => {
    const qr = instance.current;
    if (!qr || !urlValide) return;
    qr.update({ width: config.export, height: config.export });
    try {
      await qr.download({ name: nomDuFichier(nomFichier, cible), extension });
    } finally {
      qr.update({ width: TAILLE_APERCU, height: TAILLE_APERCU });
    }
  };

  const copier = async () => {
    if (!urlValide) return;
    await navigator.clipboard.writeText(cible);
    setCopie(true);
    setTimeout(() => setCopie(false), 1800);
  };

  const reserves = urlValide
    ? avertissements(config, { avecLogo: Boolean(logo), longueurCible: cible.length })
    : [];

  return (
    <div className="rounded-xl border border-green-100 bg-white p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aperçu</h2>

      <div className="mt-4 flex justify-center rounded-lg border border-green-100 bg-green-50/50 p-4">
        <div className="relative">
          <div
            ref={conteneur}
            className="overflow-hidden rounded-md bg-white"
            style={{ width: TAILLE_APERCU, height: TAILLE_APERCU, opacity: urlValide ? 1 : 0.25 }}
          />
          {!urlValide && (
            <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-500">
              {pret ? "Choisissez une source pour voir le QR code." : "Préparation de l'aperçu…"}
            </p>
          )}
        </div>
      </div>

      {legende && <p className="mt-3 text-center text-xs text-slate-500">{legende}</p>}

      <p className="mt-4 break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
        {urlValide ? cible : "aucun lien sélectionné"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => telecharger("png")}
          disabled={!urlValide}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          PNG
        </button>
        <button
          type="button"
          onClick={() => telecharger("svg")}
          disabled={!urlValide}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-3 text-sm font-semibold text-green-800 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        >
          <FileCode2 className="h-4 w-4" aria-hidden="true" />
          SVG
        </button>
      </div>

      <button
        type="button"
        onClick={copier}
        disabled={!urlValide}
        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
      >
        {copie ? <Check className="h-4 w-4 text-green-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copie ? "Lien copié" : "Copier le lien encodé"}
      </button>

      {reserves.length > 0 && (
        <ul className="mt-4 space-y-2">
          {reserves.map((texte) => (
            <li key={texte} className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{texte}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
