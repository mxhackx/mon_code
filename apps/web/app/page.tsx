"use client";

import { useEffect, useState } from "react";

type Scene = "welcome" | "splash" | "ready";

export default function Home() {
  const [scene, setScene] = useState<Scene>("welcome");

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setScene("splash"), 1400);
    const readyTimer = window.setTimeout(() => setScene("ready"), 2150);
    return () => {
      window.clearTimeout(splashTimer);
      window.clearTimeout(readyTimer);
    };
  }, []);

  const isWelcome = scene === "welcome";

  return (
    <main className={`landing-page scene-${scene}`}>
      <div className="splash" aria-hidden="true" />
      {!isWelcome && <><div className="ambient ambient-one" /><div className="ambient ambient-two" /></>}

      {!isWelcome && (
        <header className="site-header">
          <a className="brand brand-small" href="#accueil" aria-label="VisitCard - accueil"><span>Visit</span>Card</a>
          <p className="header-note">Vos contacts, en un scan.</p>
        </header>
      )}

      <section className="hero" id="accueil">
        <div className="welcome-message" aria-live="polite"><h1>Welcome to <span>Visit</span>Card</h1></div>
        {!isWelcome && (
          <div className="action-panel">
            <p className="eyebrow">Votre carte, partout avec vous</p>
            <h1 className="brand brand-hero"><span>Visit</span>Card</h1>
            <p className="hero-description">Partagez votre identité professionnelle simplement, rapidement et sans papier.</p>
            <div className="action-buttons">
              <button className="cta-button" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>
                Chargez votre carte
              </button>
              <button className="cta-button" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h5m-5 4v4" /></svg>
                Créer une carte
              </button>
            </div>
          </div>
        )}
      </section>

      {!isWelcome && <footer className="site-footer"><span className="footer-dot" /> Simple à créer. Facile à partager.</footer>}
    </main>
  );
}
