"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";
import AdminDashboard from "../../components/admin/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  const { authToken, authRole, isAuthLoading, logoutSession } = useFile();

  // Verrouillage strict : redirection immédiate vers /connexion si l'utilisateur n'est pas authentifié comme admin
  useEffect(() => {
    if (!isAuthLoading) {
      if (!authToken || authRole !== "admin") {
        router.replace("/connexion");
      }
    }
  }, [authToken, authRole, isAuthLoading, router]);

  const handleLogout = () => {
    logoutSession();
    router.replace("/connexion");
  };

  if (isAuthLoading || !authToken || authRole !== "admin") {
    return (
      <main className="landing-page scene-ready">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <p style={{ color: "#8a7e78" }}>Vérification de l&apos;accès administrateur...</p>
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
      </header>

      <section className="hero">
        <div
          className="action-panel"
          style={{
            opacity: 1,
            transform: "none",
            width: "100%",
            maxWidth: "860px",
          }}
        >
          <AdminDashboard
            adminToken={authToken}
            onLogout={handleLogout}
            onNavigateToUser={() => router.push("/intervenant")}
          />
        </div>
      </section>

      <footer className="site-footer">
        <p>Administration MonCode</p>
      </footer>
    </main>
  );
}
