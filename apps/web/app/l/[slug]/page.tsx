import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listerDocuments } from "@/lib/qr-documents";
import { trouverLieu } from "@/lib/qr-lieux";
import TemplateLieu from "@/components/lieux/TemplateLieu";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/**
 * Page d'accueil d'un lieu, conçue dans l'éditeur et servie ici. L'adresse `/l/<slug>` ne
 * change jamais : le QR imprimé sur une table ou une vitrine ouvre la version du jour.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await trouverLieu(slug);
  if (!page) {
    return { title: "Lieu introuvable", robots: { index: false, follow: false } };
  }

  const titre = page.seo.titre || `${page.nom} — page d'accueil`;
  const description =
    page.seo.description ||
    page.accroche ||
    `Page d'accueil de ${page.nom} : horaires, adresse et contacts.`;

  return {
    title: titre,
    description,
    robots: { index: !page.seo.noindex, follow: true },
    openGraph: {
      title: titre,
      description,
      type: "website",
      url: `/l/${page.slug}`,
      images: page.couverture
        ? [
            {
              url: `/api/qr-lieux/${page.slug}/image/${encodeURIComponent(page.couverture.chemin)}`,
              alt: page.couverture.legende || page.nom,
            },
          ]
        : undefined,
    },
  };
}

export default async function LieuPage({ params }: Props) {
  const { slug } = await params;
  const page = await trouverLieu(slug);
  if (!page) notFound();

  // Le lieu a déjà son propre site : on le sert sous la même adresse courte.
  if (page.siteExterne) redirect(page.siteExterne);

  const docs = await listerDocuments();
  const documents = page.documents.slugs
    .map((slugJoint) => docs.find((doc) => doc.slug === slugJoint))
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc))
    .map((doc) => ({ slug: doc.slug, titre: doc.titre, tailleOctets: doc.tailleOctets }));

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <TemplateLieu page={page} documents={documents} />

      <footer className="pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            Page d&apos;accueil de {page.nom} — ouverte par QR code, dernière mise à jour le{" "}
            {new Date(page.majLe).toLocaleDateString("fr-FR")} ·{" "}
            <Link href="/" className="font-medium text-green-800 underline-offset-2 hover:underline">
              Moncode
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
