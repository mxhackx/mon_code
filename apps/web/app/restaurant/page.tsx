"use client";

import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";

export default function RestaurantPage() {
  const router = useRouter();
  const {
    restaurantInfo,
    setRestaurantInfo,
    setRestaurantLogo,
    addMenuFiles,
    removeMenuFile,
  } = useFile();

  const [formError, setFormError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const menuInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (field: "restaurantName" | "locationUrl" | "phoneNumber", val: string) => {
    setRestaurantInfo((prev) => ({ ...prev, [field]: val }));
    if (formError) setFormError(null);
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestaurantLogo(file);
    }
    e.target.value = "";
  };

  const handleMenuChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addMenuFiles(Array.from(files));
    }
    e.target.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!restaurantInfo.restaurantName.trim()) {
      setFormError("Veuillez renseigner le nom du restaurant.");
      return;
    }

    const trimmedPhone = restaurantInfo.phoneNumber.trim();
    if (!trimmedPhone) {
      setFormError("Veuillez renseigner le numéro WhatsApp du restaurant.");
      return;
    }

    // Validation du format international (doit commencer par + ou avoir l'indicatif)
    const digitsOnly = trimmedPhone.replace(/[^0-9]/g, "");
    if (!trimmedPhone.startsWith("+") && !trimmedPhone.startsWith("00") && digitsOnly.length < 10) {
      setFormError(
        "Veuillez indiquer l'indicatif pays pour le numéro WhatsApp (ex: +229 01 57 48 20 21 ou +33 6 12 34 56 78).",
      );
      return;
    }

    const trimmedLocation = restaurantInfo.locationUrl.trim();
    if (!trimmedLocation) {
      setFormError("Veuillez renseigner le lien de localisation Google Maps.");
      return;
    }

    if (!trimmedLocation.startsWith("http://") && !trimmedLocation.startsWith("https://")) {
      setFormError("Le lien de localisation doit être une URL valide (ex: https://maps.app.goo.gl/...).");
      return;
    }

    if (restaurantInfo.menuFiles.length === 0 && !restaurantInfo.logoFile) {
      setFormError("Veuillez charger au moins une photo du menu ou le logo du restaurant.");
      return;
    }

    setFormError(null);
    router.push("/personnalisation");
  };

  return (
    <main className="landing-page scene-ready">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <Link className="brand brand-small" href="/" aria-label="MonCode - accueil">
          <span>Mon</span>Code
        </Link>
        <p className="header-note">Vos menus digitaux, en un scan.</p>
      </header>

      <section className="hero">
        <div className="action-panel" style={{ opacity: 1, transform: "none", maxWidth: "680px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button
              type="button"
              className="change-role-btn"
              onClick={() => router.push("/intervenant")}
              style={{ margin: 0 }}
            >
              ← Retour à l&apos;intervenant
            </button>
            <span style={{ fontSize: "12px", color: "var(--orange-dark)", fontWeight: 700, background: "rgba(239, 106, 34, 0.1)", padding: "4px 10px", borderRadius: "999px" }}>
              Étape 2 / 3
            </span>
          </div>

          <p className="eyebrow">Informations de l&apos;établissement</p>
          <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 40px)", margin: "0 0 10px" }}>
            Fiche <span>Restaurant</span> & Menu
          </h1>
          <p className="hero-description" style={{ margin: "0 auto 24px" }}>
            Renseignez l&apos;identité du restaurant, son contact WhatsApp et chargez les photos de sa carte.
          </p>

          <form onSubmit={handleSubmit} className="user-form" style={{ maxWidth: "100%" }}>
            {/* Nom du Restaurant */}
            <div className="admin-input-group">
              <label className="admin-label" htmlFor="resto-name">
                Nom du restaurant *
              </label>
              <input
                id="resto-name"
                type="text"
                className="admin-input"
                placeholder="Ex: Le Gourmet Parisien, Chez Marco Pizzeria..."
                value={restaurantInfo.restaurantName}
                onChange={(e) => handleTextChange("restaurantName", e.target.value)}
                required
              />
            </div>

            {/* Numéro WhatsApp & Lien Localisation */}
            <div className="form-row">
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="resto-phone">
                  Numéro WhatsApp (avec indicatif pays) *
                </label>
                <input
                  id="resto-phone"
                  type="tel"
                  className="admin-input"
                  placeholder="Ex: +229 01 57 48 20 21 ou +33 6 12 34 56 78"
                  value={restaurantInfo.phoneNumber}
                  onChange={(e) => handleTextChange("phoneNumber", e.target.value)}
                  required
                />
                <small style={{ color: "#8a7a70", fontSize: "11px", marginTop: "2px" }}>
                  Obligatoire avec indicatif (+229, +33...) pour ouvrir la discussion WhatsApp directe.
                </small>
              </div>

              <div className="admin-input-group">
                <label className="admin-label" htmlFor="resto-location">
                  Lien de localisation (Maps / Waze) *
                </label>
                <input
                  id="resto-location"
                  type="url"
                  className="admin-input"
                  placeholder="https://maps.app.goo.gl/..."
                  value={restaurantInfo.locationUrl}
                  onChange={(e) => handleTextChange("locationUrl", e.target.value)}
                  required
                />
                <small style={{ color: "#8a7a70", fontSize: "11px", marginTop: "2px" }}>
                  Lien d&apos;itinéraire pour les clients du restaurant.
                </small>
              </div>
            </div>

            {/* Logo du Restaurant */}
            <div className="admin-input-group" style={{ marginTop: "6px" }}>
              <label className="admin-label">
                Logo de l&apos;établissement (optionnel mais conseillé)
              </label>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                accept="image/png,image/jpeg,.jpg,.jpeg,.png,.webp"
                style={{ display: "none" }}
              />

              {restaurantInfo.logoPreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={restaurantInfo.logoPreview}
                    alt="Aperçu logo"
                    style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>
                      {restaurantInfo.logoFile?.name ?? "Logo sélectionné"}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#8a7a70" }}>
                      Prêt pour l&apos;intégration sur le thème
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRestaurantLogo(null)}
                    style={{ background: "none", border: "none", color: "#b42318", cursor: "pointer", fontSize: "12.5px", fontWeight: 600 }}
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    background: "#ffffff",
                    border: "1.5px dashed rgba(239, 106, 34, 0.4)",
                    borderRadius: "14px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    color: "var(--orange-dark)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                  }}
                >
                  + Choisir le logo du restaurant
                </button>
              )}
            </div>

            {/* Photos du Menu */}
            <div className="admin-input-group" style={{ marginTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label className="admin-label">
                  Photos du menu ({restaurantInfo.menuFiles.length} photo{restaurantInfo.menuFiles.length > 1 ? "s" : ""}) *
                </label>
                <span style={{ fontSize: "11.5px", color: "#8a7a70" }}>
                  Plats, pages de carte, formules...
                </span>
              </div>

              <input
                type="file"
                ref={menuInputRef}
                onChange={handleMenuChange}
                accept="image/png,image/jpeg,.jpg,.jpeg,.png,.webp"
                multiple
                style={{ display: "none" }}
              />

              {restaurantInfo.menuPreviews.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px", margin: "8px 0" }}>
                  {restaurantInfo.menuPreviews.map((preview, idx) => (
                    <div
                      key={preview}
                      style={{
                        position: "relative",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.1)",
                        height: "100px",
                        background: "#000",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Menu page ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeMenuFile(idx)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "rgba(0,0,0,0.7)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                        aria-label="Supprimer cette photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => menuInputRef.current?.click()}
                style={{
                  background: "rgba(239, 106, 34, 0.06)",
                  border: "1.5px dashed var(--orange)",
                  borderRadius: "14px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  color: "var(--orange-dark)",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {restaurantInfo.menuFiles.length > 0 ? "+ Ajouter d'autres photos de menu" : "Ajouter les photos du menu"}
              </button>
            </div>

            {formError && (
              <div style={{ color: "#b42318", background: "#fef3f2", border: "1px solid #fecdca", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginTop: "10px" }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ marginTop: "16px" }}>
              <button type="submit" className="cta-button" style={{ width: "100%" }}>
                Continuer vers le choix du thème & QR Code →
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="site-footer">
        <p>Scannez et partagez en un instant • Propulsé par MonCode</p>
      </footer>
    </main>
  );
}

