"use client";

import Link from "next/link";

export interface CardSummary {
  id: string;
  slug: string;
  imageUrl: string;
  cardUrl: string;
  userName?: string | null;
  clientName?: string | null;
  workDone?: string | null;
  amountReceived?: string | null;
  createdAt: string;
}

interface AdminCardsListProps {
  cards: CardSummary[];
  isLoading: boolean;
  onCreateFirstCard: () => void;
}

export default function AdminCardsList({ cards, isLoading, onCreateFirstCard }: AdminCardsListProps) {
  if (isLoading) {
    return <p style={{ color: "#625852", padding: "30px 0" }}>Chargement des cartes...</p>;
  }

  if (cards.length === 0) {
    return (
      <div style={{ background: "rgba(0,0,0,0.02)", border: "1px dashed rgba(0,0,0,0.1)", borderRadius: "16px", padding: "40px 20px" }}>
        <p style={{ margin: "0 0 12px", color: "#625852", fontSize: "15px" }}>
          Aucune carte n&apos;a encore été enregistrée.
        </p>
        <button type="button" className="cta-button" onClick={onCreateFirstCard}>
          Créer une première carte
        </button>
      </div>
    );
  }

  return (
    <div className="admin-cards-grid">
      {cards.map((card) => (
        <div key={card.id} className="admin-card-item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.imageUrl} alt={`Carte ${card.slug}`} className="admin-card-thumb" />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
            <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block" }}>
              #{card.slug}
            </strong>
            {card.amountReceived && (
              <span className="admin-amount-badge">
                {card.amountReceived}
              </span>
            )}
          </div>

          <small style={{ color: "#8a7a70", fontSize: "12px", textAlign: "left" }}>
            {new Date(card.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>

          {/* Métadonnées intervention / client */}
          {(card.clientName || card.userName || card.workDone) && (
            <div className="admin-card-meta">
              {card.clientName && (
                <div className="admin-meta-row">
                  <span className="meta-label">Client :</span>
                  <span className="meta-val">{card.clientName}</span>
                </div>
              )}
              {card.userName && (
                <div className="admin-meta-row">
                  <span className="meta-label">Intervenant :</span>
                  <span className="meta-val">{card.userName}</span>
                </div>
              )}
              {card.workDone && (
                <div className="admin-meta-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "3px" }}>
                  <span className="meta-label">Travaux :</span>
                  <span className="meta-val-block">{card.workDone}</span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
            <Link
              href={`/c/${card.slug}`}
              className="cta-button"
              style={{
                minHeight: "36px",
                padding: "0 14px",
                fontSize: "12px",
                flex: 1,
              }}
            >
              Voir la carte
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

