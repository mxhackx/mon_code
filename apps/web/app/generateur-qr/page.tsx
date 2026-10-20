import type { Metadata } from "next";
import QrTool from "@/components/qr-generator/QrTool";

export const metadata: Metadata = {
  title: "Générateur de QR codes — Moncode",
  description:
    "Créez des QR codes vers vos PDF hébergés ou vers la page d'accueil d'un lieu, en version simple ou personnalisée.",
  robots: { index: false, follow: false },
};

export default function GenerateurQrPage() {
  return <QrTool />;
}
