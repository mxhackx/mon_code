"use client";

import {
  useId,
  useState,
  ChangeEvent,
  type ReactNode,
  type ElementType,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileImage,
  QrCode,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

interface QrResult {
  slug: string;
  cardUrl: string;
  qrCode: string;
  imageUrl: string;
}

const BRAND = {
  blue: "#2F8CFF",
  blueDark: "#1670E8",
  blueSoft: "#EAF4FF",

  orange: "#FF5A36",
  orangeDark: "#E84525",
  orangeSoft: "#FFF1ED",

  ink: "#080B10",
  dark: "#10151D",
  muted: "#687181",

  surface: "#F7F9FC",
  line: "#E8ECF2",
};

/* =========================================================
   BADGE
========================================================= */

function SectionBadge({
  children,
  accent = "blue",
}: {
  children: ReactNode;
  accent?: "blue" | "orange";
}) {
  const orange = accent === "orange";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
      style={{
        borderColor: orange
          ? "rgba(255,90,54,.18)"
          : "rgba(47,140,255,.18)",
        backgroundColor: orange
          ? BRAND.orangeSoft
          : BRAND.blueSoft,
        color: orange
          ? BRAND.orangeDark
          : BRAND.blueDark,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: orange
            ? BRAND.orange
            : BRAND.blue,
        }}
      />

      {children}
    </motion.div>
  );
}

/* =========================================================
   BUTTON
========================================================= */

function SimpleButton({
  children,
  variant = "orange",
  icon: Icon = ArrowRight,
  disabled = false,
  onClick,
  href,
  download,
  target,
}: {
  children: ReactNode;
  variant?: "orange" | "dark" | "light";
  icon?: ElementType;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  download?: string;
  target?: string;
}) {
  const styles = {
    orange:
      "bg-[#FF5A36] text-white shadow-[0_8px_20px_rgba(255,90,54,.12)] hover:bg-[#E84525]",
    dark:
      "bg-[#080B10] text-white hover:bg-[#171C24]",
    light:
      "border border-[#E5E9EF] bg-[#F5F7FA] text-[#080B10] hover:bg-[#ECEFF3]",
  };

  const content = (
    <motion.span
      whileHover={!disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 24,
      }}
      className={`
        group inline-flex h-12 items-center justify-center gap-3
        rounded-[12px] px-5 text-[13px] font-semibold
        tracking-[-0.01em] transition-colors duration-200
        ${styles[variant]}
        ${disabled ? "cursor-not-allowed opacity-40" : ""}
      `}
    >
      <span>{children}</span>

      <motion.span
        className="flex h-6 w-6 items-center justify-center"
        whileHover={!disabled ? { x: 3 } : undefined}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
        }}
      >
        <Icon size={15} strokeWidth={2} />
      </motion.span>
    </motion.span>
  );

  if (href) {
    return (
      <Link
        href={href}
        download={download}
        target={target}
        className="inline-flex"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex"
    >
      {content}
    </button>
  );
}

/* =========================================================
   DECORATIVE BACKGROUND
========================================================= */

function DecorativeGrid() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#10151D 1px, transparent 1px), linear-gradient(90deg, #10151D 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, black 0%, transparent 75%)",
        }}
      />

      <div
        className="pointer-events-none absolute -left-48 top-20 h-[500px] w-[500px] rounded-full blur-[150px]"
        style={{
          background: "rgba(47,140,255,.055)",
        }}
      />

      <div
        className="pointer-events-none absolute -right-48 top-[35%] h-[500px] w-[500px] rounded-full blur-[150px]"
        style={{
          background: "rgba(255,90,54,.045)",
        }}
      />
    </>
  );
}

/* =========================================================
   UPLOAD ICON
========================================================= */

