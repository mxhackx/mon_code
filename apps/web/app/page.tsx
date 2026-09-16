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
          <Link className="brand brand-small" href="/" aria-label="MonCode - accueil">
            <span>Mon</span>Code
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/connexion"
              className="change-role-btn"
              style={{
                margin: 0,
                textDecoration: "none",
                fontSize: "12.5px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.9)",
                borderColor: "rgba(24, 20, 17, 0.15)",
                color: "var(--ink)",
              }}
            >
              Espace Pro (Connexion) ↗
            </Link>
          </div>
        </header>
      )}

      <section className="hero" id="accueil">
        {!hasSeenIntro && (
          <div className="welcome-message" aria-live="polite">
            <h1>Welcome to <span>Mon</span>Code</h1>
          </div>
        )}

        {!isWelcome && (
          <div className="action-panel" style={{ maxWidth: "660px", width: "100%" }}>
            <p className="eyebrow">Générateur de QR Code & Carte Professionnelle</p>
            <h1 className="brand brand-hero" style={{ margin: "0 0 16px" }}>
              <span>Mon</span>Code
            </h1>
            <p className="hero-description" style={{ margin: "0 auto 30px" }}>
              Générez votre code QR officiel et votre carte professionnelle en un instant.
              Téléchargez immédiatement votre image optimisée prête pour l&apos;impression et le partage.
            </p>

            <div className="action-buttons" style={{ marginBottom: "28px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/carte-visite"
                className="cta-button"
                style={{
                  padding: "0 32px",
                  fontSize: "15px",
                  height: "48px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="13" y2="12" />
                </svg>
                <span>Générer mon Code QR ↗</span>
              </Link>
            </div>

            {/* Atouts clés pour les visiteurs */}
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
                ⚡ Génération instantanée
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
                📱 Scan & Partage haute définition
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
                🔒 Téléchargement sécurisé
              </span>
            </div>
          </div>
        )}
      </section>

      {!isWelcome && (
        <footer className="site-footer">
          <p>Scannez et partagez en un instant • Propulsé par MonCode</p>
        </footer>
      )}
    </main>
  );
}
