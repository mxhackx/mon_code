"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LogOut,
  UserRound,
  Building2,
  Wallet,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useFile, UserInfo } from "../context/FileContext";

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

export default function IntervenantPage() {
  const router = useRouter();

  const {
    userInfo,
    setUserInfo,
    authToken,
    isAuthLoading,
    logoutSession,
  } = useFile();

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !authToken) {
      router.push("/connexion");
    }
  }, [authToken, isAuthLoading, router]);

  const handleUserInfoChange = (
    field: keyof UserInfo,
    value: string
  ) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formError) {
      setFormError(null);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !userInfo.userName.trim() ||
      !userInfo.clientName.trim() ||
      !userInfo.workDone.trim() ||
      !userInfo.amountReceived.trim()
    ) {
      setFormError(
        "Veuillez remplir tous les champs obligatoires avant de continuer."
      );
      return;
    }

    setFormError(null);
    router.push("/restaurant");
  };

  const handleLogout = () => {
    logoutSession();
    router.push("/connexion");
  };

  if (isAuthLoading || !authToken) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: BRAND.muted,
          fontSize: "13px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              border: `2px solid ${BRAND.line}`,
              borderTopColor: BRAND.blue,
              animation: "spin 0.8s linear infinite",
            }}
          />

          <span>Vérification de l&apos;authentification...</span>
        </div>

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

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

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            height: "36px",
            padding: "0 13px",
            borderRadius: "9px",
            border: `1px solid ${BRAND.line}`,
            background: "#FFFFFF",
            color: BRAND.muted,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#D5D9DE";
            e.currentTarget.style.color = BRAND.ink;
            e.currentTarget.style.background = BRAND.soft;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = BRAND.line;
            e.currentTarget.style.color = BRAND.muted;
            e.currentTarget.style.background = "#FFFFFF";
          }}
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </header>

      {/* CONTENT */}
      <section
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "48px 20px 70px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
          }}
        >
          {/* TOP NAVIGATION */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "30px",
            }}
          >
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
              }}
            >
              <ArrowLeft size={15} />
              Accueil
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 11px",
                borderRadius: "999px",
                background: BRAND.blueSoft,
                border: "1px solid #DCEEFF",
                color: BRAND.blueDark,
                fontSize: "11px",
                fontWeight: 700,
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
              Étape 1 sur 3
            </div>
          </div>

          {/* INTRO */}
          <div
            style={{
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: BRAND.violet,
                fontSize: "11px",
                fontWeight: 750,
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                marginBottom: "13px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "1px",
                  background: BRAND.violet,
                }}
              />
              Fiche d&apos;intervention
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(30px, 5vw, 44px)",
                lineHeight: 1.08,
                letterSpacing: "-1.6px",
                fontWeight: 800,
                color: BRAND.ink,
              }}
            >
              Fiche intervenant
              <br />
              <span style={{ color: BRAND.blue }}>& client.</span>
            </h1>

            <p
              style={{
                margin: "15px 0 0",
                maxWidth: "580px",
                color: BRAND.muted,
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              Renseignez les informations de l&apos;intervention avant
              d&apos;accéder à la saisie du restaurant et de son menu.
            </p>
          </div>

          {/* PROGRESS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "22px",
            }}
          >
            {[
              { number: "01", label: "Intervention", active: true },
              { number: "02", label: "Restaurant", active: false },
              { number: "03", label: "Carte", active: false },
            ].map((step, index) => (
              <div
                key={step.number}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: index < 2 ? 1 : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "27px",
                      height: "27px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: step.active
                        ? BRAND.blue
                        : BRAND.soft,
                      border: step.active
                        ? "none"
                        : `1px solid ${BRAND.line}`,
                      color: step.active
                        ? "#FFFFFF"
                        : BRAND.muted,
                      fontSize: "9px",
                      fontWeight: 800,
                    }}
                  >
                    {step.active ? (
                      <Check size={13} strokeWidth={2.5} />
                    ) : (
                      step.number
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: step.active ? 700 : 550,
                      color: step.active
                        ? BRAND.ink
                        : BRAND.muted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {index < 2 && (
                  <div
                    style={{
                      height: "1px",
                      background: BRAND.line,
                      flex: 1,
                      margin: "0 14px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* FORM CARD */}
          <div
            style={{
              background: "#FFFFFF",
              border: `1px solid ${BRAND.line}`,
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(8, 11, 16, 0.055)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 26px",
                borderBottom: `1px solid ${BRAND.line}`,
                background: BRAND.soft,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: BRAND.blueSoft,
                    color: BRAND.blue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={18} />
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: 750,
                      color: BRAND.ink,
                    }}
                  >
                    Informations de l&apos;intervention
                  </p>

                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "11px",
                      color: BRAND.muted,
                    }}
                  >
                    Tous les champs marqués d&apos;un * sont obligatoires.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleFormSubmit}
              style={{
                padding: "26px",
              }}
            >
              {/* NAME ROW */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                {/* INTERVENANT */}
                <div>
                  <label
                    htmlFor="user-name"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "8px",
                      color: BRAND.ink,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    <UserRound size={14} color={BRAND.blue} />
                    Nom de l&apos;intervenant *
                  </label>

                  <input
                    id="user-name"
                    type="text"
                    placeholder="Ex. Jean Dupont"
                    value={userInfo.userName}
                    onChange={(e) =>
                      handleUserInfoChange(
                        "userName",
                        e.target.value
                      )
                    }
                    required
                    style={inputStyle}
                  />
                </div>

                {/* CLIENT */}
                <div>
                  <label
                    htmlFor="client-name"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "8px",
                      color: BRAND.ink,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    <Building2 size={14} color={BRAND.violet} />
                    Nom complet du client *
                  </label>

                  <input
                    id="client-name"
                    type="text"
                    placeholder="Ex. Entreprise Alpha"
                    value={userInfo.clientName}
                    onChange={(e) =>
                      handleUserInfoChange(
                        "clientName",
                        e.target.value
                      )
                    }
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* AMOUNT */}
              <div style={{ marginTop: "18px" }}>
                <label
                  htmlFor="amount-received"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    marginBottom: "8px",
                    color: BRAND.ink,
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  <Wallet size={14} color={BRAND.blue} />
                  Montant reçu *
                </label>

                <input
                  id="amount-received"
                  type="text"
                  placeholder="Ex. 50 000 FCFA ou 150 €"
                  value={userInfo.amountReceived}
                  onChange={(e) =>
                    handleUserInfoChange(
                      "amountReceived",
                      e.target.value
                    )
                  }
                  required
                  style={inputStyle}
                />
              </div>

              {/* WORK */}
              <div style={{ marginTop: "18px" }}>
                <label
                  htmlFor="work-done"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    marginBottom: "8px",
                    color: BRAND.ink,
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  <FileText size={14} color={BRAND.violet} />
                  Travaux effectués *
                </label>

                <textarea
                  id="work-done"
                  placeholder="Ex. Conception du menu digital, configuration QR Code, impression du support..."
                  value={userInfo.workDone}
                  onChange={(e) =>
                    handleUserInfoChange(
                      "workDone",
                      e.target.value
                    )
                  }
                  rows={4}
                  required
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: "112px",
                    paddingTop: "13px",
                    paddingBottom: "13px",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* ERROR */}
              {formError && (
                <div
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "9px",
                    marginTop: "18px",
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

                  <span>{formError}</span>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  height: "50px",
                  marginTop: "24px",
                  border: "none",
                  borderRadius: "11px",
                  background: BRAND.blue,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow:
                    "0 7px 20px rgba(47, 140, 255, 0.18)",
                  transition:
                    "background 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BRAND.blueDark;
                  e.currentTarget.style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BRAND.blue;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>
                  Continuer vers les informations du restaurant
                </span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* BOTTOM NOTE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginTop: "18px",
              color: BRAND.muted,
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: BRAND.violet,
              }}
            />
            Les informations seront utilisées pour générer votre parcours
            MonCode.
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
          Scannez et partagez en un instant ·{" "}
          <span
            style={{
              color: BRAND.blue,
              fontWeight: 650,
            }}
          >
            MonCode
          </span>
        </p>
      </footer>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "48px",
  borderRadius: "10px",
  border: `1px solid ${BRAND.line}`,
  background: BRAND.soft,
  padding: "0 13px",
  color: BRAND.ink,
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, background 0.2s ease",
};
