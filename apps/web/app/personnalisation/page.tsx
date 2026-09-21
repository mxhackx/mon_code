"use client";
import QRCodeStudio from "../components/QRCodeStudio";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";

interface QrResult {
  slug: string;
  cardUrl: string;
  qrCode: string;
  restaurantName?: string;
}

const THEMES = [
  {
    id: "theme-1",
    name: "premier",
    subtitle: "Dark Luxury",
    desc: "Noir profond et touches or champagne. Ambiance feutrée et gastronomique.",
    bgPreview: "#0d0b09",
    accentColor: "#d4af37",
    textColor: "#fdf8e2",
    badge: "Gastronomique",
  },
  {
    id: "theme-2",
    name: "deuxième",
    subtitle: "Terracotta & Bois",
    desc: "Tons chauds terre cuite, crème et bois. Ambiance bistrot convivial.",
    bgPreview: "#fcf8f2",
    accentColor: "#c85a32",
    textColor: "#321d14",
    badge: "Convivial",
  },
  {
    id: "theme-3",
    name: "troisième",
    subtitle: "Clean Slate",
    desc: "Fond blanc pur, contrastes ardoise et clarté absolue pour les plats.",
    bgPreview: "#ffffff",
    accentColor: "#0f172a",
    textColor: "#1e293b",
    badge: "Moderne",
  },
  {
    id: "theme-4",
    name: "quatrième",
    subtitle: "Fresh Green",
    desc: "Vert forêt et sauge. Idéal pour cafés, cuisine saine, brunchs et bio.",
    bgPreview: "#f4f8f5",
    accentColor: "#1b4332",
    textColor: "#132a22",
    badge: "Nature & Frais",
  },
  {
    id: "theme-5",
    name: "cinquième",
    subtitle: "Energetic Orange",
    desc: "Teintes festives orange et ambre sur fond sombre. Dynamique et percutant.",
    bgPreview: "#161311",
    accentColor: "#f97316",
    textColor: "#fff7ed",
    badge: "Festif",
  },
];


