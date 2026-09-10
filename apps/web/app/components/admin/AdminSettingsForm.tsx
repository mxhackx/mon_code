"use client";

import { useState, FormEvent } from "react";

interface AdminSettingsFormProps {
  adminToken: string;
}

export default function AdminSettingsForm({ adminToken }: AdminSettingsFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  const handleUpdateCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setCredError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!newEmail.trim() && !newPassword.trim()) {
      setCredError("Veuillez renseigner au moins un champ à modifier.");
      return;
    }

    setIsUpdatingCreds(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
      const payload: { newEmail?: string; newPassword?: string } = {};
      if (newEmail.trim()) payload.newEmail = newEmail.trim();
      if (newPassword.trim()) payload.newPassword = newPassword.trim();

      const res = await fetch(`${apiUrl}/auth/admin/credentials`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Échec de la mise à jour des identifiants");
      }

      setCredSuccess("Identifiants mis à jour avec succès !");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setCredError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "20px", padding: "28px 24px", maxWidth: "480px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "18px", margin: "0 0 8px", color: "var(--ink)", textAlign: "left" }}>
        Modifier mes identifiants
      </h2>
      <p style={{ fontSize: "13px", color: "#625852", margin: "0 0 20px", textAlign: "left", lineHeight: 1.5 }}>
        Changez votre adresse email ou votre mot de passe administrateur. Les modifications sont enregistrées dans Supabase Auth et synchronisées.
      </p>

      <form onSubmit={handleUpdateCredentials} className="admin-form" style={{ maxWidth: "100%" }}>
        <div className="admin-input-group">
          <label className="admin-label" htmlFor="new-email">
            Nouvelle adresse email (optionnel)
          </label>
          <input
            id="new-email"
            type="email"
            className="admin-input"
            placeholder="nouvel-admin@domaine.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>

        <div className="admin-input-group">
          <label className="admin-label" htmlFor="new-pass">
            Nouveau mot de passe (optionnel)
          </label>
          <input
            id="new-pass"
            type="password"
            className="admin-input"
            placeholder="Minimum 6 caractères"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="admin-input-group">
          <label className="admin-label" htmlFor="confirm-pass">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm-pass"
            type="password"
            className="admin-input"
            placeholder="Répétez le nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {credSuccess && (
          <div style={{ color: "#065f46", background: "#d1fae5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
            ✅ {credSuccess}
          </div>
        )}

        {credError && (
          <div style={{ color: "#b42318", background: "#fef3f2", border: "1px solid #fecdca", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
            ⚠️ {credError}
          </div>
        )}

        <button
          type="submit"
          className="cta-button"
          disabled={isUpdatingCreds}
          style={{ width: "100%", marginTop: "10px" }}
        >
          {isUpdatingCreds ? "Enregistrement..." : "Mettre à jour mes identifiants"}
        </button>
      </form>
    </div>
  );
}

