"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useFile } from "./context/FileContext";
import RoleSelector from "./components/RoleSelector";
import UserInterventionForm from "./components/UserInterventionForm";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";

type Scene = "welcome" | "splash" | "ready";

export default function Home() {
  const { setFile, hasSeenIntro, setHasSeenIntro, selectedRole, setSelectedRole } = useFile();
  const [scene, setScene] = useState<Scene>(() => (hasSeenIntro ? "ready" : "welcome"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // État d'authentification Administrateur
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("genqr_admin_token") || sessionStorage.getItem("visitcard_admin_token");
      } catch {
        // ignore storage restriction
      }
    }
    return null;
  });

  // Animation d'introduction au premier chargement
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

  // Récupère le fichier choisi et redirige vers la page de chargement
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setHasSeenIntro(true);
    setSelectedRole("user");
    setFile(file);
    event.target.value = "";
    router.push("/charger");
  };

  // Connexion Admin réussie
  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    try {
      sessionStorage.setItem("genqr_admin_token", token);
    } catch {
      // ignore
    }
  };

  // Déconnexion Admin
  const handleAdminLogout = () => {
    setAdminToken(null);
    try {
      sessionStorage.removeItem("genqr_admin_token");
      sessionStorage.removeItem("visitcard_admin_token");
    } catch {
      // ignore
    }
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
      {!isWelcome && (
        <>
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
        </>
      )}

      {!isWelcome && (
        <header className="site-header">
          <a className="brand brand-small" href="#accueil" aria-label="GenQR - accueil">
            <span>Gen</span>QR
          </a>
          <p className="header-note">Vos contacts, en un scan.</p>
        </header>
      )}

      <section className="hero" id="accueil">
        {!hasSeenIntro && (
          <div className="welcome-message" aria-live="polite">
            <h1>Welcome to <span>Gen</span>QR</h1>
          </div>
        )}

        {!isWelcome && (
          <div
            className="action-panel"
            style={{
              width: "100%",
              maxWidth: selectedRole === "admin" && adminToken ? "820px" : selectedRole === null ? "680px" : "650px",
            }}
          >
            {/* 1. Écran de sélection du rôle (Admin / User) */}
            {selectedRole === null && (
              <RoleSelector onSelectRole={setSelectedRole} />
            )}

            {/* 2. Écran Utilisateur : Formulaire d'intervention obligatoire puis chargement de carte */}
            {selectedRole === "user" && (
              <UserInterventionForm
                fileInputRef={fileInputRef}
                onBack={() => setSelectedRole(null)}
              />
            )}

            {/* 3. Écran Administrateur : Connexion ou Dashboard */}
            {selectedRole === "admin" && (
              !adminToken ? (
                <AdminLogin
                  onLoginSuccess={handleLoginSuccess}
                  onBack={() => setSelectedRole(null)}
                />
              ) : (
                <AdminDashboard
                  adminToken={adminToken}
                  onLogout={handleAdminLogout}
                  onNavigateToUser={() => setSelectedRole("user")}
                />
              )
            )}
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
