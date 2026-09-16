"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";

export default function ChoixProfilPage() {
  const router = useRouter();
  const { setSelectedRole, authToken, isAuthLoading } = useFile();

  // Protection : rediriger les visiteurs non connectés vers /connexion
  useEffect(() => {
    if (!isAuthLoading && !authToken) {
      router.push("/connexion");
    }
  }, [authToken, isAuthLoading, router]);

  const handleSelectUser = () => {
    setSelectedRole("user");
    router.push("/intervenant");
  };

  const handleSelectAdmin = () => {
    setSelectedRole("admin");
    router.push("/admin");
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
        <div
          className="action-panel"
          style={{
            opacity: 1,
            transform: "none",
            width: "100%",
            maxWidth: "680px",
          }}
        >
          {/* Bouton Retour à l'accueil */}
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            <Link
              href="/"
              className="change-role-btn"
              style={{ margin: 0, textDecoration: "none" }}
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>

          <p className="eyebrow">Sélectionnez votre espace</p>
          <h1 className="brand" style={{ fontSize: "clamp(32px, 5vw, 48px)", margin: "0 0 14px", lineHeight: 1.1 }}>
            Choisissez votre <span>profil</span>
          </h1>
          <p className="hero-description" style={{ margin: "0 auto 28px", maxWidth: "520px" }}>
            Sélectionnez votre profil d&apos;accès pour accéder à votre espace dédié.
          </p>

          <div className="role-grid">
            {/* Carte Profil Utilisateur / Intervenant */}
            <button
              type="button"
              className="role-card"
              onClick={handleSelectUser}
              aria-label="Accéder à l'espace Utilisateur"
            >
              <div className="role-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="role-card-title">Utilisateur</h2>
              <p className="role-card-desc">
                Renseignez votre fiche d&apos;intervention, ajoutez les informations du restaurant et générez votre QR Code de menu.
              </p>
              <span className="role-card-badge">
                Accéder à l&apos;espace →
              </span>
            </button>

            {/* Carte Profil Administrateur */}
            <button
              type="button"
              className="role-card role-admin"
              onClick={handleSelectAdmin}
              aria-label="Accéder à l'espace Administrateur"
            >
              <div className="role-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h2 className="role-card-title">Administrateur</h2>
              <p className="role-card-desc">
                Supervisez la plateforme, consultez les cartes enregistrées et modifiez vos paramètres de sécurité.
              </p>
              <span className="role-card-badge">
                Accéder à l&apos;espace →
              </span>
            </button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>Scannez et partagez en un instant • Propulsé par MonCode</p>
      </footer>
    </main>
  );
}
