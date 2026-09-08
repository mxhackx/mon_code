"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useFile } from "./context/FileContext";

type Scene = "welcome" | "splash" | "ready";

export default function Home() {
  const { setFile, hasSeenIntro, setHasSeenIntro } = useFile();
  const [scene, setScene] = useState<Scene>(() => (hasSeenIntro ? "ready" : "welcome"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  // Déclenche l'explorateur de fichiers au clic sur le bouton
  const handleCtaClick = () => {
    fileInputRef.current?.click();
  };

  // Récupère le fichier choisi et redirige vers la page de chargement
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    setHasSeenIntro(true);
    setFile(file);
    event.target.value = "";
    router.push("/charger");
  };

  const isWelcome = scene === "welcome";

  return (
    <main className={`landing-page scene-${scene}`}>
      {/* Input invisible pour ouvrir l'explorateur de fichiers de l'appareil */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png,image/jpeg,.jpg,.jpeg,.png" 
        style={{ display: "none" }}
      />

      {!hasSeenIntro && <div className="splash" aria-hidden="true" />}
      {!isWelcome && <><div className="ambient ambient-one" /><div className="ambient ambient-two" /></>}

      {!isWelcome && (
        <header className="site-header">
          <a className="brand brand-small" href="#accueil" aria-label="VisitCard - accueil"><span>Visit</span>Card</a>
          <p className="header-note">Vos contacts, en un scan.</p>
        </header>
      )}

      <section className="hero" id="accueil">
        {!hasSeenIntro && (
          <div className="welcome-message" aria-live="polite">
            <h1>Welcome to <span>Visit</span>Card</h1>
          </div>
        )}
        {!isWelcome && (
          <div className="action-panel">
            <p className="eyebrow">Votre carte, partout avec vous</p>
            <h1 className="brand brand-hero"><span>Visit</span>Card</h1>
            <p className="hero-description">Partagez votre identité professionnelle simplement, rapidement et sans papier.</p>
            <div className="action-buttons">
              <button className="cta-button" type="button" onClick={handleCtaClick}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>
                Chargez votre carte
              </button>
            </div>
          </div>
        )}
      </section>

      {!isWelcome && <footer className="site-footer"><span className="footer-dot" /> Simple à créer. Facile à partager.</footer>}

    </main>
  );
}
