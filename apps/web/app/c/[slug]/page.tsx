"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CardData {
  id: string;
  slug: string;
  imageUrl: string;
  cardUrl: string;
  createdAt: string;
}

export default function CardViewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

    fetch(`${apiUrl}/cards/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Cette carte de visite est introuvable ou a été supprimée.");
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

  return (
    <main className="landing-page scene-ready">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <Link className="brand brand-small" href="/" aria-label="GenQR - accueil">
          <span>Gen</span>QR
        </Link>
        <p className="header-note">Vos contacts, en un scan.</p>
      </header>

      <section className="hero">
        <div className="action-panel" style={{ opacity: 1, transform: "none", width: "100%", maxWidth: "680px" }}>
          {loading && (
            <div>
              <p className="eyebrow">Chargement</p>
              <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 16px" }}>
                Récupération de la <span>carte...</span>
              </h1>
              <div
                style={{
                  minHeight: "240px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.03)",
                  borderRadius: "20px",
                  margin: "24px 0",
                }}
              >
                <span style={{ color: "var(--orange-dark)", fontWeight: 600 }}>Chargement de la carte...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div>
              <p className="eyebrow">Introuvable</p>
              <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 16px" }}>
                Carte <span>non trouvée</span>
              </h1>
              <p className="hero-description" style={{ margin: "0 auto 28px" }}>
                {error}
              </p>
              <div className="action-buttons">
                <Link href="/" className="cta-button">
                  Créer ma propre carte
                </Link>
              </div>
            </div>
          )}

          {!loading && card && (
            <div>
              <p className="eyebrow">Carte de visite partagée</p>
              <h1 className="brand" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 20px" }}>
                <span>Visit</span>Card
                <span>Gen</span>QR
              </h1>

              <div
                style={{
                  background: "#ffffff",
                  padding: "16px",
                  borderRadius: "24px",
                  boxShadow: "0 18px 45px rgba(24, 20, 17, 0.12)",
                  margin: "0 auto 28px",
                  maxWidth: "540px",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt="Carte de visite"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "420px",
                    objectFit: "contain",
                    borderRadius: "16px",
                    display: "block",
                  }}
                />
              </div>

              <div className="action-buttons">
                <a
                  href={card.imageUrl}
                  download={`carte-visite-${card.slug}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                  </svg>
                  Enregistrer l&apos;image
                </a>

                <Link
                  href="/"
                  className="cta-button"
                  style={{ background: "transparent", color: "var(--ink)", borderColor: "currentColor" }}
                >
                  Créer ma carte
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <span className="footer-dot" /> Simple à créer. Facile à partager.
      </footer>
    </main>
  );
}

