"use client";

import { useId, useState, ChangeEvent } from "react";
import Link from "next/link";

interface QrResult {
  slug: string;
  cardUrl: string;
  qrCode: string;
  imageUrl: string;
}

export default function CarteVisitePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [copied, setCopied] = useState(false);
  const inputId = useId();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setQrResult(null);
      setError(null);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setQrResult(null);
    setError(null);
  };

  const handleGenerateQr = async () => {
    if (!file) return;

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("themeId", "direct");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
      const response = await fetch(`${apiUrl}/cards/visite`, {
      credentials: 'include',
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
      // ignore
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
        <p className="header-note">Générateur direct de carte de visite.</p>
      </header>

      <section className="hero">
        <div className="action-panel" style={{ opacity: 1, transform: "none", maxWidth: "660px", width: "100%" }}>
          {qrResult ? (
            // Vue de succès : QR Code généré
            <div>
              <p className="eyebrow">QR Code prêt à l&apos;emploi</p>
              <h1 className="brand" style={{ fontSize: "clamp(30px, 5vw, 44px)", margin: "0 0 14px" }}>
                Votre QR Code est <span>généré !</span>
              </h1>
              <p className="hero-description" style={{ margin: "0 auto 24px", maxWidth: "520px" }}>
                Toute personne scannant ce code verra uniquement votre carte de visite et son téléchargement se déclenchera automatiquement.
              </p>

              {/* Affichage du QR Code */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "24px",
                  boxShadow: "0 14px 34px rgba(239, 106, 34, 0.16)",
                  display: "inline-block",
                  margin: "0 auto 20px",
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
                <p style={{ fontSize: "13px", color: "#8a7a70", marginBottom: "6px" }}>Lien direct :</p>
                <code
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {qrResult.cardUrl}
                </code>
              </div>

              <div className="action-buttons" style={{ justifyContent: "center" }}>
                <a
                  href={qrResult.qrCode}
                  download={`moncode-${qrResult.slug}.png`}
                  className="cta-button"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                  </svg>
                  Télécharger le QR Code
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="cta-button"
                  style={{ background: "transparent", color: "var(--ink)", borderColor: "currentColor" }}
                >
                  {copied ? "✓ Lien copié !" : "Copier le lien"}
                </button>

                <a
                  href={qrResult.cardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                  style={{ background: "#181411", borderColor: "#181411", color: "#ffffff" }}
                >
                  Tester le rendu direct →
                </a>
              </div>

              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setQrResult(null);
                    handleRemove();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--orange-dark)",
                    cursor: "pointer",
                    fontSize: "14px",
                    textDecoration: "underline",
                  }}
                >
                  Générer une autre carte de visite
                </button>
              </div>
            </div>
          ) : (
            // Formulaire de chargement de carte
            <div>
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
                <Link
                  href="/"
                  className="change-role-btn"
                  style={{ margin: 0, textDecoration: "none" }}
                >
                  ← Retour à l&apos;accueil
                </Link>
              </div>

              <p className="eyebrow">Mode Express Direct</p>
              <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 10px" }}>
                Carte de Visite <span>Directe</span>
              </h1>
              <p className="hero-description" style={{ margin: "0 auto 24px", maxWidth: "520px" }}>
                Chargez simplement l&apos;image de votre carte de visite. Le QR Code généré affichera directement votre carte en plein écran et déclenchera son téléchargement automatique au scan.
              </p>

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
                      accept="image/png,image/jpeg,.jpg,.jpeg,.png,.webp"
                      className="image-upload-input"
                      onChange={handleFileChange}
                    />
                    <label htmlFor={inputId} className="image-upload-dropzone">
                      <div className="image-upload-icon">+</div>
                      <strong>Choisir ma carte de visite</strong>
                      <small>Glissez ou cliquez pour sélectionner votre image (PNG, JPG, WEBP)</small>
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
                <button
                  type="button"
                  className="cta-button"
                  onClick={handleGenerateQr}
                  disabled={!file || isGenerating}
                  style={{
                    width: "100%",
                    maxWidth: "340px",
                    opacity: !file || isGenerating ? 0.6 : 1,
                    cursor: !file || isGenerating ? "not-allowed" : "pointer",
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h3v3h-3zM18 18h3v3h-3z" />
                  </svg>
                  {isGenerating ? "Génération du QR Code..." : "Générer mon QR Code direct"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <p>Scannez et téléchargez en un instant • Propulsé par MonCode</p>
      </footer>
    </main>
  );
}