function UploadVisual() {
  return (
    <div className="relative h-[74px] w-[74px]">
      <div
        className="absolute inset-0 rounded-[20px]"
        style={{
          backgroundColor: BRAND.blueSoft,
        }}
      />

      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[14px] bg-white shadow-[0_8px_25px_rgba(47,140,255,.12)]"
        style={{
          color: BRAND.blue,
        }}
      >
        <Upload size={21} strokeWidth={2} />
      </motion.div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function CarteVisitePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [copied, setCopied] = useState(false);

  const inputId = useId();

  /* =========================================================
     FILE
  ========================================================= */

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setQrResult(null);
    setError(null);
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

  /* =========================================================
     GENERATE
  ========================================================= */

  const handleGenerateQr = async () => {
    if (!file) return;

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("themeId", "direct");

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5500";

      const response = await fetch(`${apiUrl}/cards/visite`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errData.message ||
            "Erreur lors de la génération du QR code"
        );
      }

      const data: QrResult = await response.json();

      setQrResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de joindre le serveur";

      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  /* =========================================================
     COPY
  ========================================================= */

  const handleCopyLink = async () => {
    if (!qrResult) return;

    try {
      await navigator.clipboard.writeText(qrResult.cardUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // ignore
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    handleRemove();
    setCopied(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#080B10]">
      <DecorativeGrid />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-20 mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-6 lg:px-10">
        <Link
          href="/"
          aria-label="MonCode - accueil"
          className="text-[21px] font-black tracking-[-0.07em]"
        >
          <span>Mon</span>
          <span style={{ color: BRAND.orange }}>Code</span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: BRAND.blue,
            }}
          />

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A929E]">
            Carte de visite digitale
          </span>
        </div>

        <Link
          href="/"
          className="group flex items-center gap-2 text-[12px] font-semibold text-[#687181] transition-colors hover:text-[#080B10]"
        >
          <ArrowLeft
            size={15}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          Retour
        </Link>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="relative z-10 mx-auto w-full max-w-[1180px] px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pt-14">
        <AnimatePresence mode="wait">
          {!qrResult ? (
            /* =================================================
               UPLOAD STATE
            ================================================= */

            <motion.div
              key="upload"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
                {/* LEFT */}
                <div className="lg:pb-8">
                  <SectionBadge accent="orange">
                    Mode Express Direct
                  </SectionBadge>

                  <h1 className="mt-7 max-w-[560px] text-[clamp(48px,6vw,78px)] font-black leading-[0.91] tracking-[-0.07em]">
                    Votre carte.
                    <br />
                    <span
                      style={{
                        color: BRAND.orange,
                      }}
                    >
                      Un seul scan.
                    </span>
                  </h1>

                  <p className="mt-7 max-w-[500px] text-[15px] leading-7 text-[#687181]">
                    Transformez simplement votre carte de visite
                    en un QR Code partageable. Votre carte s&apos;ouvre
                    directement après le scan.
                  </p>

                  <div className="mt-9 flex items-center gap-3 text-[11px] font-semibold text-[#7B8490]">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: BRAND.blueSoft,
                        color: BRAND.blue,
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </span>

                    Aucun profil à créer
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-[#7B8490]">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: BRAND.blueSoft,
                        color: BRAND.blue,
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </span>

                    Votre carte reste exactement la même
                  </div>
                </div>

                {/* RIGHT — UPLOAD CARD */}
                <div>
                  <div className="overflow-hidden rounded-[26px] border border-[#E8ECF2] bg-[#F7F9FC]">
                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between border-b border-[#E8ECF2] px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-[9px]"
                          style={{
                            backgroundColor: BRAND.blueSoft,
                            color: BRAND.blue,
                          }}
                        >
                          <QrCode size={15} />
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#687181]">
                          Générateur
                        </span>
                      </div>

                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#A0A7B1]">
                        01 / 01
                      </span>
                    </div>

                    <div className="p-5 sm:p-7">
                      {!previewUrl ? (
                        <>
                          <input
                            id={inputId}
                            type="file"
                            accept="image/png,image/jpeg,.jpg,.jpeg,.png,.webp"
                            className="sr-only"
                            onChange={handleFileChange}
                          />

                          <label
                            htmlFor={inputId}
                            className="group relative flex min-h-[370px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed border-[#CDD4DE] bg-white px-6 text-center transition-all duration-300 hover:border-[#9FC2EF] hover:bg-[#FCFEFF]"
                          >
                            <div
                              className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[90px] transition-opacity duration-500 group-hover:opacity-100"
                              style={{
                                background:
                                  "rgba(47,140,255,.10)",
                              }}
                            />

                            <div className="relative">
                              <UploadVisual />
                            </div>

                            <h2 className="relative mt-7 text-[20px] font-bold tracking-[-0.035em]">
                              Importez votre carte
                            </h2>

                            <p className="relative mt-2 max-w-[350px] text-[12px] leading-6 text-[#7B8490]">
                              Glissez votre image ici ou cliquez
                              pour sélectionner votre carte de visite.
                            </p>

                            <div className="relative mt-7 inline-flex h-11 items-center gap-2 rounded-[11px] bg-[#080B10] px-5 text-[12px] font-semibold text-white transition-colors group-hover:bg-[#151A22]">
                              <FileImage size={15} />
                              Choisir une image
                            </div>

                            <p className="relative mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-[#A0A7B1]">
                              PNG · JPG · WEBP
                            </p>
                          </label>
                        </>
                      ) : (
                        /* PREVIEW */
                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.98,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          className="overflow-hidden rounded-[20px] border border-[#E2E6EC] bg-white"
                        >
                          <div className="flex items-center justify-between border-b border-[#E8ECF2] px-4 py-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
                                style={{
                                  backgroundColor: BRAND.blueSoft,
                                  color: BRAND.blue,
                                }}
                              >
                                <FileImage size={15} />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[230px] truncate text-[11px] font-semibold text-[#080B10]">
                                  {file?.name}
                                </p>

                                <p className="mt-0.5 text-[9px] text-[#929AA6]">
                                  {file
                                    ? `${(
                                        file.size / 1024
                                      ).toFixed(1)} Ko`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRemove}
                              disabled={isGenerating}
                              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#7C8591] transition-colors hover:bg-[#F3F4F6] hover:text-[#080B10] disabled:opacity-40"
                              aria-label="Supprimer l'image"
                            >
                              <X size={15} />
                            </button>
                          </div>

                          <div className="flex min-h-[370px] items-center justify-center bg-[#F7F9FC] p-5">
                            <div className="relative max-h-[350px] max-w-full overflow-hidden rounded-[13px] border border-[#E3E7EC] bg-white shadow-[0_18px_45px_rgba(8,11,16,.08)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt="Aperçu de votre carte de visite"
                                className="block max-h-[340px] max-w-full object-contain"
                              />

                              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-[8px] bg-[#080B10]/80 px-2.5 py-1.5 text-[9px] font-bold text-white backdrop-blur-md">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: BRAND.blue,
                                  }}
                                />
                                Aperçu
                              </div>
                            </div>
                          </div>

                          <label
                            htmlFor={inputId}
                            className="flex cursor-pointer items-center justify-center border-t border-[#E8ECF2] py-3.5 text-[10px] font-semibold text-[#687181] transition-colors hover:text-[#080B10]"
                          >
                            Changer d&apos;image
                          </label>
                        </motion.div>
                      )}

                      {/* ERROR */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                              y: -5,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                              y: -5,
                            }}
                            className="mt-4 overflow-hidden"
                          >
                            <div className="flex items-start gap-3 rounded-[11px] border border-[#F3C5C0] bg-[#FFF7F6] px-4 py-3 text-[11px] leading-5 text-[#B42318]">
                              <span className="font-bold">!</span>
                              <span>{error}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ACTION */}
                      <div className="mt-6 flex flex-col items-center">
                        <SimpleButton
                          disabled={!file || isGenerating}
                          onClick={handleGenerateQr}
                          icon={QrCode}
                        >
                          {isGenerating
                            ? "Génération..."
                            : "Générer mon QR Code"}
                        </SimpleButton>

                        <p className="mt-3 text-center text-[9px] text-[#9AA1AC]">
                          Génération sécurisée · Accès instantané
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM STEPS */}
              <div className="mx-auto mt-14 grid max-w-[900px] border-y border-[#E8ECF2] sm:grid-cols-3">
                {[
                  {
                    number: "01",
                    title: "Importez",
                    text: "Votre carte de visite.",
                  },
                  {
                    number: "02",
                    title: "Générez",
                    text: "Votre QR Code unique.",
                  },
                  {
                    number: "03",
                    title: "Partagez",
                    text: "Un scan suffit.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.number}
                    className={`
                      px-5 py-5
                      ${
                        index !== 0
                          ? "border-t border-[#E8ECF2] sm:border-l sm:border-t-0"
                          : ""
                      }
                    `}
                  >
                    <span
                      className="text-[9px] font-bold tracking-[0.16em]"
                      style={{
                        color: BRAND.blue,
                      }}
                    >
                      {item.number}
                    </span>

                    <h3 className="mt-2 text-[13px] font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-[11px] text-[#7C8591]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* =================================================
               SUCCESS STATE
            ================================================= */

            <motion.div
              key="success"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mx-auto max-w-[900px]">
                {/* TITLE */}
                <div className="mb-10 text-center">
                  <SectionBadge>
                    QR Code prêt à l&apos;emploi
                  </SectionBadge>

                  <h1 className="mt-7 text-[clamp(44px,6vw,72px)] font-black leading-[0.92] tracking-[-0.07em]">
                    Votre identité.
                    <br />
                    <span
                      style={{
                        color: BRAND.orange,
                      }}
                    >
                      Prête à scanner.
                    </span>
                  </h1>

                  <p className="mx-auto mt-6 max-w-[560px] text-[14px] leading-7 text-[#687181]">
                    Votre QR Code donne maintenant accès directement
                    à votre carte de visite.
                  </p>
                </div>

                {/* RESULT */}
                <div className="relative overflow-hidden rounded-[28px] border border-[#E8ECF2] bg-[#F7F9FC] p-5 sm:p-8">
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 h-44 w-80 -translate-x-1/2 rounded-full blur-[100px]"
                    style={{
                      background: "rgba(47,140,255,.10)",
                    }}
                  />

                  <div className="relative flex flex-col items-center">
                    {/* QR */}
                    <motion.div
                      initial={{
                        scale: 0.9,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        delay: 0.1,
                        duration: 0.45,
                      }}
                      className="relative rounded-[22px] border border-[#E4E8ED] bg-white p-5 shadow-[0_20px_60px_rgba(8,11,16,.08)] sm:p-6"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrResult.qrCode}
                        alt={`QR Code pour la carte ${qrResult.slug}`}
                        className="block h-auto w-[min(68vw,270px)]"
                      />

                      <div
                        className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#F7F9FC]"
                        style={{
                          backgroundColor: BRAND.blue,
                        }}
                      >
                        <Check
                          size={13}
                          color="#fff"
                          strokeWidth={3}
                        />
                      </div>
                    </motion.div>

                    {/* URL */}
                    <div className="mt-8 w-full max-w-[560px]">
                      <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-[#9AA1AC]">
                        Votre lien MonCode
                      </p>

                      <div className="flex items-center gap-2 rounded-[12px] border border-[#E1E5EA] bg-white p-1.5">
                        <code className="min-w-0 flex-1 truncate px-3 text-center text-[11px] font-medium text-[#687181]">
                          {qrResult.cardUrl}
                        </code>

                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="flex h-9 shrink-0 items-center gap-2 rounded-[9px] bg-[#F1F3F6] px-3 text-[10px] font-bold text-[#080B10] transition-colors hover:bg-[#E8EBEF]"
                        >
                          {copied ? (
                            <>
                              <Check size={13} />
                              Copié
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                      <SimpleButton
                        href={qrResult.qrCode}
                        download={`moncode-${qrResult.slug}.png`}
                        icon={Download}
                      >
                        Télécharger
                      </SimpleButton>

                      <SimpleButton
                        href={qrResult.cardUrl}
                        target="_blank"
                        variant="dark"
                        icon={ExternalLink}
                      >
                        Tester le rendu
                      </SimpleButton>
                    </div>
                  </div>
                </div>

                {/* RESET */}
                <div className="mt-7 flex justify-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="group inline-flex items-center gap-2 text-[11px] font-semibold text-[#687181] transition-colors hover:text-[#080B10]"
                  >
                    <RefreshCw
                      size={13}
                      className="transition-transform duration-300 group-hover:rotate-180"
                    />

                    Générer une autre carte
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative z-10 border-t border-[#EEF0F3]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row lg:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA1AC]">
            MonCode
          </p>

          <p className="text-[10px] text-[#A0A6AF]">
            Votre identité. Un scan.
          </p>
        </div>
      </footer>
    </main>
  );
}
