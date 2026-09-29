"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";
import QRCodeStudio from "../../components/QRCodeStudio";

interface QrResult {
  slug: string;
  cardUrl: string;
  qrCode: string; // The base64 or URL of the standard QR returned by backend
  imageUrl: string;
}

export default function QrStudioPage() {
  const router = useRouter();
  const {
    userInfo,
    restaurantInfo,
    customization,
    setQrStyle,
    authToken,
    isAuthLoading,
  } = useFile();

  useEffect(() => {
    if (!isAuthLoading && !authToken) {
      router.push("/connexion");
    }
  }, [authToken, isAuthLoading, router]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();

      // Utilisateur (qui paie)
      formData.append("clientName", userInfo.clientName);
      formData.append("userName", userInfo.userName);
      if (userInfo.workDone) formData.append("workDone", userInfo.workDone);
      if (userInfo.amountReceived) formData.append("amountReceived", userInfo.amountReceived);

      // Informations du restaurant
            formData.append("restaurantName", restaurantInfo.restaurantName);
      formData.append("address", restaurantInfo.address || "");
      formData.append("locationUrl", restaurantInfo.locationUrl);
      formData.append("phoneNumber", restaurantInfo.phoneNumber);
      if (restaurantInfo.facebookUrl) formData.append("facebookUrl", restaurantInfo.facebookUrl);
      if (restaurantInfo.instagramUrl) formData.append("instagramUrl", restaurantInfo.instagramUrl);
      if (restaurantInfo.xUrl) formData.append("xUrl", restaurantInfo.xUrl);
      if (restaurantInfo.snapchatUrl) formData.append("snapchatUrl", restaurantInfo.snapchatUrl);
      if (restaurantInfo.additionalInfo) formData.append("additionalInfo", restaurantInfo.additionalInfo);
      formData.append("schedule", JSON.stringify(restaurantInfo.schedule));
      formData.append("themeId", customization.themeId);
      if (customization.qrStyle) formData.append("qrStyle", customization.qrStyle);

      // Logo
      if (restaurantInfo.logoFile) {
        formData.append("logo", restaurantInfo.logoFile);
      }

      
      // Photos du menu
      for (const menuFile of restaurantInfo.menuFiles) {
        formData.append("menu", menuFile);
      }
      
      // Photos du lieu
      for (const placeFile of restaurantInfo.placeFiles) {
        formData.append("place", placeFile);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

      const response = await fetch(`${apiUrl}/cards`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création de la carte.");
      }

      const data = await response.json();
      setQrResult(data);
    } catch (err: any) {
      console.error("Generate error:", err);
      setError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (qrResult) {
      navigator.clipboard.writeText(qrResult.cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isAuthLoading) return null;

  return (
    <main className="landing-page scene-ready">
      <div className="splash"></div>
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <header className="site-header" style={{ marginBottom: "20px" }}>
        <Link href="/" className="logo">Visicard <span>PRO</span></Link>
        <span style={{ background: "rgba(239, 106, 34, 0.1)", color: "var(--orange-dark)", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
          Étape 4 / 4
        </span>
      </header>

      <section style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ background: "#ffffff", borderRadius: "24px", padding: "clamp(20px, 4vw, 40px)", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
          {qrResult ? (
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "40px", display: "block", marginBottom: "16px" }}>🎉</span>
              <h1 className="brand" style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: "0 0 10px" }}>
                Menu Numérique <span>Créé !</span>
              </h1>
              <p style={{ color: "#625852", fontSize: "15px", margin: "0 auto 32px", maxWidth: "400px" }}>
                Votre carte interactive est prête. Téléchargez le QR Code généré ci-dessous pour l'imprimer.
              </p>
              <div style={{ display: "inline-block", background: "#f8f9fb", padding: "20px", borderRadius: "16px", border: "1.5px solid rgba(0,0,0,0.06)", marginBottom: "32px" }}>
                <img src={qrResult.qrCode} alt="QR Code final" style={{ width: "200px", height: "200px", borderRadius: "8px", background: "#fff", display: "block", margin: "0 auto" }} />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href={qrResult.qrCode} download={`qrcode-${qrResult.slug}.png`} className="cta-button" style={{ background: "var(--orange)", color: "#fff", borderColor: "var(--orange)" }}>
                  Télécharger le QR Code ↓
                </a>
                <button type="button" onClick={handleCopyLink} className="cta-button" style={{ background: "transparent", color: "var(--ink)", borderColor: "currentColor" }}>
                  {copied ? "✓ Lien copié !" : "Copier le lien"}
                </button>
                <Link href={`/c/${qrResult.slug}`} className="cta-button" style={{ background: "#181411", borderColor: "#181411", color: "#fff" }}>
                  Voir le menu →
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <button type="button" onClick={() => router.push("/personnalisation")} style={{ background: "none", border: "none", color: "var(--ink)", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
                  ← Retour au design
                </button>
              </div>

              <p className="eyebrow">Dernière étape</p>
              <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 40px)", margin: "0 0 10px" }}>
                Designez votre <span>QR Code</span>
              </h1>
              <p className="hero-description" style={{ margin: "0 auto 28px" }}>
                Personnalisez le QR code qui sera imprimé pour vos clients.
              </p>

              <div style={{ textAlign: "left", marginBottom: "32px" }}>
                <QRCodeStudio 
                  dataUrl="https://visicard.moncode.com/c/APERÇU"
                  logoUrl={restaurantInfo.logoFile ? URL.createObjectURL(restaurantInfo.logoFile) : undefined}
                  onChange={(configStr: string) => setQrStyle(configStr)}
                />
              </div>

              {error && (
                <div style={{ color: "#b42318", background: "#fef3f2", border: "1px solid #fecdca", padding: "12px 16px", borderRadius: "12px", fontSize: "13.5px", marginBottom: "16px" }}>
                  ⚠️ {error}
                </div>
              )}

              <div>
                <button type="button" onClick={handleGenerate} disabled={isGenerating} className="cta-button" style={{ width: "100%", padding: "16px 24px", fontSize: "16px" }}>
                  {isGenerating ? "Génération du QR Code..." : "Générer la carte finale →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
