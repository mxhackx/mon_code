"use client";
import RestaurantCardLayout from "../../components/RestaurantCardLayout";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CardData {
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

  // Déterminer la classe du thème
  const isCustomTheme = card?.themeId && card.themeId.startsWith("theme-");
  const themeClass = isCustomTheme ? `restaurant-${card.themeId}` : "daisy-theme-wrapper";
  const dataTheme = !isCustomTheme ? card?.themeId : undefined;

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

  // Écran de chargement (Minimaliste & Anonyme)
  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f9fafb",
        color: "#6b7280",
        fontFamily: "sans-serif"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(0,0,0,0.1)",
          borderTopColor: "#374151",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "16px"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: "16px", fontWeight: 500 }}>Chargement en cours...</span>
      </div>
    );
  }

  // Écran d'erreur
  if (error || !card) {
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

  // VUE DU RESTAURANT SELON LE THÈME CHOISI
  return (
    <main className={`menu-view-root ${themeClass} p-0 overflow-hidden`} data-theme={dataTheme} style={{ minHeight: "100svh" }}>
      <RestaurantCardLayout 
        restaurantName={card.restaurantName || ""}
        logoUrl={card.logoUrl || undefined}
        locationUrl={safeLocationUrl || undefined}
        phoneNumber={cleanPhone || undefined}
        menuImages={card.menuImages || []}
      />
    </main>
  );
}


