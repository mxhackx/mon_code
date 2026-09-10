"use client";

interface RoleSelectorProps {
  onSelectRole: (role: "user" | "admin") => void;
}

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <>
      <p className="eyebrow">Sélectionnez votre espace</p>
      <h1 className="brand" style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 14px", lineHeight: 1 }}>
        Bienvenue sur <span>Gen</span>QR
      </h1>
      <p className="hero-description" style={{ margin: "0 auto 10px" }}>
        Choisissez votre profil pour accéder à votre espace dédié.
      </p>

      <div className="role-grid">
        {/* Case Utilisateur */}
        <button
          type="button"
          className="role-card"
          onClick={() => onSelectRole("user")}
          aria-label="Accéder à l'espace Utilisateur"
        >
          <div className="role-icon-box">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="role-card-title">Utilisateur</h2>
          <p className="role-card-desc">
            Renseignez votre intervention, chargez votre carte de visite et générez votre QR code unique.
          </p>
          <span className="role-card-badge">
            Accéder à l&apos;espace →
          </span>
        </button>

        {/* Case Administrateur */}
        <button
          type="button"
          className="role-card role-admin"
          onClick={() => onSelectRole("admin")}
          aria-label="Accéder à l'espace Administrateur"
        >
          <div className="role-icon-box">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="role-card-title">Administrateur</h2>
          <p className="role-card-desc">
            Supervisez la plateforme, consultez les cartes générées et modifiez vos paramètres de sécurité.
          </p>
          <span className="role-card-badge">
            Accéder à l&apos;espace →
          </span>
        </button>
      </div>
    </>
  );
}

