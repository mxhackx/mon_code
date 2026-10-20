import type { Metadata } from "next";
import EditeurLieu from "@/components/lieux/EditeurLieu";

export const metadata: Metadata = {
  title: "Concepteur de page d'accueil — Moncode",
  description:
    "Composez la page d'accueil d'un lieu — couverture, prestations, horaires, galerie, documents — et imprimez son QR code.",
  robots: { index: false, follow: false },
};

export default function ConcepteurAccueilPage() {
  return <EditeurLieu />;
}
