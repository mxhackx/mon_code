"use client";

import { useState, FormEvent } from "react";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onBack: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
      const res = await fetch(`${apiUrl}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Mot de passe incorrect");
      }

      const data = await res.json();
      onLoginSuccess(data.access_token);
      setAdminPasswordInput("");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="change-role-btn"
        onClick={onBack}
      >
        ← Changer de profil (Admin / User)
      </button>

      <div style={{ maxWidth: "440px", margin: "0 auto" }}>
        <p className="eyebrow">Accès sécurisé</p>
        <h1 className="brand" style={{ fontSize: "clamp(32px, 5vw, 48px)", margin: "0 0 16px" }}>
          Espace <span>Admin</span>
        </h1>
        <p className="hero-description" style={{ margin: "0 auto 24px" }}>
          Saisissez le mot de passe administrateur pour accéder à la gestion.
        </p>

        <form onSubmit={handleAdminLogin} className="admin-form">
          <div className="admin-input-group">
            <label className="admin-label" htmlFor="admin-pass">
              Mot de passe administrateur
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="admin-pass"
                type={showAdminPassword ? "text" : "password"}
                className="admin-input"
                placeholder="Entrez votre mot de passe"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#625852",
                }}
              >
                {showAdminPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {loginError && (
            <div style={{ color: "#b42318", background: "#fef3f2", border: "1px solid #fecdca", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
              ⚠️ {loginError}
            </div>
          )}

          <button
            type="submit"
            className="cta-button"
            disabled={isLoggingIn}
            style={{ width: "100%", marginTop: "8px" }}
          >
            {isLoggingIn ? "Vérification..." : "Déverrouiller l'espace Admin"}
          </button>
        </form>
      </div>
    </>
  );
}

