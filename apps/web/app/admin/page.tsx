"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("genqr_admin_token") || sessionStorage.getItem("visitcard_admin_token");
      } catch {
        // ignore
      }
    }
    return null;
  });

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    try {
      sessionStorage.setItem("genqr_admin_token", token);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    try {
      sessionStorage.removeItem("genqr_admin_token");
      sessionStorage.removeItem("visitcard_admin_token");
    } catch {
      // ignore
    }
  };

  return (
    <main className="landing-page scene-ready">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <Link className="brand brand-small" href="/" aria-label="GenQR - accueil">
          <span>Gen</span>QR
        </Link>
        <p className="header-note">Espace d&apos;administration sécurisé.</p>
      </header>

      <section className="hero">
        <div
          className="action-panel"
          style={{
            opacity: 1,
            transform: "none",
            width: "100%",
            maxWidth: adminToken ? "860px" : "560px",
          }}
        >
          {!adminToken ? (
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
              onBack={() => router.push("/choix-profil")}
            />
          ) : (
            <AdminDashboard
              adminToken={adminToken}
              onLogout={handleLogout}
              onNavigateToUser={() => router.push("/intervenant")}
            />
          )}
        </div>
      </section>

      <footer className="site-footer">
        <p>Administration GenQR • Vos données sont sécurisées</p>
      </footer>
    </main>
  );
}

