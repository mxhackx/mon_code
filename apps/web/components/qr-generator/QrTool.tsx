"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Link2, Loader2, MapPin, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { formatDate, formatOctets } from "@/lib/format";
import { useFile } from "@/app/context/FileContext";
import QrPreview from "./QrPreview";
import StylePanel, { type ModeQr } from "./StylePanel";
import { STYLE_PERSONNALISE, STYLE_SIMPLE, type ConfigQr } from "./qrStyles";

interface DocumentStocke {
  slug: string;
  titre: string;
  fileName: string;
  tailleOctets: number;
  majLe: string;
  backend: string;
  urlQr: string;
}

/** Page d'accueil de lieu déjà enregistrée dans le concepteur. */
interface PageDeLieu {
  slug: string;
  nom: string;
  accroche: string;
  urlPage: string;
}

type Onglet = "pdf" | "lieu" | "lien";

const etiquette = "text-xs font-semibold uppercase tracking-wider text-slate-500";
const champ =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-green-600";
const boutonSecondaire =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-green-200 bg-white px-3 text-sm font-medium text-green-900 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50";
const boutonPrincipal =
  "inline-flex h-10 items-center gap-2 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400";

function normaliserLien(valeur: string): string {
  const brut = valeur.trim();
  if (!brut) return "";
  const avecSchema = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(brut) ? brut : `https://${brut}`;
  try {
    const url = new URL(avecSchema);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export default function QrTool() {
  const { authToken } = useFile();

  const [mode, setMode] = useState<ModeQr>("simple");
  const [configSimple, setConfigSimple] = useState<ConfigQr>(STYLE_SIMPLE);
  const [configPerso, setConfigPerso] = useState<ConfigQr>(STYLE_PERSONNALISE);
  const [logo, setLogo] = useState<string | null>(null);
  const [nomFichier, setNomFichier] = useState("");

  const [onglet, setOnglet] = useState<Onglet>("pdf");
  const [documents, setDocuments] = useState<DocumentStocke[]>([]);
  const [backend, setBackend] = useState<string>("");
  const [chargement, setChargement] = useState(true);
  const [selection, setSelection] = useState<string>("");
  const [pages, setPages] = useState<PageDeLieu[]>([]);

  const [fichier, setFichier] = useState<File | null>(null);
  const [titre, setTitre] = useState("");
  const [remplacer, setRemplacer] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; texte: string } | null>(null);

  const [lieuSlug, setLieuSlug] = useState("");
  const [adresseLibre, setAdresseLibre] = useState("");
  const [lienLibre, setLienLibre] = useState("");

  const rafraichirListe = useCallback(async () => {
    try {
      const [reponse, reponseLieux] = await Promise.all([
        fetch("/api/qr-documents", { cache: "no-store" }),
        fetch("/api/qr-lieux", { cache: "no-store" }),
      ]);
      if (!reponse.ok) throw new Error(`réponse ${reponse.status}`);
      const data = await reponse.json();
      const liste: DocumentStocke[] = data.documents ?? [];
      setDocuments(liste);
      setBackend(String(data.backend ?? ""));
      setSelection((actuel) => (liste.some((d) => d.slug === actuel) ? actuel : liste[0]?.slug ?? ""));

      if (reponseLieux.ok) {
        const dataLieux = await reponseLieux.json();
        const pages: PageDeLieu[] = (dataLieux.lieux ?? []).map((l: PageDeLieu) => ({
          slug: l.slug,
          nom: l.nom,
          accroche: l.accroche ?? "",
          urlPage: l.urlPage,
        }));
        setPages(pages);
        setLieuSlug((actuel) =>
          pages.some((page) => page.slug === actuel) ? actuel : (pages[0]?.slug ?? ""),
        );
      }
    } catch (erreur) {
      setMessage({
        type: "err",
        texte: `Liste des PDF indisponible (${erreur instanceof Error ? erreur.message : "erreur réseau"}).`,
      });
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    // Microtâche : le corps de l'effet ne pose aucun état de façon synchrone.
    void Promise.resolve().then(() => rafraichirListe());
  }, [rafraichirListe]);

  const televerser = async () => {
    if (!fichier) return;
    setEnvoiEnCours(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("fichier", fichier);
      if (titre.trim()) form.append("titre", titre.trim());
      if (remplacer && selection) form.append("slug", selection);

      const reponse = await fetch("/api/qr-documents", {
        method: "POST",
        body: form,
        credentials: "include",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });

      if (reponse.status === 401 || reponse.status === 403) {
        setMessage({
          type: "err",
          texte: "Session demandée pour téléverser. Connectez-vous sur /connexion, ou définissez QR_TOOL_SHARED_TOKEN côté serveur.",
        });
        return;
      }
      const data = await reponse.json().catch(() => ({}));
      if (!reponse.ok) {
        setMessage({ type: "err", texte: data.message ?? "Téléversement refusé." });
        return;
      }

      const nouveau: DocumentStocke = data.document;
      await rafraichirListe();
      setSelection(nouveau.slug);
      setFichier(null);
      setTitre("");
      setRemplacer(false);
      setMessage({
        type: "ok",
        texte: remplacer
          ? `« ${nouveau.titre} » remplacé : son QR code existe déjà, gardez le même lien.`
          : `« ${nouveau.titre} » est en ligne à l'adresse ${nouveau.urlQr}`,
      });
      // remet la ref du champ fichier pour pouvoir retéléverser le même nom
      const champFichier = document.getElementById("qr-fichier") as HTMLInputElement | null;
      if (champFichier) champFichier.value = "";
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const supprimer = async (slug: string) => {
    setMessage(null);
    const reponse = await fetch(`/api/qr-documents/${slug}`, {
      method: "DELETE",
      credentials: "include",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
    if (reponse.status === 401 || reponse.status === 403) {
      setMessage({ type: "err", texte: "Suppression réservée : connectez-vous sur /connexion." });
      return;
    }
    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setMessage({ type: "err", texte: data.message ?? "Suppression impossible." });
      return;
    }
    await rafraichirListe();
  };

  const config = mode === "simple" ? configSimple : configPerso;
  const surConfig = (prochaine: ConfigQr) =>
    mode === "simple" ? setConfigSimple(prochaine) : setConfigPerso(prochaine);

  const documentChoisi = documents.find((d) => d.slug === selection) ?? null;
  const pageChoisie = pages.find((l) => l.slug === lieuSlug) ?? null;
  // L'adresse d'une page enregistrée, sauf retouche manuelle dans le champ.
  const adresseEnceree = adresseLibre.trim() || pageChoisie?.urlPage || "";

  const { cible, legende } = useMemo(() => {
    if (onglet === "pdf") {
      return {
        cible: documentChoisi?.urlQr ?? "",
        legende: documentChoisi ? `PDF « ${documentChoisi.titre} »` : "Aucun PDF sélectionné",
      };
    }
    if (onglet === "lieu") {
      return {
        cible: normaliserLien(adresseEnceree),
        legende: pageChoisie
          ? `${pageChoisie.nom}${pageChoisie.accroche ? ` — ${pageChoisie.accroche}` : ""}`
          : "Page du lieu",
      };
    }
    return { cible: normaliserLien(lienLibre), legende: "Lien personnalisé" };
  }, [onglet, documentChoisi, pageChoisie, adresseEnceree, lienLibre]);

  const onglets: { id: Onglet; libelle: string; icone: typeof FileText }[] = [
    { id: "pdf", libelle: "Un PDF", icone: FileText },
    { id: "lieu", libelle: "Un lieu", icone: MapPin },
    { id: "lien", libelle: "Un lien", icone: Link2 },
  ];

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
              <p className="text-xs text-slate-500">Générateur de QR codes</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/concepteur-accueil" className="transition-colors hover:text-green-800">
              Accueil d&apos;un lieu
            </Link>
            <Link href="/" className="transition-colors hover:text-green-800">
              Site
            </Link>
            <Link href="/connexion" className="transition-colors hover:text-green-800">
              Compte
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-green-100 bg-white p-5">
            <h2 className={etiquette}>Que doit ouvrir le QR code&nbsp;?</h2>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {onglets.map(({ id, libelle, icone: Icone }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOnglet(id)}
                  aria-pressed={onglet === id}
                  className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-sm font-medium transition-colors ${
                    onglet === id
                      ? "border-green-700 bg-green-50 text-green-900"
                      : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50/40"
                  }`}
                >
                  <Icone className="h-4 w-4" aria-hidden="true" />
                  {libelle}
                </button>
              ))}
            </div>

            {onglet === "pdf" && (
              <div className="mt-5 space-y-5">
                <div className="space-y-3">
                  <span className={etiquette}>PDF en ligne</span>
                  {chargement && (
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Chargement…
                    </p>
                  )}
                  {!chargement && documents.length === 0 && (
                    <p className="rounded-lg border border-dashed border-green-200 bg-green-50/40 px-3 py-4 text-sm text-slate-600">
                      Aucun PDF sur nos serveurs pour l&apos;instant. Téléversez-en un juste en dessous.
                    </p>
                  )}
                  {!chargement && documents.length > 0 && (
                    <ul className="divide-y divide-green-50 overflow-hidden rounded-lg border border-green-100">
                      {documents.map((document) => (
                        <li key={document.slug} className="flex items-center gap-3 bg-white px-3 py-2.5">
                          <input
                            id={`doc-${document.slug}`}
                            type="radio"
                            name="document-qr"
                            checked={selection === document.slug}
                            onChange={() => setSelection(document.slug)}
                            className="h-4 w-4 accent-green-700"
                          />
                          <label htmlFor={`doc-${document.slug}`} className="min-w-0 flex-1 cursor-pointer">
                            <span className="block truncate text-sm font-medium text-slate-800">{document.titre}</span>
                            <span className="block truncate text-xs text-slate-500">
                              {formatOctets(document.tailleOctets)} · {formatDate(document.majLe)} · /d/{document.slug}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => supprimer(document.slug)}
                            aria-label={`Retirer ${document.titre}`}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setChargement(true);
                        void rafraichirListe();
                      }}
                      className={boutonSecondaire}
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      Recharger la liste
                    </button>
                    {documentChoisi && (
                      <a href={documentChoisi.urlQr} target="_blank" rel="noreferrer" className="text-green-800 underline underline-offset-4">
                        Voir ce document
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-green-100 pt-5">
                  <span className={etiquette}>Téléverser un PDF</span>
                  <div className="mt-2 space-y-3">
                    <input
                      id="qr-fichier"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
                      className="block h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:rounded-l-lg file:bg-green-50 file:px-4 file:text-sm file:font-medium file:text-green-900"
                    />
                    <input
                      type="text"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      placeholder={fichier ? `Titre du document (par défaut : ${fichier.name})` : "Titre du document"}
                      className={champ}
                    />
                    {documentChoisi && (
                      <label className="flex items-start gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={remplacer}
                          onChange={(e) => setRemplacer(e.target.checked)}
                          className="mt-0.5 h-4 w-4 accent-green-700"
                        />
                        <span>
                          Remplacer « {documentChoisi.titre} » plutôt que créer&nbsp;: son QR code déjà imprimé
                          ouvrira le nouveau fichier, sans rien changer.
                        </span>
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={televerser}
                      disabled={!fichier || envoiEnCours}
                      className={boutonPrincipal}
                    >
                      {envoiEnCours ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Upload className="h-4 w-4" aria-hidden="true" />
                      )}
                      {envoiEnCours ? "Envoi en cours…" : remplacer ? "Remplacer ce PDF" : "Mettre en ligne"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {onglet === "lieu" && (
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <span className={etiquette}>Pages d&apos;accueil enregistrées</span>
                  {chargement && (
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Chargement…
                    </p>
                  )}
                  {!chargement && pages.length === 0 && (
                    <p className="rounded-lg border border-dashed border-green-200 bg-green-50/40 px-3 py-4 text-sm text-slate-600">
                      Aucune page de lieu sur nos serveurs pour l&apos;instant. Composez-la dans le{" "}
                      <Link
                        href="/concepteur-accueil"
                        className="font-medium text-green-800 underline underline-offset-4"
                      >
                        concepteur d&apos;accueil
                      </Link>
                      , elle apparaîtra ici.
                    </p>
                  )}
                  {!chargement && pages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pages.map((lieu) => (
                        <button
                          key={lieu.slug}
                          type="button"
                          onClick={() => {
                            setLieuSlug(lieu.slug);
                            setAdresseLibre("");
                          }}
                          aria-pressed={lieuSlug === lieu.slug}
                          className={`flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                            lieuSlug === lieu.slug
                              ? "border-green-700 bg-green-50 text-green-900"
                              : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50/40"
                          }`}
                        >
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          {lieu.nom}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className={etiquette}>Adresse à encoder</span>
                  <input
                    type="text"
                    inputMode="url"
                    value={adresseEnceree}
                    onChange={(e) => setAdresseLibre(e.target.value)}
                    placeholder="/l/exoticas"
                    className={`${champ} mt-2`}
                  />
                </label>
                <p className="text-xs leading-5 text-slate-500">
                  {pageChoisie
                    ? `Le QR ouvre /l/${pageChoisie.slug}, l’adresse de la page conçue ici. Elle ne change pas quand vous refaites la page : un QR déjà imprimé garde sa validité.`
                    : "Sélectionnez une page, ou remplacez l’adresse par celle d’un autre site."}{" "}
                  <Link
                    href="/concepteur-accueil"
                    className="font-medium text-green-800 underline underline-offset-4"
                  >
                    Concevoir une page d&apos;accueil
                  </Link>
                  .
                </p>
              </div>
            )}

            {onglet === "lien" && (
              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className={etiquette}>Adresse complète</span>
                  <input
                    type="text"
                    inputMode="url"
                    value={lienLibre}
                    onChange={(e) => setLienLibre(e.target.value)}
                    placeholder="https://exoticas.example/carte-des-cocktails"
                    className={`${champ} mt-2`}
                  />
                </label>
                <p className="text-xs text-slate-500">
                  N&apos;importe quelle page, la vôtre ou celle d&apos;un partenaire. Un lien court donne un QR
                  plus aéré, donc plus facile à scanner.
                </p>
              </div>
            )}

            {message && (
              <p
                className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                  message.type === "ok"
                    ? "border-green-200 bg-green-50 text-green-900"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {message.texte}
              </p>
            )}
          </section>

          <StylePanel
            mode={mode}
            surMode={setMode}
            config={config}
            surConfig={surConfig}
            logo={logo}
            surLogo={setLogo}
          />

          <section className="rounded-xl border border-green-100 bg-white p-5">
            <label className="block">
              <span className={etiquette}>Nom du fichier téléchargé</span>
              <div className="mt-2 flex items-center gap-2">
                <Plus className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  value={nomFichier}
                  onChange={(e) => setNomFichier(e.target.value)}
                  placeholder="qr-exoticas-accueil"
                  className={champ}
                />
              </div>
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Utilisé pour les fichiers téléchargés, en minuscules sans espaces&nbsp;:{" "}
              <span className="font-mono">qr-exoticas-accueil.png</span> et{" "}
              <span className="font-mono">.svg</span>.
            </p>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <QrPreview
            cible={cible}
            config={config}
            logo={mode === "personnalise" ? logo : null}
            nomFichier={nomFichier}
            legende={legende}
          />

          <section className="rounded-xl border border-green-100 bg-green-50/40 p-5">
            <h2 className={etiquette}>Pour un QR qui scanne du premier coup</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Imprimez au moins 3 cm de côté pour une table, 5 cm pour une vitrine.</li>
              <li>Laissez de l&apos;espace clair autour : le fond blanc du QR fait partie du code.</li>
              <li>Un PDF remplacé garde le même lien : pas besoin de réimprimer un QR.</li>
              <li>Vérifiez avec deux téléphones différents avant d&apos;imprimer en série.</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Stockage actif&nbsp;: {backend === "supabase" ? "bucket Supabase" : "dossier de stockage du serveur"}
              {" "}· les QR pointent sur /d/&lt;slug&gt; pour un PDF et /l/&lt;slug&gt; pour une page d&apos;accueil.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
