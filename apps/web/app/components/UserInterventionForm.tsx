"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useFile, UserInfo } from "../context/FileContext";

interface UserInterventionFormProps {
  onBack: () => void;
}

export default function UserInterventionForm({ onBack }: UserInterventionFormProps) {
  const router = useRouter();
  const { userInfo, setUserInfo } = useFile();
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
    if (userFormError) {
      setUserFormError(null);
    }
  };

  const handleUserFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !userInfo.userName.trim() ||
      !userInfo.clientName.trim() ||
      !userInfo.workDone.trim() ||
      !userInfo.amountReceived.trim()
    ) {
      setUserFormError("Veuillez remplir tous les champs obligatoires avant de continuer.");
      return;
    }

    setUserFormError(null);
    router.push("/restaurant");
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

      <p className="eyebrow">Étape 1 sur 2 — Informations d&apos;intervention</p>
      <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 10px" }}>
        Fiche <span>Client</span> & Travaux
      </h1>
      <p className="hero-description" style={{ margin: "0 auto 24px", maxWidth: "520px" }}>
        Veuillez renseigner les détails ci-dessous avant d&apos;accéder au chargement de votre carte de visite.
      </p>

      <form onSubmit={handleUserFormSubmit} className="user-form">
        <div className="form-row">
          <div className="admin-input-group">
            <label className="admin-label" htmlFor="user-name">
              Nom et prénoms *
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
            placeholder="Ex: Conception graphique, pose d'enseigne, installation et configuration réseau..."
            value={userInfo.workDone}
            onChange={(e) => handleUserInfoChange("workDone", e.target.value)}
            rows={3}
            required
          />
        </div>

        {userFormError && (
          <div style={{ color: "#b42318", background: "#fef3f2", border: "1px solid #fecdca", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
            ⚠️ {userFormError}
          </div>
        )}

        <div style={{ marginTop: "8px" }}>
          <button type="submit" className="cta-button" style={{ width: "100%" }}>
            Continuer vers les informations du restaurant →
          </button>
        </div>
      </form>
    </>
  );
}

