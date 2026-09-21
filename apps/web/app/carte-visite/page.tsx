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
  blueSoft: "#EEF6FF",

  violet: "#7357E8",
  violetSoft: "#F3F0FF",

  ink: "#080B10",
  muted: "#697382",

  line: "#E8EBEF",
  soft: "#F8F9FB",
};

/* =========================================================
   BADGE
========================================================= */

function SectionBadge({
  children,
  accent = "blue",
}: {
  children: ReactNode;
  accent?: "blue" | "violet";
}) {
  const isViolet = accent === "violet";

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em]"
      style={{
        borderColor: isViolet
          ? "#E5DFFF"
          : "#DCEBFB",
        backgroundColor: isViolet
          ? BRAND.violetSoft
          : BRAND.blueSoft,
        color: isViolet
          ? BRAND.violet
          : BRAND.blueDark,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: isViolet
            ? BRAND.violet
            : BRAND.blue,
        }}
      />

      {children}
    </div>
  );
}

/* =========================================================
   BUTTON
========================================================= */

function SimpleButton({
  children,
  variant = "blue",
  icon: Icon = ArrowRight,
  disabled = false,
  onClick,
  href,
  download,
  target,
}: {
  children: ReactNode;
  variant?: "blue" | "dark" | "light";
  icon?: ElementType;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  download?: string;
  target?: string;
}) {
  const styles = {
    blue:
      "bg-[#2F8CFF] text-white hover:bg-[#1670E8]",
    dark:
      "bg-[#080B10] text-white hover:bg-[#171C24]",
    light:
      "border border-[#E5E9EF] bg-white text-[#080B10] hover:bg-[#F6F7F9]",
  };

  const content = (
    <motion.span
      whileHover={!disabled ? { y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={`
        inline-flex h-11 items-center justify-center gap-2.5
        rounded-[10px] px-4.5 text-[12px] font-semibold
        tracking-[-0.01em] transition-colors duration-200
        ${styles[variant]}
        ${disabled ? "cursor-not-allowed opacity-40" : ""}
      `}
    >
      <span>{children}</span>

      <Icon size={14} strokeWidth={2} />
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
   UPLOAD VISUAL
========================================================= */

function UploadVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex h-14 w-14 items-center justify-center"
    >
      <div
        className="absolute inset-0 rounded-[15px]"
        style={{
          backgroundColor: BRAND.blueSoft,
        }}
      />

      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-[11px] bg-white"
        style={{
          color: BRAND.blue,
          boxShadow: "0 6px 20px rgba(47,140,255,.10)",
        }}
      >
        <Upload size={18} strokeWidth={2} />
      </motion.div>

      <span
        className="absolute -right-1 -top-1 h-2 w-2 rounded-full"
        style={{
          backgroundColor: BRAND.violet,
        }}
      />
    </motion.div>
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

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
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

      const response = await fetch(
        `${apiUrl}/cards/visite`,
        {
          credentials: "include",
          method: "POST",
          body: formData,
        }
      );

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
      await navigator.clipboard.writeText(
        qrResult.cardUrl
      );

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
    <main className="min-h-screen bg-white text-[#080B10]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="mx-auto flex w-full max-w-295 items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="MonCode - accueil"
          className="text-[20px] font-black tracking-[-0.07em]"
        >
          <span>Mon</span>

          <span style={{ color: BRAND.blue }}>
            Code
          </span>

          <span
            className="ml-0.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full"
            style={{
              backgroundColor: BRAND.violet,
            }}
          />
        </Link>

        <div className="hidden sm:block">
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A0A7B1]">
            Carte de visite digitale
          </span>
        </div>

        <Link
          href="/"
          className="group flex items-center gap-2 text-[11px] font-semibold text-[#697382] transition-colors hover:text-[#080B10]"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />

          Retour
        </Link>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="mx-auto w-full max-w-275 px-5 pb-24 pt-12 sm:px-8 lg:px-10 lg:pt-20">
        <AnimatePresence mode="wait">
          {!qrResult ? (
            /* =================================================
               UPLOAD
            ================================================= */

            <motion.div
              key="upload"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
                {/* LEFT */}
                <div>
                  <SectionBadge accent="violet">
                    Mode Express Direct
                  </SectionBadge>

                  <h1 className="mt-6 max-w-130 text-[clamp(48px,6vw,74px)] font-black leading-[0.9] tracking-[-0.075em]">
                    Votre carte.
                    <br />

                    <span
                      style={{
                        color: BRAND.blue,
                      }}
                    >
                      Un seul scan.
                    </span>
                  </h1>

                  <p className="mt-7 max-w-117.5 text-[14px] leading-7 text-[#697382]">
                    Transformez simplement votre carte de visite
                    en un QR Code partageable. Votre carte
                    s&apos;ouvre directement après le scan.
                  </p>

                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-2.5 text-[11px] font-medium text-[#697382]">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: BRAND.blueSoft,
                          color: BRAND.blue,
                        }}
                      >
                        <Check
                          size={11}
                          strokeWidth={2.5}
                        />
                      </span>

                      Aucun profil à créer
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] font-medium text-[#697382]">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: BRAND.violetSoft,
                          color: BRAND.violet,
                        }}
                      >
                        <Check
                          size={11}
                          strokeWidth={2.5}
                        />
                      </span>

                      Votre carte reste exactement la même
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div>
                  <div className="rounded-[22px] border border-[#E7EBF0] bg-white">
                    {/* CARD TOP */}
                    <div className="flex items-center justify-between border-b border-[#EEF0F3] px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <QrCode
                          size={16}
                          style={{
                            color: BRAND.blue,
                          }}
                        />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#697382]">
                          Générateur
                        </span>
                      </div>

                      <span className="text-[9px] font-semibold text-[#B0B6BE]">
                        01 / 01
                      </span>
                    </div>

                    <div className="p-5 sm:p-6">
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
                            className="group flex min-h-87.5 cursor-pointer flex-col items-center justify-center rounded-[17px] border border-dashed border-[#CDD5DF] bg-[#FCFDFE] px-6 text-center transition-colors duration-200 hover:border-[#A9C8EE] hover:bg-[#FAFCFF]"
                          >
                            <UploadVisual />

                            <h2 className="mt-6 text-[18px] font-bold tracking-[-0.035em]">
                              Importez votre carte
                            </h2>

                            <p className="mt-2 max-w-[320px] text-[11px] leading-6 text-[#8A929E]">
                              Glissez votre image ici ou cliquez
                              pour sélectionner votre carte de
                              visite.
                            </p>

                            <span className="mt-6 inline-flex h-10 items-center gap-2 rounded-[9px] bg-[#080B10] px-4 text-[11px] font-semibold text-white transition-colors group-hover:bg-[#171C24]">
                              <FileImage size={14} />

                              Choisir une image
                            </span>

                            <span className="mt-3 text-[8px] font-bold uppercase tracking-[0.15em] text-[#B0B6BE]">
                              PNG · JPG · WEBP
                            </span>
                          </label>
                        </>
                      ) : (
                        /* PREVIEW */
                        <motion.div
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          className="overflow-hidden rounded-[17px] border border-[#E5E9EF]"
                        >
                          <div className="flex items-center justify-between border-b border-[#EEF0F3] px-4 py-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]"
                                style={{
                                  backgroundColor:
                                    BRAND.blueSoft,
                                  color: BRAND.blue,
                                }}
                              >
                                <FileImage size={13} />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-55 truncate text-[10px] font-semibold">
                                  {file?.name}
                                </p>

                                <p className="mt-0.5 text-[8px] text-[#9AA1AC]">
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
                              className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#8A929E] transition-colors hover:bg-[#F4F5F7] hover:text-[#080B10] disabled:opacity-40"
                              aria-label="Supprimer l'image"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="flex min-h-87.5 items-center justify-center bg-[#F8F9FB] p-5">
                            <div className="relative max-h-82.5 max-w-full overflow-hidden rounded-[11px] border border-[#E2E6EB] bg-white shadow-[0_10px_30px_rgba(8,11,16,.06)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt="Aperçu de votre carte de visite"
                                className="block max-h-80 max-w-full object-contain"
                              />

                              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-[#080B10]/80 px-2 py-1 text-[8px] font-bold text-white backdrop-blur-sm">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      BRAND.blue,
                                  }}
                                />

                                Aperçu
                              </div>
                            </div>
                          </div>

                          <label
                            htmlFor={inputId}
                            className="flex cursor-pointer items-center justify-center border-t border-[#EEF0F3] py-3 text-[9px] font-semibold text-[#697382] transition-colors hover:text-[#080B10]"
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
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 rounded-[9px] border border-[#F1CECA] bg-[#FFF8F7] px-3.5 py-3 text-[10px] leading-5 text-[#B42318]">
                              {error}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ACTION */}
                      <div className="mt-5 flex flex-col items-center">
                        <SimpleButton
                          disabled={!file || isGenerating}
                          onClick={handleGenerateQr}
                          icon={QrCode}
                        >
                          {isGenerating
                            ? "Génération..."
                            : "Générer mon QR Code"}
                        </SimpleButton>

                        <p className="mt-2.5 text-[8px] text-[#A1A8B2]">
                          Génération sécurisée · Accès instantané
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEPS */}
              <div className="mx-auto mt-16 flex max-w-162.5 items-center justify-center gap-6 border-t border-[#EEF0F3] pt-6 sm:gap-10">
                {[
                  {
                    number: "01",
                    title: "Importez",
                  },
                  {
                    number: "02",
                    title: "Générez",
                  },
                  {
                    number: "03",
                    title: "Partagez",
                  },
                ].map((item, index) => (
                  <div
                    key={item.number}
                    className="flex items-center gap-2.5"
                  >
                    <span
                      className="text-[8px] font-bold"
                      style={{
                        color:
                          index === 1
                            ? BRAND.violet
                            : BRAND.blue,
                      }}
                    >
                      {item.number}
                    </span>

                    <span className="text-[10px] font-semibold text-[#8A929E]">
                      {item.title}
                    </span>

                    {index < 2 && (
                      <ArrowRight
                        size={11}
                        className="ml-2 text-[#D4D9DF]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* =================================================
               SUCCESS
            ================================================= */

            <motion.div
              key="success"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mx-auto max-w-190">
                {/* TITLE */}
                <div className="text-center">
                  <SectionBadge>
                    QR Code prêt à l&apos;emploi
                  </SectionBadge>

                  <h1 className="mt-6 text-[clamp(44px,6vw,68px)] font-black leading-[0.92] tracking-[-0.075em]">
                    Votre identité.
                    <br />

                    <span
                      style={{
                        color: BRAND.blue,
                      }}
                    >
                      Prête à scanner.
                    </span>
                  </h1>

                  <p className="mx-auto mt-5 max-w-125 text-[13px] leading-7 text-[#697382]">
                    Votre QR Code donne maintenant accès
                    directement à votre carte de visite.
                  </p>
                </div>

                {/* RESULT */}
                <div className="mt-10">
                  <div className="flex flex-col items-center">
                    {/* QR */}
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.94,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: 0.08,
                        duration: 0.4,
                      }}
                      className="relative rounded-[20px] border border-[#E5E9EF] bg-white p-4 shadow-[0_15px_45px_rgba(8,11,16,.07)] sm:p-5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrResult.qrCode}
                        alt={`QR Code pour la carte ${qrResult.slug}`}
                        className="block h-auto w-[min(65vw,250px)]"
                      />

                      <div
                        className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white"
                        style={{
                          backgroundColor: BRAND.blue,
                        }}
                      >
                        <Check
                          size={11}
                          color="#fff"
                          strokeWidth={3}
                        />
                      </div>
                    </motion.div>

                    {/* LINK */}
                    <div className="mt-7 w-full max-w-125">
                      <p className="mb-2 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-[#A0A7B1]">
                        Votre lien MonCode
                      </p>

                      <div className="flex items-center gap-2 rounded-[10px] border border-[#E5E9EF] bg-white p-1">
                        <code className="min-w-0 flex-1 truncate px-3 text-center text-[10px] text-[#697382]">
                          {qrResult.cardUrl}
                        </code>

                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="flex h-8 shrink-0 items-center gap-1.5 rounded-[7px] bg-[#F4F5F7] px-2.5 text-[9px] font-bold text-[#080B10] transition-colors hover:bg-[#ECEEF1]"
                        >
                          {copied ? (
                            <>
                              <Check size={12} />
                              Copié
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
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
                    className="group inline-flex items-center gap-2 text-[10px] font-semibold text-[#697382] transition-colors hover:text-[#080B10]"
                  >
                    <RefreshCw
                      size={12}
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

      <footer className="border-t border-[#F0F1F3]">
        <div className="mx-auto flex max-w-295 items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
          <span className="text-[10px] font-bold tracking-[-0.03em] text-[#A0A7B1]">
            MonCode
          </span>
 
          <span className="text-[9px] text-[#B0B6BE]">
            Votre identité. Un scan.
          </span>
        </div>
      </footer>
    </main>
  );
}
