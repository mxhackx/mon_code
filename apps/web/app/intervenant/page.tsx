"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile, UserInfo } from "../context/FileContext";

export default function IntervenantPage() {
  const router = useRouter();
  const { userInfo, setUserInfo, authToken, isAuthLoading, logoutSession } = useFile();
  const [formError, setFormError] = useState<string | null>(null);

  // Protection de la route : rediriger vers la connexion si non authentifié
  useEffect(() => {
    if (!isAuthLoading && !authToken) {
      router.push("/connexion");
    }
  }, [authToken, isAuthLoading, router]);

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
    if (formError) {
      setFormError(null);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !userInfo.userName.trim() ||
      !userInfo.clientName.trim() ||
      !userInfo.workDone.trim() ||
      !userInfo.amountReceived.trim()
    ) {
      setFormError("Veuillez remplir tous les champs obligatoires avant de continuer.");
      return;
    }

    setFormError(null);
    router.push("/restaurant");
  };

  const handleLogout = () => {
    logoutSession();
    router.push("/connexion");
  };

  if (isAuthLoading || !authToken) {
    return (
      <main className="landing-page scene-ready">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <p style={{ color: "#8a7e78" }}>Vérification de l&apos;authentification...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="landing-page scene-ready">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <Link className="brand brand-small" href="/" aria-label="MonCode - accueil">
          <span>Mon</span>Code
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="change-role-btn"
          style={{
            margin: 0,
            cursor: "pointer",
            fontSize: "12px",
            padding: "5px 12px",
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(24, 20, 17, 0.15)",
          }}
        >
          Se déconnecter
        </button>
      </header>

      <section className="hero">
        <div className="action-panel" style={{ opacity: 1, transform: "none", maxWidth: "640px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12.5px", color: "#625852", fontWeight: 600 }}>
              Processus de création Restaurant
            </span>
            <span style={{ fontSize: "12px", color: "var(--orange-dark)", fontWeight: 700, background: "rgba(239, 106, 34, 0.1)", padding: "4px 10px", borderRadius: "999px" }}>
              Étape 1 / 3
            </span>
          </div>

          <p className="eyebrow">Fiche d&apos;intervention</p>
          <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 10px" }}>
            Fiche <span>Intervenant</span> & Client
          </h1>
          <p className="hero-description" style={{ margin: "0 auto 24px", maxWidth: "520px" }}>
            Renseignez les détails ci-dessous avant d&apos;accéder à la saisie du restaurant et de son menu.
          </p>

          <form onSubmit={handleFormSubmit} className="user-form">
            <div className="form-row">
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="user-name">
                  Nom et prénoms de l&apos;intervenant *
                </label>
                <input
                  id="user-name"
                  type="text"
                  className="admin-input"
                  placeholder="Ex: Jean Dupont"
                  value={userInfo.userName}
                  onChange={(e) => handleUserInfoChange("userName", e.target.value)}
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label" htmlFor="client-name">
                  Nom complet du client *
                </label>
                <input
                  id="client-name"
                  type="text"
                  className="admin-input"
                  placeholder="Ex: Entreprise Alpha / M. Martin"
                  value={userInfo.clientName}
                  onChange={(e) => handleUserInfoChange("clientName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="amount-received">
                  Montant reçu *
                </label>
                <input
                  id="amount-received"
                  type="text"
                  className="admin-input"
                  placeholder="Ex: 50 000 FCFA ou 150 €"
                  value={userInfo.amountReceived}
                  onChange={(e) => handleUserInfoChange("amountReceived", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label className="admin-label" htmlFor="work-done">
                Travaux effectués *
              </label>
              <textarea
                id="work-done"
                className="admin-input"
                placeholder="Ex: Conception du menu digital, configuration QR Code, impression du support..."
                value={userInfo.workDone}
                onChange={(e) => handleUserInfoChange("workDone", e.target.value)}
                rows={3}
                required
              />
            </div>

            {formError && (
              <div style={{ color: "#b42318", background: "#fef3f2", border: "1px solid #fecdca", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              <button type="submit" className="cta-button" style={{ width: "100%" }}>
                Continuer vers les informations du restaurant →
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="site-footer">
        <p>Scannez et partagez en un instant • Propulsé par MonCode</p>
      </footer>
    </main>
  );
}
