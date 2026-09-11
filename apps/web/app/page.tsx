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

            <div className="action-buttons" style={{ marginBottom: "28px" }}>
              <Link href="/choix-profil" className="cta-button" style={{ padding: "0 32px", fontSize: "16px" }}>
                <span>Commencer l&apos;expérience</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
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
                🍽️ 5 thèmes de menu
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
                🎨 5 designs de QR code
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
