"use client";

import { useState } from "react";
import {
  CORRECTIONS,
  FORMES_COINS,
  MOTIFS,
  PRESETS,
  STYLE_PERSONNALISE,
  STYLE_SIMPLE,
  TAILLES_EXPORT,
  normaliseHex,
  type ConfigQr,
  type FormeCoins,
  type MotifPoints,
  type NiveauCorrection,
} from "./qrStyles";

export type ModeQr = "simple" | "personnalise";

interface Props {
  mode: ModeQr;
  surMode: (mode: ModeQr) => void;
  config: ConfigQr;
  surConfig: (config: ConfigQr) => void;
  logo: string | null;
  surLogo: (logo: string | null) => void;
}

const etiquette = "text-xs font-semibold uppercase tracking-wider text-slate-500";
const champ =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-green-600";

function ChampCouleur({
  legende,
  valeur,
  onChange,
}: {
  legende: string;
  valeur: string;
  onChange: (hex: string) => void;
}) {
  const [texte, setTexte] = useState(valeur);
  const [reference, setReference] = useState(valeur);
  if (reference !== valeur) {
    // Un préréglage a changé la couleur : on resynchronise le champ pendant le rendu,
    // sans effet intermédiaire.
    setReference(valeur);
    setTexte(valeur);
  }

  return (
    <div>
      <span className={etiquette}>{legende}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          aria-label={legende}
          value={normaliseHex(valeur, "#000000")}
          onChange={(e) => {
            setTexte(e.target.value);
            onChange(e.target.value);
          }}
          className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
        <input
          type="text"
          aria-label={`${legende} (code hexadécimal)`}
          value={texte}
          onChange={(e) => {
            const brut = e.target.value;
            setTexte(brut);
            const hex = normaliseHex(brut, "");
            if (hex) onChange(hex);
          }}
          onBlur={() => setTexte(normaliseHex(valeur, valeur))}
          className={`${champ} font-mono uppercase`}
        />
      </div>
    </div>
  );
}

function Select<T extends string | number>({
  legende,
  valeur,
  options,
  onChange,
}: {
  legende: string;
  valeur: T;
  options: { valeur: T; libelle: string }[];
  onChange: (valeur: T) => void;
}) {
  return (
    <label className="block">
      <span className={etiquette}>{legende}</span>
      <select
        value={String(valeur)}
        onChange={(e) => {
          const trouvée = options.find((o) => String(o.valeur) === e.target.value);
          if (trouvée) onChange(trouvée.valeur);
        }}
        className={`${champ} mt-2 appearance-none`}
      >
        {options.map((option) => (
          <option key={String(option.valeur)} value={String(option.valeur)}>
            {option.libelle}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function StylePanel({ mode, surMode, config, surConfig, logo, surLogo }: Props) {
  const maj = (partiel: Partial<ConfigQr>) => surConfig({ ...config, ...partiel });

  const chargerLogo = (fichier: File | undefined) => {
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) return;
    if (fichier.size > 800 * 1024) return;
    const lecteur = new FileReader();
    lecteur.onload = () => surLogo(typeof lecteur.result === "string" ? lecteur.result : null);
    lecteur.readAsDataURL(fichier);
  };

  return (
    <section className="rounded-xl border border-green-100 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Style du QR code
        </h2>
        <div className="inline-flex rounded-lg border border-green-200 bg-green-50/60 p-1">
          {(["simple", "personnalise"] as ModeQr[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              onClick={() => surMode(valeur)}
              aria-pressed={mode === valeur}
              className={`h-8 rounded-md px-3 text-sm font-medium transition-colors ${
                mode === valeur
                  ? "bg-green-700 text-white"
                  : "text-green-900/70 hover:bg-white"
              }`}
            >
              {valeur === "simple" ? "Simple" : "Personnalisé"}
            </button>
          ))}
        </div>
      </div>

      {mode === "simple" ? (
        <>
          <p className="mt-3 text-sm text-slate-600">
            Modules noirs sur fond blanc, motif carré, marge confortable&nbsp;: le réglage qui se
            scanne partout, même imprimé petit ou mal éclairé.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              legende="Taille du fichier"
              valeur={config.export}
              options={TAILLES_EXPORT}
              onChange={(valeur) => maj({ export: valeur as ConfigQr["export"] })}
            />
            <label className="block">
              <span className={etiquette}>Marge autour du QR</span>
              <input
                type="range"
                min={0}
                max={40}
                step={4}
                value={config.marge}
                onChange={(e) => maj({ marge: Number(e.target.value) })}
                className="mt-4 h-1 w-full accent-green-700"
              />
              <span className="mt-1 block text-xs text-slate-500">{config.marge} px</span>
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              surConfig(STYLE_SIMPLE);
              surLogo(null);
            }}
            className="mt-4 text-sm font-medium text-green-800 underline underline-offset-4 hover:text-green-900"
          >
            Revenir au QR simple de référence
          </button>
        </>
      ) : (
        <>
          <div className="mt-4">
            <span className={etiquette}>Palettes prêtes</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => {
                const actif =
                  preset.config.modules === config.modules &&
                  preset.config.fond === config.fond &&
                  preset.config.motifPoints === config.motifPoints;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => surConfig({ ...preset.config, marge: config.marge, export: config.export })}
                    aria-pressed={actif}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      actif
                        ? "border-green-700 bg-green-50 text-green-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50/50"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-sm border border-black/10"
                      style={{ backgroundColor: preset.config.modules }}
                      aria-hidden="true"
                    />
                    {preset.nom}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ChampCouleur
              legende="Couleur des modules"
              valeur={config.modules}
              onChange={(hex) => maj({ modules: hex })}
            />
            <ChampCouleur
              legende="Couleur du fond"
              valeur={config.fond}
              onChange={(hex) => maj({ fond: hex })}
            />
            <Select
              legende="Motif des points"
              valeur={config.motifPoints}
              options={MOTIFS}
              onChange={(valeur) => maj({ motifPoints: valeur as MotifPoints })}
            />
            <Select
              legende="Forme des coins"
              valeur={config.formeCoins}
              options={FORMES_COINS}
              onChange={(valeur) => maj({ formeCoins: valeur as FormeCoins })}
            />
            <Select
              legende="Tolérance aux dégradations"
              valeur={config.correction}
              options={CORRECTIONS}
              onChange={(valeur) => maj({ correction: valeur as NiveauCorrection })}
            />
            <Select
              legende="Taille du fichier"
              valeur={config.export}
              options={TAILLES_EXPORT}
              onChange={(valeur) => maj({ export: valeur as ConfigQr["export"] })}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className={etiquette}>Logo au centre (optionnel)</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => chargerLogo(e.target.files?.[0])}
                className="mt-2 block h-10 w-56 cursor-pointer rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:h-10 file:cursor-pointer file:border-0 file:bg-green-50 file:px-3 file:text-sm file:font-medium file:text-green-900"
              />
            </label>
            {logo && (
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-green-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt="Logo choisi" className="max-h-8 max-w-8 object-contain" />
                </span>
                <button
                  type="button"
                  onClick={() => surLogo(null)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Retirer
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                surConfig({ ...STYLE_PERSONNALISE, export: config.export, marge: config.marge });
                surLogo(null);
              }}
              className="h-10 rounded-lg px-3 text-sm font-medium text-green-800 underline underline-offset-4 hover:text-green-900"
            >
              Repartir de la personnalisation par défaut
            </button>
          </div>
        </>
      )}
    </section>
  );
}
