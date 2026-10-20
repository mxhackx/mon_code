import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, ExternalLink, Download } from "lucide-react";
import { trouverDocument } from "@/lib/qr-documents";
import { formatDate, formatOctets } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const document = await trouverDocument(slug);
  if (!document) return { title: "Document introuvable", robots: { index: false, follow: false } };
  return {
    title: `${document.titre} — Moncode`,
    description: `Document « ${document.titre} » (${formatOctets(document.tailleOctets)}), ouvert par QR code.`,
    robots: { index: false, follow: false },
  };
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  const document = await trouverDocument(slug);
  if (!document) notFound();

  const cheminFichier = `/api/qr-documents/${document.slug}/file`;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between border-b border-green-100 pb-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-green-700 text-white">M</span>
            Moncode
          </Link>
          <span className="text-xs text-slate-500">Document ouvert par QR code</span>
        </header>

        <section className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{document.titre}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-green-700" aria-hidden="true" />
              PDF
            </span>
            <span>{formatOctets(document.tailleOctets)}</span>
            <span aria-hidden="true">·</span>
            <span>mis à jour le {formatDate(document.majLe)}</span>
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={cheminFichier}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ouvrir le PDF
            </a>
            <a
              href={cheminFichier}
              download={document.fileName}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-green-200 bg-white px-4 text-sm font-semibold text-green-800 transition-colors hover:bg-green-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Télécharger
            </a>
          </div>
        </section>

        <section className="mt-6 flex-1">
          <div className="overflow-hidden rounded-lg border border-green-100 bg-green-50/40">
            {/* Le lecteur natif gère l'affichage ; les boutons ci-dessus couvrent les
                navigateurs mobiles qui n'affichent pas les PDF en ligne. */}
            <iframe
              src={cheminFichier}
              title={document.titre}
              className="h-[70vh] w-full border-0 bg-white"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Rien ne s&apos;affiche ? Ce navigateur ne lit pas les PDF en ligne — utilisez « Ouvrir le PDF ».
          </p>
        </section>
      </div>
    </main>
  );
}
