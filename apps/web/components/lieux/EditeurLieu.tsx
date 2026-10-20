"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Image as ImageIcon,
  Languages,
  Loader2,
  ListChecks,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Star,
  TextCursorInput,
  Trash2,
  Upload,
} from "lucide-react";
import QrPreview from "@/components/qr-generator/QrPreview";
import { STYLE_SIMPLE, type ConfigQr } from "@/components/qr-generator/qrStyles";
import TemplateLieu from "@/components/lieux/TemplateLieu";
import { formatDate, formatOctets } from "@/lib/format";
import {
  MODELES,
  pageExoticas,
  pageLieuVide,
  type DocumentJoint,
  type ImageLieu,
  type PageLieu,
  type ResumeLieu,
} from "@/lib/lieux-modele";
import { useFile } from "@/app/context/FileContext";

interface DocumentStocke {
  slug: string;
  titre: string;
  tailleOctets: number;
  majLe: string;
}

const etiquette = "text-xs font-semibold uppercase tracking-wider text-slate-500";
const champ =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-green-600";
const zone =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-green-600";
const boutonSecondaire =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-green-200 bg-white px-3 text-sm font-medium text-green-900 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50";
const boutonPrincipal =
  "inline-flex h-10 items-center gap-2 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400";
const carte = "rounded-xl border border-green-100 bg-white p-5";

