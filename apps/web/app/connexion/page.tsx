"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, LockKeyhole, AlertCircle } from "lucide-react";
import { useFile } from "../context/FileContext";

const BRAND = {
  blue: "#2F8CFF",
  blueDark: "#1670E8",
  blueSoft: "#EEF6FF",

  violet: "#7357E8",
  violetSoft: "#F3F0FF",

  ink: "#080B10",
  muted: "#697382",

  line: "#E8EBEF",
  soft: "#F8F9FB",
};

export default function ConnexionPage() {
  const router = useRouter();
  const { loginSession, authToken, authRole, isAuthLoading } = useFile();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && authToken && authRole) {
      if (authRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/intervenant");
      }
    }
  }, [authToken, authRole, isAuthLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError("Veuillez renseigner votre identifiant et votre mot de passe.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

      const res = await fetch(`${apiUrl}/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));

        throw new Error(
          errData.message || "Identifiant ou mot de passe incorrect"
        );
      }

      const data = await res.json();

      const role: "admin" | "user" =
        data.user?.role === "admin" ? "admin" : "user";

      loginSession(
        data.access_token,
        role,
        {
          id: data.user?.id,
          email: data.user?.email,
        },
        data.refresh_token
      );

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/intervenant");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de se connecter au serveur"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        color: BRAND.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          width: "100%",
          height: "72px",
          borderBottom: `1px solid ${BRAND.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(20px, 5vw, 72px)",
          background: "#FFFFFF",
        }}
      >
        <Link
          href="/"
          aria-label="MonCode - accueil"
          style={{
            textDecoration: "none",
            color: BRAND.ink,
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.8px",
          }}
        >
          <span>Mon</span>
          <span style={{ color: BRAND.blue }}>Code</span>
          <span
            style={{
              display: "inline-block",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: BRAND.violet,
              marginLeft: "3px",
              marginBottom: "2px",
            }}
          />
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: BRAND.muted,
          }}
        >
          <LockKeyhole size={14} strokeWidth={2} />
          <span>Espace sécurisé</span>
        </div>
      </header>

      {/* CONTENT */}
      <section
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 20px 72px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
          }}
        >
          {/* BACK */}
          <div style={{ marginBottom: "30px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: BRAND.muted,
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
            >
              <ArrowLeft size={15} />
              Retour à l&apos;accueil
            </Link>
          </div>

          {/* INTRO */}
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 11px",
                borderRadius: "999px",
                background: BRAND.blueSoft,
                border: `1px solid #DCEEFF`,
                color: BRAND.blueDark,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.2px",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: BRAND.blue,
                }}
              />
              Accès professionnel
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(32px, 6vw, 46px)",
                lineHeight: 1.05,
                letterSpacing: "-1.8px",
                fontWeight: 800,
                color: BRAND.ink,
              }}
            >
              Bienvenue
              <br />
              sur <span style={{ color: BRAND.blue }}>MonCode.</span>
            </h1>

            <p
              style={{
                margin: "16px 0 0",
                maxWidth: "410px",
                color: BRAND.muted,
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              Connectez-vous pour accéder à votre espace de gestion ou
              poursuivre la création de vos cartes.
            </p>
          </div>

          {/* LOGIN CARD */}
          <div
            style={{
              border: `1px solid ${BRAND.line}`,
              borderRadius: "20px",
              background: "#FFFFFF",
              padding: "26px",
              boxShadow: "0 12px 40px rgba(8, 11, 16, 0.06)",
            }}
          >
            <form
              onSubmit={handleLogin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {/* IDENTIFIER */}
              <div>
                <label
                  htmlFor="connexion-id"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: BRAND.ink,
                    fontSize: "13px",
                    fontWeight: 650,
                  }}
                >
                  Identifiant ou email
                </label>

                <input
                  id="connexion-id"
                  type="text"
                  placeholder="ex. admin ou user@moncode.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="username"
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "11px",
                    border: `1px solid ${BRAND.line}`,
                    background: BRAND.soft,
                    padding: "0 14px",
                    color: BRAND.ink,
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition:
                      "border-color 0.2s ease, background 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = BRAND.blue;
                    e.currentTarget.style.background = "#FFFFFF";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = BRAND.line;
                    e.currentTarget.style.background = BRAND.soft;
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <label
                    htmlFor="connexion-pass"
                    style={{
                      color: BRAND.ink,
                      fontSize: "13px",
                      fontWeight: 650,
                    }}
                  >
                    Mot de passe
                  </label>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    id="connexion-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "11px",
                      border: `1px solid ${BRAND.line}`,
                      background: BRAND.soft,
                      padding: "0 48px 0 14px",
                      color: BRAND.ink,
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      transition:
                        "border-color 0.2s ease, background 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = BRAND.blue;
                      e.currentTarget.style.background = "#FFFFFF";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = BRAND.line;
                      e.currentTarget.style.background = BRAND.soft;
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "12px",
                      transform: "translateY(-50%)",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      background: "transparent",
                      color: BRAND.muted,
                      cursor: "pointer",
                      borderRadius: "8px",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "9px",
                    padding: "11px 13px",
                    borderRadius: "11px",
                    background: "#FFF6F5",
                    border: "1px solid #F4D3D0",
                    color: "#B42318",
                    fontSize: "12px",
                    lineHeight: 1.45,
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "50px",
                  marginTop: "2px",
                  border: "none",
                  borderRadius: "11px",
                  background: isLoading
                    ? "#8CBFFF"
                    : BRAND.blue,
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition:
                    "background 0.2s ease, transform 0.2s ease",
                  boxShadow: "0 6px 18px rgba(47, 140, 255, 0.18)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = BRAND.blueDark;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = BRAND.blue;
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {isLoading ? "Vérification en cours..." : "Se connecter"}
                {!isLoading && <span>→</span>}
              </button>
            </form>

            {/* INFO */}
            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: `1px solid ${BRAND.line}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    background: BRAND.violetSoft,
                    color: BRAND.violet,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LockKeyhole size={15} />
                </div>

                <div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      color: BRAND.ink,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Redirection automatique
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: BRAND.muted,
                      fontSize: "11px",
                      lineHeight: 1.55,
                    }}
                  >
                    Votre espace sera ouvert automatiquement selon votre
                    rôle après connexion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE INFORMATION */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginTop: "14px",
            }}
          >
            <div
              style={{
                border: `1px solid ${BRAND.line}`,
                borderRadius: "12px",
                padding: "13px 14px",
                background: BRAND.soft,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "11px",
                  fontWeight: 750,
                  color: BRAND.ink,
                }}
              >
                Administrateur
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "10px",
                  lineHeight: 1.45,
                  color: BRAND.muted,
                }}
              >
                Gestion des cartes et du tableau de bord.
              </p>
            </div>

            <div
              style={{
                border: `1px solid ${BRAND.line}`,
                borderRadius: "12px",
                padding: "13px 14px",
                background: BRAND.soft,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "11px",
                  fontWeight: 750,
                  color: BRAND.ink,
                }}
              >
                Utilisateur
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "10px",
                  lineHeight: 1.45,
                  color: BRAND.muted,
                }}
              >
                Accès direct à la création de vos cartes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          width: "100%",
          borderTop: `1px solid ${BRAND.line}`,
          padding: "20px",
          textAlign: "center",
          background: "#FFFFFF",
        }}
      >
        <p
          style={{
            margin: 0,
            color: BRAND.muted,
            fontSize: "11px",
          }}
        >
          Connexion sécurisée ·{" "}
          <span style={{ color: BRAND.blue, fontWeight: 650 }}>
            MonCode
          </span>
        </p>
      </footer>
    </main>
  );
}
