"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFile } from "./context/FileContext";

type Scene = "welcome" | "splash" | "ready";

export default function HomePage() {
  const { hasSeenIntro, setHasSeenIntro } = useFile();
  const [scene, setScene] = useState<Scene>(() => (hasSeenIntro ? "ready" : "welcome"));

  useEffect(() => {
    if (hasSeenIntro) {
      return;
    }

    const splashTimer = window.setTimeout(() => setScene("splash"), 1400);
    const readyTimer = window.setTimeout(() => {
      setScene("ready");
      setHasSeenIntro(true);
    }, 2150);

    return () => {
      window.clearTimeout(splashTimer);
      window.clearTimeout(readyTimer);
    };
  }, [hasSeenIntro, setHasSeenIntro]);

  const isWelcome = scene === "welcome";

  return (
    <main className={`landing-page scene-${scene}`}>
      {!hasSeenIntro && <div className="splash" aria-hidden="true" />}

      {!isWelcome && (
        <>
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
        </>
      )}

      {!isWelcome && (
        <header className="site-header">
          <Link className="brand brand-small" href="/" aria-label="GenQR - accueil">
            <span>Gen</span>QR
          </Link>
          <p className="header-note">Vos menus digitaux, en un scan.</p>
        </header>
      )}

      <section className="hero" id="accueil">
        {!hasSeenIntro && (
          <div className="welcome-message" aria-live="polite">
            <h1>Welcome to <span>Gen</span>QR</h1>
          </div>
        )}

        {!isWelcome && (
          <div className="action-panel" style={{ maxWidth: "660px", width: "100%" }}>
            <p className="eyebrow">Menus Digitaux & QR Codes Professionnels</p>
            <h1 className="brand brand-hero" style={{ margin: "0 0 16px" }}>
              <span>Gen</span>QR
            </h1>
            <p className="hero-description" style={{ margin: "0 auto 30px" }}>
              Partagez vos menus de restaurants et cartes professionnelles en un scan.
              Personnalisez votre thème visuel, téléchargez votre QR code officiel et recevez vos commandes directement sur WhatsApp.
            </p>

            <div className="action-buttons" style={{ marginBottom: "28px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/choix-profil" className="cta-button" style={{ padding: "0 28px", fontSize: "15px" }}>
                <span>Menu Restaurant Digital →</span>
              </Link>

              <Link
                href="/carte-visite"
                className="cta-button"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  color: "var(--ink)",
                  borderColor: "rgba(24, 20, 17, 0.2)",
                  padding: "0 24px",
                  fontSize: "15px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="13" y2="12" />
                </svg>
                <span>Carte de Visite Directe</span>
              </Link>
            </div>

            {/* Atouts clés */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                fontSize: "12.5px",
                color: "#6e625b",
              }}
            >
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                🍽️ Menus restaurants (5 thèmes)
              </span>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ⚡ Téléchargement carte immédiat
              </span>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                💬 Contact WhatsApp direct
              </span>
            </div>
          </div>
        )}
      </section>

      {!isWelcome && (
        <footer className="site-footer">
          <p>Scannez et partagez en un instant • Propulsé par GenQR</p>
        </footer>
      )}
    </main>
  );
}