export default function PersonnalisationPage() {
  const router = useRouter();
  const {
    userInfo,
    restaurantInfo,
    customization,
    setThemeId,
    setQrStyle,
    authToken,
    isAuthLoading,
  } = useFile();

  // Protection de la route : rediriger vers la connexion si non connecté
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

      // Informations de l'intervention
      if (userInfo.userName) formData.append("userName", userInfo.userName);
      if (userInfo.clientName) formData.append("clientName", userInfo.clientName);
      if (userInfo.workDone) formData.append("workDone", userInfo.workDone);
      if (userInfo.amountReceived) formData.append("amountReceived", userInfo.amountReceived);

      // Informations du restaurant
      formData.append("restaurantName", restaurantInfo.restaurantName);
      formData.append("locationUrl", restaurantInfo.locationUrl);
      formData.append("phoneNumber", restaurantInfo.phoneNumber);
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
      const headers: Record<string, string> = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${apiUrl}/cards`, {
      credentials: 'include',
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Erreur lors de la génération du QR code");
      }

      const data = await response.json();
      setQrResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion avec le serveur");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!qrResult) return;
    try {
      await navigator.clipboard.writeText(qrResult.cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <main className="landing-page scene-ready">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <Link className="brand brand-small" href="/" aria-label="MonCode - accueil">
          <span>Mon</span>Code
        </Link>
        <p className="header-note">Vos menus digitaux, en un scan.</p>
      </header>

      <section className="hero">
        <div className="action-panel" style={{ opacity: 1, transform: "none", maxWidth: "840px", width: "100%" }}>
          {qrResult ? (
            // Écran de succès : QR Code généré
            <div>
              <p className="eyebrow">Votre menu digital est prêt</p>
              <h1 className="brand" style={{ fontSize: "clamp(30px, 5vw, 44px)", margin: "0 0 12px" }}>
                QR Code <span>Généré avec succès !</span>
              </h1>
              <p className="hero-description" style={{ margin: "0 auto 24px", maxWidth: "560px" }}>
                Voici le QR Code officiel pour <strong>{restaurantInfo.restaurantName || "le restaurant"}</strong>. Les clients accèderont au menu selon le thème choisi.
              </p>

              {/* Affichage du QR Code */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "24px",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.12)",
                  display: "inline-block",
                  margin: "0 auto 20px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrResult.qrCode}
                  alt={`QR Code pour ${qrResult.slug}`}
                  style={{ width: "min(75vw, 260px)", height: "auto", display: "block", borderRadius: "12px" }}
                />
              </div>

              <div style={{ margin: "0 auto 24px", wordBreak: "break-all" }}>
                <p style={{ fontSize: "13px", color: "#8a7a70", marginBottom: "6px" }}>Lien direct du restaurant :</p>
                <code
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                  }}
                >
                  {qrResult.cardUrl}
                </code>
              </div>

              <div className="action-buttons" style={{ flexWrap: "wrap", justifyContent: "center" }}>
                <a
                  href={qrResult.qrCode}
                  download={`moncode-menu-${qrResult.slug}.png`}
                  className="cta-button"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                  </svg>
                  Télécharger le QR Code
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="cta-button"
                  style={{ background: "transparent", color: "var(--ink)", borderColor: "currentColor" }}
                >
                  {copied ? "✓ Lien copié !" : "Copier le lien"}
                </button>

                <Link
                  href={`/c/${qrResult.slug}`}
                  className="cta-button"
                  style={{ background: "#181411", borderColor: "#181411", color: "#fff" }}
                >
                  Voir la page du restaurant →
                </Link>
              </div>

              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setQrResult(null)}
                  style={{ background: "none", border: "none", color: "var(--orange-dark)", cursor: "pointer", fontSize: "14px", textDecoration: "underline" }}
                >
                  Modifier le thème ou le style du QR code
                </button>
              </div>
            </div>
          ) : (
            // Écran de personnalisation Thèmes + Styles QR
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <button
                  type="button"
                  className="change-role-btn"
                  onClick={() => router.push("/restaurant")}
                  style={{ margin: 0 }}
                >
                  ← Retour au restaurant
                </button>
                <span style={{ fontSize: "12px", color: "var(--orange-dark)", fontWeight: 700, background: "rgba(239, 106, 34, 0.1)", padding: "4px 10px", borderRadius: "999px" }}>
                  Étape 3 / 3
                </span>
              </div>

              <p className="eyebrow">Personnalisation visuelle</p>
              <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 40px)", margin: "0 0 10px" }}>
                Thème & Style de <span>QR Code</span>
              </h1>
              <p className="hero-description" style={{ margin: "0 auto 28px" }}>
                Sélectionnez le thème dans lequel le menu du restaurant s&apos;affichera au scan, ainsi que le design du QR Code à imprimer.
              </p>

              {/* SECTION 1 : Les 5 Thèmes */}
              <div style={{ textAlign: "left", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <span style={{ background: "var(--orange)", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>
                    1
                  </span>
                  <h2 style={{ fontSize: "18px", margin: 0, color: "var(--ink)" }}>
                    Choisissez un thème pour la page du restaurant (5 au choix)
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  {THEMES.map((theme) => {
                    const isSelected = customization.themeId === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setThemeId(theme.id)}
                        style={{
                          background: theme.bgPreview,
                          color: theme.textColor,
                          border: isSelected ? "3px solid var(--orange)" : "1.5px solid rgba(0,0,0,0.12)",
                          borderRadius: "16px",
                          padding: "16px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          boxShadow: isSelected ? "0 8px 24px rgba(239, 106, 34, 0.22)" : "0 4px 12px rgba(0,0,0,0.03)",
                          transform: isSelected ? "scale(1.02)" : "none",
                          transition: "all 0.2s ease",
                          position: "relative",
                        }}
                      >
                        {isSelected && (
                          <span style={{ position: "absolute", top: "10px", right: "10px", background: "var(--orange)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                            ✓
                          </span>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              background: theme.accentColor,
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              display: "inline-block",
                            }}
                          />
                          <strong style={{ fontSize: "15px" }}>{theme.name}</strong>
                        </div>
                        <span style={{ fontSize: "12px", opacity: 0.8, fontWeight: 600 }}>
                          {theme.subtitle} • {theme.badge}
                        </span>
                        <p style={{ fontSize: "12px", margin: "4px 0 0", opacity: 0.85, lineHeight: 1.4 }}>
                          {theme.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2 : Le Studio QR Code */}
              <div style={{ textAlign: "left", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <span style={{ background: "var(--orange)", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>
                    2
                  </span>
                  <h2 style={{ fontSize: "18px", margin: 0, color: "var(--ink)" }}>
                    Designez le QR Code
                  </h2>
                </div>
                
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

              {/* Bouton de validation & création */}
              <div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="cta-button"
                  style={{ width: "100%", padding: "16px 24px", fontSize: "16px" }}
                >
                  {isGenerating ? (
                    "Génération du QR Code et optimisation..."
                  ) : (
                    "Générer le QR Code & Finaliser le restaurant →"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <p>Scannez et partagez en un instant • Propulsé par MonCode</p>
      </footer>
    </main>
  );
}

