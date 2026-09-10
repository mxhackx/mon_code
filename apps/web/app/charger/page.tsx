"use client";

import { useId, useState, ChangeEvent } from "react";
import Link from "next/link";
import { useFile } from "../context/FileContext";

interface QrResult {
  slug: string;
  cardUrl: string;
  qrCode: string;
  imageUrl: string;
}

export default function ChargerPage() {
  const { file, previewUrl, setFile, clearFile, setHasSeenIntro, userInfo } = useFile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [copied, setCopied] = useState(false);
  const inputId = useId();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setQrResult(null);
      setError(null);
    }
  };

  const handleRemove = () => {
    clearFile();
    setQrResult(null);
    setError(null);
  };

  const handleBack = () => {
    setHasSeenIntro(true);
  };

  const handleGenerateQr = async () => {
    if (!file) return;

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (userInfo.userName) formData.append("userName", userInfo.userName);
      if (userInfo.clientName) formData.append("clientName", userInfo.clientName);
      if (userInfo.workDone) formData.append("workDone", userInfo.workDone);
      if (userInfo.amountReceived) formData.append("amountReceived", userInfo.amountReceived);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
      const response = await fetch(`${apiUrl}/cards`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Erreur lors de la génération du QR code");
      }

      const data: QrResult = await response.json();
      setQrResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Impossible de joindre le serveur";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!qrResult) return;
    try {
      await navigator.clipboard.writeText(qrResult.cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback si le presse-papier est restreint
    }
  };

  return (
    <main className="landing-page scene-ready">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <Link className="brand brand-small" href="/" onClick={handleBack} aria-label="GenQR - accueil">
          <span>Gen</span>QR
        </Link>
        <p className="header-note">Vos contacts, en un scan.</p>
      </header>

      <section className="hero">
        <div className="action-panel" style={{ opacity: 1, transform: "none" }}>
          {qrResult ? (
            // Vue de succès : QR Code généré
            <>
              <p className="eyebrow">QR Code créé avec succès</p>
              <h1 className="brand" style={{ fontSize: "clamp(32px, 5vw, 48px)", margin: "0 0 16px" }}>
                Votre carte est <span>prête !</span>
              </h1>
              <p className="hero-description" style={{ margin: "0 auto 20px" }}>
                Scannez ce QR Code avec un smartphone pour afficher votre carte de visite.
              </p>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "24px",
                  boxShadow: "0 14px 34px rgba(239, 106, 34, 0.15)",
                  display: "inline-block",
                  margin: "0 auto 24px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrResult.qrCode}
                  alt={`QR Code pour la carte ${qrResult.slug}`}
                  style={{ width: "min(70vw, 240px)", height: "auto", display: "block" }}
                />
              </div>

              <div style={{ margin: "0 auto 24px", wordBreak: "break-all" }}>
                <p style={{ fontSize: "14px", color: "#625852", marginBottom: "8px" }}>Lien direct :</p>
                <code
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  {qrResult.cardUrl}
                </code>
              </div>

              <div className="action-buttons">
                <a
                  href={qrResult.qrCode}
                  download={`genqr-${qrResult.slug}.png`}
                  className="cta-button"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                  </svg>
                  Télécharger le QR Code
                </a>

                <button type="button" onClick={handleCopyLink} className="cta-button" style={{ background: "transparent", color: "var(--ink)", borderColor: "currentColor" }}>
                  {copied ? "✓ Lien copié !" : "Copier le lien"}
                </button>

                <Link
                  href={`/c/${qrResult.slug}`}
                  className="cta-button"
                  style={{ background: "#181411", borderColor: "#181411", color: "#fff" }}
                >
                  Voir ma carte
                </Link>
              </div>

              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setQrResult(null)}
                  style={{ background: "none", border: "none", color: "var(--orange-dark)", cursor: "pointer", fontSize: "14px", textDecoration: "underline" }}
                >
                  Modifier l&apos;image ou régénérer
                </button>
              </div>
            </>
          ) : (
            // Vue de sélection & confirmation
            <>
              <p className="eyebrow">Traitement de votre carte</p>
              <h1 className="brand" style={{ fontSize: "clamp(32px, 5vw, 48px)", margin: "0 0 16px" }}>
                Carte <span>sélectionnée</span>
              </h1>

              {(userInfo.clientName || userInfo.userName || userInfo.workDone || userInfo.amountReceived) && (
                <div className="user-recap-box">
                  <div className="recap-header">
                    <span className="recap-title">Détails de l&apos;intervention</span>
                    <Link href="/" className="recap-edit-btn">
                      Modifier
                    </Link>
                  </div>
                  <div className="recap-grid">
                    {userInfo.userName && (
                      <div className="recap-item">
                        <span className="recap-label">Nom et prénoms :</span>
                        <strong className="recap-value">{userInfo.userName}</strong>
                      </div>
                    )}
                    {userInfo.clientName && (
                      <div className="recap-item">
                        <span className="recap-label">Client :</span>
                        <strong className="recap-value">{userInfo.clientName}</strong>
                      </div>
                    )}
                    {userInfo.amountReceived && (
                      <div className="recap-item">
                        <span className="recap-label">Montant reçu :</span>
                        <span className="amount-badge">{userInfo.amountReceived}</span>
                      </div>
                    )}
                    {userInfo.workDone && (
                      <div className="recap-item" style={{ gridColumn: "1 / -1" }}>
                        <span className="recap-label">Travaux effectués :</span>
                        <p className="recap-text">{userInfo.workDone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="image-upload" style={{ margin: "0 auto 24px" }}>
                {previewUrl ? (
                  <div className="image-upload-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Aperçu de votre carte de visite" />
                    <button
                      type="button"
                      className="image-upload-remove"
                      onClick={handleRemove}
                      aria-label="Supprimer ou changer l'image"
                      disabled={isGenerating}
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/png,image/jpeg,.jpg,.jpeg,.png"
                      className="image-upload-input"
                      onChange={handleFileChange}
                    />
                    <label htmlFor={inputId} className="image-upload-dropzone">
                      <div className="image-upload-icon">+</div>
                      <strong>Aucune image sélectionnée</strong>
                      <small>Cliquez ici pour choisir une photo de votre carte de visite</small>
                    </label>
                  </div>
                )}
              </div>

              {file && (
                <p className="hero-description" style={{ margin: "0 auto 20px" }}>
                  Fichier : <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} Ko)
                </p>
              )}

              {error && (
                <div
                  style={{
                    color: "#b42318",
                    background: "#fef3f2",
                    border: "1px solid #fecdca",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    maxWidth: "480px",
                    margin: "0 auto 20px",
                    fontSize: "14px",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              <div className="action-buttons">
                <Link
                  href="/"
                  onClick={handleBack}
                  className="cta-button"
                  style={{ background: "transparent", color: "var(--ink)", borderColor: "currentColor" }}
                >
                  Retour
                </Link>
                {file && (
                  <button
                    type="button"
                    className="cta-button"
                    onClick={handleGenerateQr}
                    disabled={isGenerating}
                    style={{ opacity: isGenerating ? 0.7 : 1 }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h3v3h-3zM18 18h3v3h-3z" />
                    </svg>
                    {isGenerating ? "Génération en cours..." : "Générer mon code QR"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <span className="footer-dot" /> Simple à créer. Facile à partager.
      </footer>
    </main>
  );
}
