"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";

export default function ConnexionPage() {
  const router = useRouter();
  const { loginSession, authToken, authRole, isAuthLoading } = useFile();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si déjà connecté, rediriger automatiquement selon le rôle
  useEffect(() => {
    if (!isAuthLoading && authToken && authRole) {
      if (authRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/intervenant");
      }
    }
  }, [authToken, authRole, isAuthLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Veuillez renseigner votre identifiant et votre mot de passe.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
      const res = await fetch(`${apiUrl}/auth/login`, {
      credentials: 'include',
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Identifiant ou mot de passe incorrect");
      }

      const data = await res.json();
      const role: "admin" | "user" = data.user?.role === "admin" ? "admin" : "user";

      // Sauvegarder la session avec jeton d'accès, rôle et jeton de rafraîchissement
      loginSession(
        data.access_token,
        role,
        {
          id: data.user?.id,
          email: data.user?.email,
        },
        data.refresh_token,
      );

      // Redirection personnalisée selon le rôle
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/intervenant");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Impossible de se connecter au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="landing-page scene-ready">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <Link className="brand brand-small" href="/" aria-label="MonCode - accueil">
          <span>Mon</span>Code
        </Link>
        <p className="header-note">Espace sécurisé MonCode.</p>
      </header>

      <section className="hero">
        <div
          className="action-panel"
          style={{
            opacity: 1,
            transform: "none",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            <Link
              href="/"
              className="change-role-btn"
              style={{ margin: 0, textDecoration: "none" }}
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>

          <p className="eyebrow">Accès Professionnel & Gestion</p>
          <h1 className="brand" style={{ fontSize: "clamp(30px, 4.5vw, 42px)", margin: "0 0 12px" }}>
            <span>Connexion</span>
          </h1>
          <p className="hero-description" style={{ margin: "0 auto 24px", fontSize: "14px" }}>
            Connectez-vous pour accéder à votre espace de gestion ou au processus de création de vos menus.
          </p>

          <form onSubmit={handleLogin} className="admin-form">
            {/* Identifiant ou Email */}
            <div className="admin-input-group">
              <label className="admin-label" htmlFor="connexion-id">
                Identifiant ou Email
              </label>
              <input
                id="connexion-id"
                type="text"
                className="admin-input"
                placeholder="ex: admin ou user@moncode.com"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoComplete="username"
              />
            </div>

            {/* Mot de passe */}
            <div className="admin-input-group">
              <label className="admin-label" htmlFor="connexion-pass">
                Mot de passe
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="connexion-pass"
                  type={showPassword ? "text" : "password"}
                  className="admin-input"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "#625852",
                  }}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div
                style={{
                  color: "#b42318",
                  background: "#fef3f2",
                  border: "1px solid #fecdca",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="cta-button"
              disabled={isLoading}
              style={{
                width: "100%",
                marginTop: "10px",
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              <span>{isLoading ? "Vérification en cours..." : "Se connecter →"}</span>
            </button>
          </form>

          {/* Guide d'accès informatif */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              fontSize: "12px",
              color: "#8a7e78",
              textAlign: "left",
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: "0 0 6px", fontWeight: 600, color: "var(--ink)" }}>
              🔒 Redirection automatique :
            </p>
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              <li>
                <strong>Admin</strong> : Accès au tableau de bord et à la gestion des cartes.
              </li>
              <li>
                <strong>Utilisateur</strong> : Accès direct au processus de création pour les restaurants.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>Connexion sécurisée • MonCode</p>
      </footer>
    </main>
  );
}

