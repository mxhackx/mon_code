"use client";

import { useState, useEffect } from "react";
import AdminCardsList, { CardSummary } from "./AdminCardsList";
import AdminSettingsForm from "./AdminSettingsForm";
import { useFile } from "../../context/FileContext";

interface AdminDashboardProps {
  adminToken: string;
  onLogout: () => void;
  onNavigateToUser: () => void;
}

export default function AdminDashboard({ adminToken, onLogout, onNavigateToUser }: AdminDashboardProps) {
  const { refreshAccessToken } = useFile();
  const [adminTab, setAdminTab] = useState<"cards" | "settings">("cards");
  const [cardsList, setCardsList] = useState<CardSummary[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

    const fetchCards = async () => {
      try {
        let token = adminToken;
        let res = await fetch(`${apiUrl}/cards`, {
      credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Si le token a expiré, tentative de rafraîchissement automatique
        if (res.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            token = newToken;
            res = await fetch(`${apiUrl}/cards`, {
      credentials: 'include',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
        }

        if (res.status === 401) {
          throw new Error("SESSION_EXPIRED");
        }
        if (!res.ok) {
          throw new Error("FETCH_FAILED");
        }

        const data: CardSummary[] = await res.json();
        if (isSubscribed) {
          setCardsList(data);
          setIsLoadingCards(false);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          setIsLoadingCards(false);
          const message = err instanceof Error ? err.message : "";
          if (message === "SESSION_EXPIRED") {
            setErrorMessage("Votre session a expiré. Déconnexion automatique...");
            setTimeout(() => onLogout(), 2000);
          } else {
            setErrorMessage("Impossible de joindre le serveur pour récupérer les cartes.");
          }
        }
      }
    };

    fetchCards();

    return () => {
      isSubscribed = false;
    };
  }, [adminToken, onLogout, refreshAccessToken]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.12)", color: "#065f46", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
          Session Administrateur active
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            background: "none",
            border: "1px solid rgba(0,0,0,0.15)",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer",
            color: "#625852",
          }}
        >
          Se déconnecter
        </button>
      </div>

      <h1 className="brand" style={{ fontSize: "clamp(30px, 4vw, 44px)", margin: "0 0 10px", textAlign: "left" }}>
        Tableau de bord <span>Admin</span>
      </h1>

      {errorMessage && (
        <div
          style={{
            background: "#fef3f2",
            border: "1px solid #fecdca",
            color: "#b42318",
            padding: "12px 16px",
            borderRadius: "12px",
            fontSize: "13.5px",
            fontWeight: 600,
            marginBottom: "16px",
            textAlign: "left",
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Onglets Admin */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${adminTab === "cards" ? "active" : ""}`}
          onClick={() => setAdminTab("cards")}
        >
          Cartes enregistrées ({cardsList.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${adminTab === "settings" ? "active" : ""}`}
          onClick={() => setAdminTab("settings")}
        >
          Sécurité & Identifiants
        </button>
      </div>

      {/* Contenu des onglets */}
      {adminTab === "cards" ? (
        <AdminCardsList
          cards={cardsList}
          isLoading={isLoadingCards}
          onCreateFirstCard={onNavigateToUser}
        />
      ) : (
        <AdminSettingsForm adminToken={adminToken} />
      )}
    </div>
  );
}
