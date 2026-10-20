import Link from "next/link";
import { formatOctets } from "@/lib/format";
import type { DocumentJoint, PageLieu } from "@/lib/lieux-modele";

/**
 * Gabarits des pages d'accueil de lieu. Complètement indépendant du stockage : il reçoit la
 * page et les PDF déjà résolus, donc il sert aussi bien à la page publiée `/l/<slug>` qu'à
 * l'aperçu de l'éditeur.
 *
 * Trois gabarits, mêmes sections, même palette vert et blanc :
 *  - sobre   : une colonne, nom et accroche sur blanc, filet vert ;
 *  - liste   : prestations numérotées, pensées pour être parcourues vite ;
 *  - vitrine : grande image, bandeau de nom en vert, sections à la suite.
 *
 * Une section cochée mais vide n'est pas rendue : rien ne clignote en titre sans contenu.
 */

interface Props {
  page: PageLieu;
  documents: DocumentJoint[];
}

function urlImage(page: PageLieu, chemin: string): string {
  const slug = page.slug || "brouillon";
  return `/api/qr-lieux/${encodeURIComponent(slug)}/image/${encodeURIComponent(chemin)}`;
}

function chiffresTelephone(valeur: string): string {
  return valeur.replace(/[^\d+]/g, "");
}

function TitreSection({ children, accent }: { children: string; accent: string }) {
  return (
    <h2 className="text-xl font-bold tracking-tight text-slate-900">
      <span className="mr-2 inline-block h-[3px] w-6 align-middle" style={{ backgroundColor: accent }} />
      {children}
    </h2>
  );
}

function BlocPresentation({ page }: { page: PageLieu }) {
  const section = page.presentation;
  if (!section.visible || !section.texte) return null;
  return (
    <section className="mt-10">
      {section.titre && <TitreSection accent={page.accent}>{section.titre}</TitreSection>}
      <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-600">{section.texte}</p>
    </section>
  );
}

