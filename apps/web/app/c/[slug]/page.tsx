"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CardData {
  id: string;
  slug: string;
  imageUrl: string;
  cardUrl: string;
  restaurantName?: string | null;
  logoUrl?: string | null;
  locationUrl?: string | null;
  phoneNumber?: string | null;
  menuImages?: string[];
  themeId?: string | null;
  qrStyle?: string | null;
  createdAt: string;
}

const THEME_INFO: Record<string, { label: string; className: string }> = {
  "theme-1": { label: "Élégant & Or", className: "restaurant-theme-1" },
  "theme-2": { label: "Bistrot Chaleureux", className: "restaurant-theme-2" },
  "theme-3": { label: "Minimaliste & Épuré", className: "restaurant-theme-3" },
  "theme-4": { label: "Gourmet & Botanique", className: "restaurant-theme-4" },
  "theme-5": { label: "Vibrant & Street Food", className: "restaurant-theme-5" },
};

export default function CardViewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state for menu images
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

    fetch(`${apiUrl}/cards/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Cette carte ou ce restaurant est introuvable.");
        }
        return res.json();
      })
      .then((data: CardData) => {
        if (isMounted) {
          setCard(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const menuImages = card?.menuImages && card.menuImages.length > 0 ? card.menuImages : [];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : menuImages.length - 1));
  }, [menuImages.length]);

  const handleNextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev < menuImages.length - 1 ? prev + 1 : 0));
  }, [menuImages.length]);

  // Clavier pour la lightbox (Echap, flèches gauche/droite)
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handlePrevImage, handleNextImage]);

  const isRestaurantView = Boolean(card?.restaurantName || menuImages.length > 0);

  // Téléchargement automatique immédiat de la carte de visite au scan (mode direct)
  useEffect(() => {
    if (!card || isRestaurantView) return;

    let isCancelled = false;

    const autoDownload = () => {
      if (isCancelled || !card) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";
      const link = document.createElement("a");
      link.href = `${apiUrl}/cards/${card.slug}/download`;
      link.download = `carte-visite-${card.slug}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const timer = setTimeout(autoDownload, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [card, isRestaurantView]);

  // Déterminer la classe du thème (défaut : theme-1)
  const themeClass = card?.themeId && THEME_INFO[card.themeId]
    ? THEME_INFO[card.themeId].className
    : "restaurant-theme-1";

  const themeLabel = card?.themeId && THEME_INFO[card.themeId]
    ? THEME_INFO[card.themeId].label
    : "Menu Digital";

  // Validation de sécurité pour les URL externes (protection anti-XSS contre javascript:)
  const safeLocationUrl = (() => {
    if (!card?.locationUrl) return null;
    const trimmed = card.locationUrl.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return null;
  })();

  // URL WhatsApp personnalisée (avec normalisation pour wa.me)
  const cleanPhone = (() => {
    if (!card?.phoneNumber) return null;
    let digits = card.phoneNumber.replace(/[^0-9]/g, "");
    if (digits.startsWith("00")) {
      digits = digits.substring(2);
    }
    return digits.length >= 8 ? digits : null;
  })();

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Bonjour ${card?.restaurantName || ""}, je vous contacte suite à la consultation de votre menu en ligne.`
      )}`
    : null;

  // Écran de chargement
  if (loading) {
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
          <div className="action-panel" style={{ opacity: 1, transform: "none", maxWidth: "680px" }}>
            <p className="eyebrow">Chargement</p>
            <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 16px" }}>
              Ouverture du <span>menu...</span>
            </h1>
            <div
              style={{
                minHeight: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.03)",
                borderRadius: "20px",
                margin: "24px 0",
              }}
            >
              <span style={{ color: "var(--orange)", fontWeight: 700 }}>Chargement des données...</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Écran d'erreur
  if (error || !card) {
    return (
      <main className="landing-page scene-ready">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <header className="site-header">
          <Link className="brand brand-small" href="/choix-profil" aria-label="MonCode - accueil">
            <span>Mon</span>Code
          </Link>
          <p className="header-note">Vos menus digitaux, en un scan.</p>
        </header>

        <section className="hero">
          <div className="action-panel" style={{ opacity: 1, transform: "none", maxWidth: "580px" }}>
            <p className="eyebrow">Introuvable</p>
            <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 16px" }}>
              Menu <span>non trouvé</span>
            </h1>
            <p className="hero-description" style={{ margin: "0 auto 28px" }}>
              {error || "Ce menu n'existe pas ou a été désactivé."}
            </p>
            <div className="action-buttons">
              <Link href="/" className="cta-button">
                Créer un menu avec MonCode
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Mode Carte de Visite Directe : "sur aucun plan sans rien en background, juste la carte correspondante et son téléchargement directement lancé"
  if (!isRestaurantView) {
    return (
      <main
        style={{
          minHeight: "100svh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          margin: 0,
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Affichage pur et centré de la carte de visite sans aucun arrière-plan perturbateur */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.imageUrl}
          alt="Carte de visite"
          style={{
            maxWidth: "96vw",
            maxHeight: "88vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            borderRadius: "14px",
            boxShadow: "0 14px 48px rgba(0, 0, 0, 0.7)",
            display: "block",
          }}
        />

        {/* Bouton discret de téléchargement / secours en bas de l'écran */}
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            zIndex: 30,
          }}
        >
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/cards/${card.slug}/download`}
            download={`carte-visite-${card.slug}.webp`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(12px)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              padding: "9px 20px",
              borderRadius: "999px",
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
            </svg>
            <span>Télécharger la carte</span>
          </a>
        </div>
      </main>
    );
  }

  // VUE DU RESTAURANT SELON LE THÈME CHOISI
  return (
    <main className={`menu-view-root ${themeClass}`}>
      <div className="menu-view-content">
        {/* En-tête restaurant avec logo et nom */}
        <header className="resto-header">
          {card.logoUrl ? (
            <div className="resto-logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.logoUrl}
                alt={card.restaurantName || "Logo restaurant"}
                className="resto-logo-img"
              />
            </div>
          ) : (
            <div className="resto-logo-box">
              <span className="resto-logo-fallback">
                {card.restaurantName ? card.restaurantName.charAt(0).toUpperCase() : "🍽️"}
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <h1 className="resto-name">{card.restaurantName || "Notre Menu"}</h1>
          </div>
        </header>

        {/* Boutons d'action : WhatsApp prioritaire, Maps, Appel */}
        <section className="resto-actions">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-resto"
              id="whatsapp-cta"
            >
              {/* Icône officielle WhatsApp */}
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29" />
              </svg>
              <span>Discuter / Commander sur WhatsApp</span>
            </a>
          )}

          <div className="resto-sub-actions">
            {safeLocationUrl && (
              <a
                href={safeLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-resto-secondary"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z" />
                  <circle cx="12" cy="9" r="3" />
                </svg>
                <span>Localisation & Itinéraire</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="btn-resto-secondary"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Appeler {card.phoneNumber}</span>
              </a>
            )}
          </div>
        </section>

        {/* Galerie des photos du menu */}
        <section className="resto-menu-section">
          <div className="resto-menu-header">
            <h2 className="resto-menu-title">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Notre Carte & Menus
            </h2>
            {menuImages.length > 0 && (
              <span className="resto-menu-count">
                {menuImages.length} {menuImages.length > 1 ? "pages" : "page"}
              </span>
            )}
          </div>

          {menuImages.length > 0 ? (
            <div className="resto-menu-grid">
              {menuImages.map((imgUrl, index) => (
                <div
                  key={index}
                  className="resto-menu-card"
                  onClick={() => handleOpenLightbox(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleOpenLightbox(index);
                    }
                  }}
                  aria-label={`Agrandir la page de menu ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Menu ${card.restaurantName || ""} page ${index + 1}`}
                    className="resto-menu-img"
                    loading="lazy"
                  />
                  <div className="resto-menu-overlay">
                    <span className="resto-menu-page-badge">Page {index + 1}</span>
                    <span className="resto-menu-zoom-hint">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      Agrandir
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "36px 20px",
                background: "var(--theme-card-bg)",
                border: "1.5px dashed var(--theme-border)",
                borderRadius: "20px",
                color: "var(--theme-muted)",
              }}
            >
              <p style={{ margin: 0, fontSize: "15px" }}>
                Les photos du menu seront bientôt disponibles.
              </p>
            </div>
          )}
        </section>

        {/* Pied de page discret */}
        <footer
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "12px",
            color: "var(--theme-muted)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <p style={{ margin: 0 }}>
            Propulsé par <Link href="/" style={{ color: "var(--theme-accent)", fontWeight: 700, textDecoration: "none" }}>MonCode</Link>
          </p>
        </footer>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && menuImages.length > 0 && (
        <div
          className="lightbox-backdrop"
          onClick={handleCloseLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu du menu plein écran"
        >
          {/* Barre supérieure avec compteur et bouton fermer */}
          <div className="lightbox-topbar" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-counter">
              Page {activeImageIndex + 1} / {menuImages.length}
            </span>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={handleCloseLightbox}
              aria-label="Fermer l'aperçu"
            >
              ✕
            </button>
          </div>

          {/* Navigation précédent */}
          {menuImages.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn lightbox-nav-prev"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              aria-label="Image précédente"
            >
              ‹
            </button>
          )}

          {/* Image active */}
          <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={menuImages[activeImageIndex]}
              alt={`Menu ${card.restaurantName || ""} page ${activeImageIndex + 1}`}
              className="lightbox-img"
            />
          </div>

          {/* Navigation suivant */}
          {menuImages.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn lightbox-nav-next"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              aria-label="Image suivante"
            >
              ›
            </button>
          )}
        </div>
      )}
    </main>
  );
}