function ChampTexte({
  label,
  valeur,
  onChange,
  indice,
  maxLength,
  multiline,
}: {
  label: string;
  valeur: string;
  onChange: (valeur: string) => void;
  indice?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className={etiquette}>{label}</span>
      {multiline ? (
        <textarea
          className={`${zone} mt-1.5 min-h-28`}
          value={valeur}
          maxLength={maxLength}
          placeholder={indice}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={`${champ} mt-1.5`}
          value={valeur}
          maxLength={maxLength}
          placeholder={indice}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ChampCouleur({
  valeur,
  onChange,
}: {
  valeur: string;
  onChange: (valeur: string) => void;
}) {
  const [texte, setTexte] = useState(valeur);
  const [valeurPrecedente, setValeurPrecedente] = useState(valeur);

  // Pattern React « ajuster l'état pendant le rendu » : le champ texte ralloue la
  // valeur réelle dès qu'elle change ailleurs (puce de couleur, chargement d'une page).
  if (valeurPrecedente !== valeur) {
    setValeurPrecedente(valeur);
    setTexte(valeur);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Couleur d'accent"
        value={/^#[0-9a-f]{6}$/i.test(valeur) ? valeur : "#15803d"}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
      />
      <input
        className={`${champ} w-28 font-mono uppercase`}
        value={texte}
        maxLength={7}
        aria-label="Code hexadécimal de l'accent"
        onChange={(e) => {
          setTexte(e.target.value);
          const brut = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
          if (/^#[0-9a-f]{6}$/i.test(brut)) onChange(brut.toLowerCase());
        }}
      />
    </div>
  );
}

function Interrupteur({
  titre,
  visible,
  onToggle,
  children,
}: {
  titre: string;
  visible: boolean;
  onToggle: (visible: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <section className={carte}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 h-4 w-4 accent-green-700"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900">{titre}</span>
          <span className="block text-xs text-slate-500">
            {visible ? "Affichée sur la page" : "Masquée — décochez pour la remettre"}
          </span>
        </span>
      </label>
      {visible && <div className="mt-4 space-y-4 border-t border-green-50 pt-4">{children}</div>}
    </section>
  );
}

export default function EditeurLieu() {
  const { authToken } = useFile();

  const [lieux, setLieux] = useState<ResumeLieu[]>([]);
  const [documents, setDocuments] = useState<DocumentStocke[]>([]);
  const [backend, setBackend] = useState("");
  const [charge, setCharge] = useState(true);
  const [page, setPage] = useState<PageLieu>(pageExoticas());
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; texte: string } | null>(null);
  const [qrNoir, setQrNoir] = useState(false);
  const [nomFichier, setNomFichier] = useState("");
  const premierChargement = useRef(true);
  // Le slug en cours d'édition, pour qu'un rafraîchissement sache s'il a disparu du stockage.
  const slugEnCours = useRef(page.slug);
  useEffect(() => {
    slugEnCours.current = page.slug;
  }, [page.slug]);

  const chargerLieu = useCallback(async (slug: string) => {
    setMessage(null);
    try {
      const reponse = await fetch(`/api/qr-lieux/${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (!reponse.ok) throw new Error(`réponse ${reponse.status}`);
      const data = await reponse.json();
      setPage(data.page);
    } catch (erreur) {
      setMessage({
        type: "err",
        texte: `Page « ${slug} » indisponible (${erreur instanceof Error ? erreur.message : "erreur réseau"}).`,
      });
    }
  }, []);

  const rafraichir = useCallback(async () => {
    try {
      const [reponseLieux, reponseDocs] = await Promise.all([
        fetch("/api/qr-lieux", { cache: "no-store" }),
        fetch("/api/qr-documents", { cache: "no-store" }),
      ]);
      if (!reponseLieux.ok) throw new Error(`qr-lieux ${reponseLieux.status}`);
      if (!reponseDocs.ok) throw new Error(`qr-documents ${reponseDocs.status}`);

      const dataLieux = await reponseLieux.json();
      const dataDocs = await reponseDocs.json();
      const liste: ResumeLieu[] = dataLieux.lieux ?? [];

      setLieux(liste);
      setBackend(String(dataLieux.backend ?? ""));
      setDocuments(
        (dataDocs.documents ?? []).map((d: DocumentStocke) => ({
          slug: d.slug,
          titre: d.titre,
          tailleOctets: d.tailleOctets,
          majLe: d.majLe,
        })),
      );
      // Première charge : on ouvre la page enregistrée la plus récente, dans son
      // contenu réel (l'état initial ne connaît qu'un slug).
      if (premierChargement.current) {
        premierChargement.current = false;
        if (liste.length > 0) await chargerLieu(liste[0].slug);
      } else if (slugEnCours.current && !liste.some((lieu) => lieu.slug === slugEnCours.current)) {
        setPage(pageLieuVide());
      }
    } catch (erreur) {
      setMessage({
        type: "err",
        texte: `Liste indisponible (${erreur instanceof Error ? erreur.message : "erreur réseau"}).`,
      });
    } finally {
      setCharge(false);
    }
  }, [chargerLieu]);

  useEffect(() => {
    // Microtâche : aucun état posé de façon synchrone dans le corps de l'effet.
    void Promise.resolve().then(() => rafraichir());
  }, [rafraichir]);

  const urlPage = useMemo(() => {
    if (!page.slug) return "";
    const origine = typeof window === "undefined" ? "" : window.location.origin;
    return `${origine}/l/${page.slug}`;
  }, [page.slug]);

  const joints = useMemo<DocumentJoint[]>(
    () =>
      page.documents.slugs
        .map((slug) => documents.find((doc) => doc.slug === slug))
        .filter((doc): doc is DocumentStocke => Boolean(doc))
        .map((doc) => ({ slug: doc.slug, titre: doc.titre, tailleOctets: doc.tailleOctets })),
    [page.documents.slugs, documents],
  );

  const configQr = useMemo<ConfigQr>(
    () => ({ ...STYLE_SIMPLE, modules: qrNoir ? "#000000" : page.accent }),
    [qrNoir, page.accent],
  );

  const maj = <K extends keyof PageLieu>(cle: K, valeur: PageLieu[K]) =>
    setPage((actuel) => ({ ...actuel, [cle]: valeur }));

  const enregistrer = async () => {
    setEnvoi(true);
    setMessage(null);
    try {
      const reponse = await fetch("/api/qr-lieux", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ page, slug: page.slug || undefined }),
        credentials: "include",
      });

      if (reponse.status === 401 || reponse.status === 403) {
        setMessage({
          type: "err",
          texte:
            "Session demandée pour enregistrer. Connectez-vous sur /connexion, ou définissez QR_TOOL_SHARED_TOKEN côté serveur.",
        });
        return;
      }

      const data = await reponse.json().catch(() => ({}));
      if (!reponse.ok) {
        setMessage({ type: "err", texte: data.message ?? "Enregistrement refusé." });
        return;
      }

      setPage(data.page);
      await rafraichir();
      setMessage({
        type: "ok",
        texte: `${data.page.nom} est en ligne sur ${data.urlPage}${data.cree ? " (nouvelle page)" : ""}.`,
      });
    } catch (erreur) {
      setMessage({
        type: "err",
        texte: `Enregistrement impossible (${erreur instanceof Error ? erreur.message : "erreur réseau"}).`,
      });
    } finally {
      setEnvoi(false);
    }
  };

  const televerserImage = async (fichier: File | null, ou: "couverture" | "galerie", legende = "") => {
    if (!fichier) return;
    setEnvoi(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("fichier", fichier);
      if (legende.trim()) form.append("legende", legende.trim());

      const reponse = await fetch(
        `/api/qr-lieux/${encodeURIComponent(page.slug || "brouillon")}/images`,
        {
          method: "POST",
          body: form,
          credentials: "include",
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        },
      );
      const data = await reponse.json().catch(() => ({}));
      if (!reponse.ok) {
        setMessage({ type: "err", texte: data.message ?? "Image refusée." });
        return;
      }

      const image: ImageLieu = data.image;
      // Mise à jour fonctionnelle : plusieurs photos d'affilée ne se écrasent pas.
      if (ou === "couverture") {
        setPage((actuel) => ({ ...actuel, couverture: image }));
      } else {
        setPage((actuel) => ({
          ...actuel,
          galerie: {
            ...actuel.galerie,
            visible: true,
            images: [...actuel.galerie.images, image].slice(0, 12),
          },
        }));
      }
      setMessage({ type: "ok", texte: `« ${image.chemin} » téléversée. Pensez à enregistrer la page.` });
    } catch (erreur) {
      setMessage({
        type: "err",
        texte: `Téléversement impossible (${erreur instanceof Error ? erreur.message : "erreur réseau"}).`,
      });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-green-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-green-700 text-sm font-bold text-white">
              M
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Moncode</p>
              <p className="text-xs text-slate-500">Concepteur de pages d&apos;accueil</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/generateur-qr" className="transition-colors hover:text-green-800">
              QR codes
            </Link>
            <Link href="/" className="transition-colors hover:text-green-800">
              Site
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <section className={carte}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={etiquette}>Pages enregistrées</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void rafraichir()}
                  className="rounded-md p-2 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-800"
                  aria-label="Recharger la liste des pages"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPage({ ...pageLieuVide() });
                    setMessage(null);
                  }}
                  className={boutonSecondaire}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Nouvelle page
                </button>
              </div>
            </div>

            {charge && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Chargement…
              </p>
            )}

            {!charge && (
              <ul className="mt-3 divide-y divide-green-50 overflow-hidden rounded-lg border border-green-100">
                {lieux.map((lieu) => (
                  <li key={lieu.slug} className="flex items-center gap-3 bg-white px-3 py-2.5">
                    <input
                      id={`lieu-${lieu.slug}`}
                      type="radio"
                      name="lieu-edit"
                      checked={page.slug === lieu.slug}
                      onChange={() => void chargerLieu(lieu.slug)}
                      className="h-4 w-4 accent-green-700"
                    />
                    <label htmlFor={`lieu-${lieu.slug}`} className="min-w-0 flex-1 cursor-pointer">
                      <span className="block truncate text-sm font-medium text-slate-800">{lieu.nom}</span>
                      <span className="block truncate text-xs text-slate-500">
                        /l/{lieu.slug} · {lieu.modele} · {formatDate(lieu.majLe)}
                      </span>
                    </label>
                    <a
                      href={`/l/${lieu.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-800"
                      aria-label={`Ouvrir la page de ${lieu.nom}`}
                    >
                      <Languages className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
                {lieux.length === 0 && (
                  <li className="bg-white px-3 py-4 text-sm text-slate-600">
                    Aucune page pour l&apos;instant — remplissez le nom du lieu et enregistrez.
                  </li>
                )}
              </ul>
            )}
          </section>

          <section className={carte}>
            <h2 className={etiquette}>Le lieu</h2>
            <div className="mt-4 space-y-4">
              <ChampTexte
                label="Nom du lieu"
                valeur={page.nom}
                maxLength={80}
                indice="Exoticas"
                onChange={(valeur) => maj("nom", valeur)}
              />
              <ChampTexte
                label="Accroche"
                valeur={page.accroche}
                maxLength={160}
                indice="Bar, terrasse et soirées au bord de l'eau"
                onChange={(valeur) => maj("accroche", valeur)}
              />

              <div>
                <span className={etiquette}>Modèle</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {MODELES.map((modele) => (
                    <button
                      key={modele.id}
                      type="button"
                      onClick={() => maj("modele", modele.id)}
                      aria-pressed={page.modele === modele.id}
                      className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                        page.modele === modele.id
                          ? "border-green-700 bg-green-50"
                          : "border-slate-200 bg-white hover:border-green-300"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-slate-900">{modele.libelle}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{modele.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className={etiquette}>Couleur d&apos;accent</span>
                  <div className="mt-1.5">
                    <ChampCouleur valeur={page.accent} onChange={(valeur) => maj("accent", valeur)} />
                  </div>
                </div>
                <div>
                  <span className={etiquette}>Image de couverture</span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <label className={boutonSecondaire}>
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      {page.couverture ? "Changer" : "Téléverser"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          void televerserImage(e.target.files?.[0] ?? null, "couverture");
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {page.couverture && (
                      <button
                        type="button"
                        onClick={() => maj("couverture", null)}
                        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                        aria-label="Retirer la couverture"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {page.couverture && (
                    <p className="mt-2 truncate text-xs text-slate-500">
                      {page.couverture.chemin} · {formatOctets(page.couverture.tailleOctets)}
                    </p>
                  )}
                </div>
              </div>

              <ChampTexte
                label="Site déjà en ligne du lieu (facultatif)"
                valeur={page.siteExterne}
                indice="https://exoticas.example"
                onChange={(valeur) => maj("siteExterne", valeur)}
              />
              <p className="text-xs leading-5 text-slate-500">
                Si vous renseignez cette adresse, /l/{page.slug || "slug"} ouvre directement le site du
                lieu. Laissez vide pour afficher la page conçue ici.
              </p>
            </div>
          </section>

          <Interrupteur
            titre="À propos"
            visible={page.presentation.visible}
            onToggle={(visible) => maj("presentation", { ...page.presentation, visible })}
          >
            <ChampTexte
              label="Titre"
              valeur={page.presentation.titre}
              maxLength={70}
              onChange={(valeur) => maj("presentation", { ...page.presentation, titre: valeur })}
            />
            <ChampTexte
              label="Texte"
              valeur={page.presentation.texte}
              maxLength={1200}
              multiline
              onChange={(valeur) => maj("presentation", { ...page.presentation, texte: valeur })}
            />
          </Interrupteur>

          <Interrupteur
            titre="Prestations"
            visible={page.prestations.visible}
            onToggle={(visible) => maj("prestations", { ...page.prestations, visible })}
          >
            <ChampTexte
              label="Titre"
              valeur={page.prestations.titre}
              maxLength={70}
              onChange={(valeur) => maj("prestations", { ...page.prestations, titre: valeur })}
            />
            <div className="space-y-3">
              {page.prestations.items.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-green-100 p-3">
                  <div className="flex items-start gap-2">
                    <input
                      className={`${champ} flex-1`}
                      value={item.nom}
                      maxLength={80}
                      placeholder="Carte du midi"
                      aria-label={`Nom de la prestation ${index + 1}`}
                      onChange={(e) =>
                        maj("prestations", {
                          ...page.prestations,
                          items: page.prestations.items.map((actuel, i) =>
                            i === index ? { ...actuel, nom: e.target.value } : actuel,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        maj("prestations", {
                          ...page.prestations,
                          items: page.prestations.items.filter((_, i) => i !== index),
                        })
                      }
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Retirer la prestation ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <textarea
                    className={`${zone} min-h-16`}
                    value={item.detail}
                    maxLength={300}
                    placeholder="Deux lignes sur ce que vous proposez"
                    aria-label={`Détail de la prestation ${index + 1}`}
                    onChange={(e) =>
                      maj("prestations", {
                        ...page.prestations,
                        items: page.prestations.items.map((actuel, i) =>
                          i === index ? { ...actuel, detail: e.target.value } : actuel,
                        ),
                      })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  maj("prestations", {
                    ...page.prestations,
                    items: [...page.prestations.items, { nom: "", detail: "" }].slice(0, 12),
                  })
                }
                className={boutonSecondaire}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Ajouter une prestation
              </button>
            </div>
          </Interrupteur>

          <Interrupteur
            titre="Adresse, horaires et contacts"
            visible={page.infos.visible}
            onToggle={(visible) => maj("infos", { ...page.infos, visible })}
          >
            <ChampTexte
              label="Titre"
              valeur={page.infos.titre}
              maxLength={70}
              onChange={(valeur) => maj("infos", { ...page.infos, titre: valeur })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ChampTexte
                label="Adresse"
                valeur={page.infos.adresse}
                maxLength={200}
                indice="Front de mer, Cotonou"
                onChange={(valeur) => maj("infos", { ...page.infos, adresse: valeur })}
              />
              <ChampTexte
                label="Téléphone"
                valeur={page.infos.telephone}
                maxLength={30}
                indice="+229 01 00 00 00 00"
                onChange={(valeur) => maj("infos", { ...page.infos, telephone: valeur })}
              />
              <ChampTexte
                label="WhatsApp"
                valeur={page.infos.whatsapp}
                maxLength={30}
                onChange={(valeur) => maj("infos", { ...page.infos, whatsapp: valeur })}
              />
            </div>

            <div>
              <span className={etiquette}>Horaires</span>
              <div className="mt-2 space-y-2">
                {page.infos.creneaux.map((creneau, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      className={`${champ} flex-1`}
                      value={creneau.jour}
                      maxLength={40}
                      placeholder="Lundi – Jeudi"
                      aria-label={`Jour ${index + 1}`}
                      onChange={(e) =>
                        maj("infos", {
                          ...page.infos,
                          creneaux: page.infos.creneaux.map((actuel, i) =>
                            i === index ? { ...actuel, jour: e.target.value } : actuel,
                          ),
                        })
                      }
                    />
                    <input
                      className={`${champ} flex-1`}
                      value={creneau.heure}
                      maxLength={60}
                      placeholder="11h – 23h"
                      aria-label={`Heures ${index + 1}`}
                      onChange={(e) =>
                        maj("infos", {
                          ...page.infos,
                          creneaux: page.infos.creneaux.map((actuel, i) =>
                            i === index ? { ...actuel, heure: e.target.value } : actuel,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        maj("infos", {
                          ...page.infos,
                          creneaux: page.infos.creneaux.filter((_, i) => i !== index),
                        })
                      }
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Retirer le créneau ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    maj("infos", {
                      ...page.infos,
                      creneaux: [...page.infos.creneaux, { jour: "", heure: "" }].slice(0, 8),
                    })
                  }
                  className={boutonSecondaire}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Ajouter un créneau
                </button>
              </div>
            </div>

            <div>
              <span className={etiquette}>Réseaux sociaux</span>
              <div className="mt-2 space-y-2">
                {page.infos.reseaux.map((reseau, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      className={`${champ} w-32 shrink-0`}
                      value={reseau.libelle}
                      maxLength={30}
                      placeholder="Instagram"
                      aria-label={`Libellé ${index + 1}`}
                      onChange={(e) =>
                        maj("infos", {
                          ...page.infos,
                          reseaux: page.infos.reseaux.map((actuel, i) =>
                            i === index ? { ...actuel, libelle: e.target.value } : actuel,
                          ),
                        })
                      }
                    />
                    <input
                      className={`${champ} flex-1`}
                      value={reseau.url}
                      maxLength={300}
                      placeholder="instagram.com/exoticas"
                      aria-label={`URL ${index + 1}`}
                      onChange={(e) =>
                        maj("infos", {
                          ...page.infos,
                          reseaux: page.infos.reseaux.map((actuel, i) =>
                            i === index ? { ...actuel, url: e.target.value } : actuel,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        maj("infos", {
                          ...page.infos,
                          reseaux: page.infos.reseaux.filter((_, i) => i !== index),
                        })
                      }
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Retirer le réseau ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    maj("infos", {
                      ...page.infos,
                      reseaux: [...page.infos.reseaux, { libelle: "", url: "" }].slice(0, 6),
                    })
                  }
                  className={boutonSecondaire}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Ajouter un réseau
                </button>
              </div>
            </div>
          </Interrupteur>

          <Interrupteur
            titre="Galerie"
            visible={page.galerie.visible}
            onToggle={(visible) => maj("galerie", { ...page.galerie, visible })}
          >
            <ChampTexte
              label="Titre"
              valeur={page.galerie.titre}
              maxLength={70}
              onChange={(valeur) => maj("galerie", { ...page.galerie, titre: valeur })}
            />
            <div className="flex items-center gap-2">
              <label className={boutonSecondaire}>
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                Ajouter des photos
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const fichiers = Array.from(e.target.files ?? []).slice(0, 6);
                    void (async () => {
                      for (const fichier of fichiers) await televerserImage(fichier, "galerie");
                    })();
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-slate-500">PNG, JPEG ou WebP — 12 photos maximum.</span>
            </div>
            {page.galerie.images.length > 0 && (
              <ul className="grid grid-cols-3 gap-2">
                {page.galerie.images.map((image, index) => (
                  <li key={`${image.chemin}-${index}`} className="relative">
                    <img
                      src={`/api/qr-lieux/${encodeURIComponent(page.slug || "brouillon")}/image/${encodeURIComponent(image.chemin)}`}
                      alt={image.legende || `Photo ${index + 1}`}
                      className="aspect-square w-full rounded-lg border border-green-100 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        maj("galerie", {
                          ...page.galerie,
                          images: page.galerie.images.filter((_, i) => i !== index),
                        })
                      }
                      className="absolute right-1 top-1 rounded-md bg-white p-1.5 text-slate-500 transition-colors hover:text-red-700"
                      aria-label={`Retirer la photo ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Interrupteur>

          <Interrupteur
            titre="Documents joints"
            visible={page.documents.visible}
            onToggle={(visible) => maj("documents", { ...page.documents, visible })}
          >
            <ChampTexte
              label="Titre"
              valeur={page.documents.titre}
              maxLength={70}
              onChange={(valeur) => maj("documents", { ...page.documents, titre: valeur })}
            />
            {documents.length === 0 ? (
              <p className="rounded-lg border border-dashed border-green-200 px-3 py-3 text-sm text-slate-600">
                Aucun PDF sur nos serveurs. Téléversez-en depuis le{" "}
                <Link href="/generateur-qr" className="font-medium text-green-800 underline-offset-2 hover:underline">
                  générateur de QR codes
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-green-50 overflow-hidden rounded-lg border border-green-100">
                {documents.map((document) => {
                  const coche = page.documents.slugs.includes(document.slug);
                  return (
                    <li key={document.slug} className="flex items-center gap-3 bg-white px-3 py-2.5">
                      <input
                        id={`joint-${document.slug}`}
                        type="checkbox"
                        checked={coche}
                        onChange={(e) =>
                          maj("documents", {
                            ...page.documents,
                            slugs: e.target.checked
                              ? [...page.documents.slugs, document.slug].slice(0, 8)
                              : page.documents.slugs.filter((slug) => slug !== document.slug),
                          })
                        }
                        className="h-4 w-4 accent-green-700"
                      />
                      <label htmlFor={`joint-${document.slug}`} className="min-w-0 flex-1 cursor-pointer">
                        <span className="block truncate text-sm font-medium text-slate-800">{document.titre}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {formatOctets(document.tailleOctets)} · /d/{document.slug}
                        </span>
                      </label>
                      {coche && <Check className="h-4 w-4 text-green-700" aria-hidden="true" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </Interrupteur>

          <section className={carte}>
            <h2 className={etiquette}>Référencement</h2>
            <div className="mt-4 space-y-4">
              <ChampTexte
                label="Titre de l'onglet"
                valeur={page.seo.titre}
                maxLength={120}
                onChange={(valeur) => maj("seo", { ...page.seo, titre: valeur })}
              />
              <ChampTexte
                label="Description"
                valeur={page.seo.description}
                maxLength={200}
                multiline
                onChange={(valeur) => maj("seo", { ...page.seo, description: valeur })}
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={page.seo.noindex}
                  onChange={(e) => maj("seo", { ...page.seo, noindex: e.target.checked })}
                  className="h-4 w-4 accent-green-700"
                />
                Ne pas indexer cette page (brouillon en cours)
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className={carte}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={etiquette}>Enregistrer</h2>
              <button
                type="button"
                onClick={() => void enregistrer()}
                disabled={envoi || !page.nom.trim()}
                className={boutonPrincipal}
              >
                {envoi ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                Enregistrer la page
              </button>
            </div>
            {message && (
              <p
                className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                  message.type === "ok"
                    ? "bg-green-50 text-green-900"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message.type === "ok" && (
                  <Check className="mr-1 inline h-4 w-4" aria-hidden="true" />
                )}
                {message.texte}
              </p>
            )}
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Slug : <span className="font-mono">{page.slug || "attribué à l'enregistrement"}</span> ·
              stockage actif : {backend === "supabase" ? "Supabase" : backend === "disque" ? "dossier du serveur" : "…"}
            </p>
          </section>

          <section className={carte}>
            <h2 className={etiquette}>QR de la page</h2>
            {page.slug ? (
              <QrPreview
                cible={urlPage}
                config={configQr}
                nomFichier={nomFichier || `qr-${page.slug}-accueil`}
                legende={`Page d'accueil de ${page.nom}`}
              />
            ) : (
              <p className="mt-3 rounded-lg border border-dashed border-green-200 px-3 py-4 text-sm text-slate-600">
                Enregistrez d&apos;abord la page : le QR code est établi sur son adresse définitive
                /l/<span className="font-mono">slug</span>, qui ne changera plus.
              </p>
            )}
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={qrNoir}
                onChange={(e) => setQrNoir(e.target.checked)}
                className="h-4 w-4 accent-green-700"
              />
              QR noir (le plus fiable à imprimer petit)
            </label>
            <label className="mt-3 block">
              <span className={etiquette}>Nom du fichier téléchargé</span>
              <input
                className={`${champ} mt-1.5`}
                value={nomFichier}
                placeholder="qr-exoticas-accueil"
                onChange={(e) => setNomFichier(e.target.value)}
              />
            </label>
          </section>

          <section className={`${carte} overflow-hidden`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={etiquette}>Aperçu</h2>
              <span className="text-xs text-slate-500">
                modèle {MODELES.find((m) => m.id === page.modele)?.libelle}
              </span>
            </div>
            <div className="mt-4 overflow-x-auto rounded-lg border border-green-100 bg-white">
              <div className="min-w-[320px] max-w-[420px]">
                <TemplateLieu page={page} documents={joints} />
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Seules les sections cochées et remplies apparaissent. L&apos;aperçu montre le brouillon
              tel qu&apos;il sera publié.
            </p>
          </section>

          <section className={carte}>
            <h2 className={etiquette}>Rappels</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                L&apos;adresse /l/<span className="font-mono">slug</span> reste la même à chaque
                enregistrement : un QR imprimé garde sa validité.
              </li>
              <li className="flex gap-2">
                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                Les photos téléversées sont stockées avec la page, sur nos serveurs.
              </li>
              <li className="flex gap-2">
                <TextCursorInput className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                Un PDF joint ouvre la page /d/<span className="font-mono">slug</span> du document.
              </li>
              <li className="flex gap-2">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                Vérifiez le rendu sur un téléphone avant d&apos;imprimer le QR en série.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