function BlocPrestations({ page }: { page: PageLieu }) {
  const section = page.prestations;
  if (!section.visible || section.items.length === 0) return null;

  if (page.modele === "liste") {
    return (
      <section className="mt-10">
        {section.titre && <TitreSection accent={page.accent}>{section.titre}</TitreSection>}
        <ol className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
          {section.items.map((item, index) => (
            <li key={`${item.nom}-${index}`} className="flex gap-4 py-4">
              <span
                className="w-6 shrink-0 text-sm font-bold tabular-nums"
                style={{ color: page.accent }}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{item.nom || "—"}</h3>
                {item.detail && <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section className="mt-10">
      {section.titre && <TitreSection accent={page.accent}>{section.titre}</TitreSection>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {section.items.map((item, index) => (
          <div key={`${item.nom}-${index}`} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-900">{item.nom || "—"}</h3>
            {item.detail && <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function BlocInfos({ page }: { page: PageLieu }) {
  const section = page.infos;
  const ligneWhatsApp = chiffresTelephone(section.whatsapp).replace(/\D/g, "");
  const aRien =
    !section.adresse &&
    section.creneaux.length === 0 &&
    !section.telephone &&
    !section.whatsapp &&
    section.reseaux.length === 0;
  if (!section.visible || aRien) return null;

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
      {section.titre && <TitreSection accent={page.accent}>{section.titre}</TitreSection>}
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 text-sm">
          {section.adresse && (
            <div>
              <p className="font-semibold text-slate-900">Adresse</p>
              <p className="mt-1 leading-6 text-slate-600">{section.adresse}</p>
            </div>
          )}
          {section.telephone && (
            <div>
              <p className="font-semibold text-slate-900">Téléphone</p>
              <a
                href={`tel:${chiffresTelephone(section.telephone)}`}
                className="mt-1 inline-block leading-6"
                style={{ color: page.accent }}
              >
                {section.telephone}
              </a>
            </div>
          )}
          {section.whatsapp && ligneWhatsApp && (
            <div>
              <p className="font-semibold text-slate-900">WhatsApp</p>
              <a
                href={`https://wa.me/${ligneWhatsApp}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block leading-6"
                style={{ color: page.accent }}
              >
                {section.whatsapp}
              </a>
            </div>
          )}
          {section.reseaux.length > 0 && (
            <div>
              <p className="font-semibold text-slate-900">Réseaux</p>
              <ul className="mt-1 space-y-1">
                {section.reseaux.map((reseau, index) => (
                  <li key={`${reseau.libelle}-${index}`}>
                    <a
                      href={reseau.url}
                      target="_blank"
                      rel="noreferrer"
                      className="leading-6"
                      style={{ color: page.accent }}
                    >
                      {reseau.libelle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {section.creneaux.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-900">Horaires</p>
            <dl className="mt-2 divide-y divide-slate-200 text-sm">
              {section.creneaux.map((creneau, index) => (
                <div key={`${creneau.jour}-${index}`} className="flex justify-between gap-4 py-2">
                  <dt className="text-slate-600">{creneau.jour || "—"}</dt>
                  <dd className="font-medium text-slate-900">{creneau.heure || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

function BlocGalerie({ page }: { page: PageLieu }) {
  const section = page.galerie;
  if (!section.visible || section.images.length === 0) return null;

  return (
    <section className="mt-10">
      {section.titre && <TitreSection accent={page.accent}>{section.titre}</TitreSection>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.images.map((image, index) => (
          <figure key={`${image.chemin}-${index}`}>
            {/* <img> simple : les visuels viennent de notre propre route, pas de l'optimiseur
                d'images, et l'éditeur doit pouvoir les montrer avant enregistrement. */}
            <img
              src={urlImage(page, image.chemin)}
              alt={image.legende || `${page.nom} — photo ${index + 1}`}
              loading="lazy"
              className="aspect-4/3 w-full rounded-xl border border-slate-200 object-cover"
            />
            {image.legende && (
              <figcaption className="mt-2 text-xs leading-5 text-slate-500">{image.legende}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

function BlocDocuments({ page, documents }: { page: PageLieu; documents: DocumentJoint[] }) {
  const section = page.documents;
  if (!section.visible || documents.length === 0) return null;

  return (
    <section className="mt-10">
      {section.titre && <TitreSection accent={page.accent}>{section.titre}</TitreSection>}
      <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
        {documents.map((document) => (
          <li key={document.slug}>
            <Link
              href={`/d/${document.slug}`}
              className="flex items-center justify-between gap-4 py-3"
            >
              <span className="text-sm font-medium text-slate-900">{document.titre}</span>
              <span className="shrink-0 text-xs text-slate-500">
                {formatOctets(document.tailleOctets)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Entete({ page }: { page: PageLieu }) {
  const couverture = page.couverture;

  if (page.modele === "vitrine") {
    return (
      <>
        {couverture ? (
          <img
            src={urlImage(page, couverture.chemin)}
            alt={couverture.legende || page.nom}
            className="aspect-16/9 w-full rounded-xl border border-slate-200 object-cover"
          />
        ) : null}
        <header
          className={couverture ? "mt-4 rounded-xl px-5 py-6" : "rounded-xl px-5 py-8"}
          style={{ backgroundColor: page.accent }}
        >
          <h1 className="text-3xl font-black tracking-tight text-white">{page.nom}</h1>
          {page.accroche && <p className="mt-2 text-base leading-7 text-white">{page.accroche}</p>}
        </header>
      </>
    );
  }

  return (
    <header>
      <h1
        className={page.modele === "liste" ? "text-2xl font-bold tracking-tight" : "text-3xl font-black tracking-tight text-slate-900"}
        style={page.modele === "liste" ? { color: page.accent } : undefined}
      >
        {page.nom}
      </h1>
      <span className="mt-3 block h-[3px] w-10" style={{ backgroundColor: page.accent }} aria-hidden="true" />
      {page.accroche && <p className="mt-4 text-lg leading-8 text-slate-600">{page.accroche}</p>}
      {couverture && (
        <figure className="mt-6">
          <img
            src={urlImage(page, couverture.chemin)}
            alt={couverture.legende || page.nom}
            className="aspect-16/9 w-full rounded-xl border border-slate-200 object-cover"
          />
          {couverture.legende && (
            <figcaption className="mt-2 text-xs leading-5 text-slate-500">{couverture.legende}</figcaption>
          )}
        </figure>
      )}
    </header>
  );
}

export default function TemplateLieu({ page, documents }: Props) {
  const largeur = page.modele === "vitrine" ? "max-w-3xl" : "max-w-2xl";

  return (
    <div className={`mx-auto ${largeur} px-4 py-10 sm:px-6`}>
      <Entete page={page} />
      <BlocPresentation page={page} />
      <BlocPrestations page={page} />
      <BlocInfos page={page} />
      <BlocGalerie page={page} />
      <BlocDocuments page={page} documents={documents} />
    </div>
  );
}
