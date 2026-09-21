"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Download,
  QrCode,
  ScanLine,
  Share2,
  UserRound,
  Sparkles,
  Check,
} from "lucide-react";

const BRAND = {
  blue: "#2F8CFF",
  blueDark: "#1670E8",
  blueSoft: "#EAF4FF",

  violet: "#7357FF",
  violetDark: "#5A3FE6",
  violetSoft: "#F0EDFF",

  ink: "#080B10",
  dark: "#10151D",
  muted: "#687181",

  surface: "#F7F9FC",
  line: "#E8ECF2",
};

const features = [
  {
    icon: QrCode,
    title: "Un seul QR Code",
    description:
      "Votre identité professionnelle tient dans un seul code, simple à partager et immédiatement reconnaissable.",
  },
  {
    icon: UserRound,
    title: "Tout au même endroit",
    description:
      "Présentez votre activité, vos coordonnées, vos réseaux et vos liens depuis un profil unique.",
  },
  {
    icon: Share2,
    title: "Partage instantané",
    description:
      "À une rencontre, sur une affiche ou en ligne, votre profil reste accessible en quelques secondes.",
  },
  {
    icon: Download,
    title: "Toujours avec vous",
    description:
      "Téléchargez votre QR Code et utilisez-le sur vos cartes, documents et supports numériques.",
  },
];

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Créez votre profil",
    description:
      "Ajoutez votre nom, votre activité, vos coordonnées et les informations que vous souhaitez partager.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Obtenez votre MonCode",
    description:
      "Votre profil est associé à un QR Code unique, utilisable aussi bien en ligne que sur papier.",
  },
  {
    number: "03",
    icon: ScanLine,
    title: "Soyez découvert",
    description:
      "Votre contact scanne votre code et accède directement à votre identité professionnelle.",
  },
];

function SectionBadge({
  title,
  accent = "blue",
}: {
  title: string;
  accent?: "blue" | "violet";
}) {
  const isViolet = accent === "violet";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
      style={{
        borderColor: isViolet
          ? "rgba(115,87,255,.18)"
          : "rgba(47,140,255,.18)",
        backgroundColor: isViolet
          ? BRAND.violetSoft
          : BRAND.blueSoft,
        color: isViolet
          ? BRAND.violetDark
          : BRAND.blueDark,
      }}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
          style={{
            backgroundColor: isViolet
              ? BRAND.violet
              : BRAND.blue,
          }}
        />

        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: isViolet
              ? BRAND.violet
              : BRAND.blue,
          }}
        />
      </span>

      {title}
    </motion.div>
  );
}

function DecorativeGrid() {
  return (
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
  );
}

function PremiumButton({
  href,
  children,
  variant = "blue",
  icon: Icon = ArrowRight,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "blue" | "dark" | "light" | "violet";
  icon?: React.ElementType;
}) {
  const variants = {
    blue: {
      background: BRAND.blue,
      hoverBackground: BRAND.blueDark,
      color: "#FFFFFF",
      border: "transparent",
    },

    violet: {
      background: BRAND.violet,
      hoverBackground: BRAND.violetDark,
      color: "#FFFFFF",
      border: "transparent",
    },

    dark: {
      background: BRAND.ink,
      hoverBackground: "#171C24",
      color: "#FFFFFF",
      border: "rgba(255,255,255,.10)",
    },

    light: {
      background: "#FFFFFF",
      hoverBackground: "#F4F6F8",
      color: BRAND.ink,
      border: "#E4E8EE",
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className="group inline-flex h-12.5 items-center gap-3 rounded-[14px] border px-5 text-[13px] font-bold tracking-[-0.01em] transition-colors duration-200"
          style={{
            backgroundColor: style.background,
            color: style.color,
            borderColor: style.border,
            boxShadow:
              variant === "blue"
                ? "0 8px 24px rgba(47,140,255,.16)"
                : variant === "violet"
                  ? "0 8px 24px rgba(115,87,255,.16)"
                  : variant === "dark"
                    ? "0 8px 24px rgba(8,11,16,.12)"
                    : "0 6px 20px rgba(8,11,16,.05)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              style.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              style.background;
          }}
        >
          <span>{children}</span>

          <motion.span
            className="flex items-center justify-center"
            whileHover={{ x: 3 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            <Icon size={15} strokeWidth={2.2} />
          </motion.span>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function AnimatedQRCode() {
  const size = 25;

  return (
    <div className="relative">

      {/* BLUE AURA */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.22, 0.42, 0.22],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-16.5 rounded-full bg-blue-500/30 blur-[80px]"
      />

      {/* VIOLET AURA */}
      <motion.div
        animate={{
          scale: [1.05, 0.95, 1.05],
          opacity: [0.08, 0.2, 0.08],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]"
      />

      {/* FLOATING SCAN CARD */}
      <motion.div
        animate={{
          y: [0, -7, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-8 top-7 z-30 hidden rounded-[14px] border border-white/80 bg-white/90 px-4 py-3 shadow-[0_20px_60px_rgba(8,11,16,.12)] backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[10px]"
            style={{
              backgroundColor: BRAND.blueSoft,
              color: BRAND.blueDark,
            }}
          >
            <ScanLine size={17} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Scan
            </p>

            <p className="text-sm font-bold text-[#080B10]">
              Instantané
            </p>
          </div>
        </div>
      </motion.div>

      {/* QR FRAME */}
      <motion.div
        whileHover={{
          scale: 1.015,
          rotate: -0.5,
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 18,
        }}
        className="relative rounded-[30px] border border-white/80 bg-white/75 p-3 shadow-[0_45px_120px_rgba(8,11,16,.16)] backdrop-blur-2xl sm:p-4"
      >
        <div className="rounded-3xl bg-[#F4F7FB] p-4 sm:p-5">
          <div className="relative overflow-hidden rounded-[20px] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(8,11,16,.035)]">

            <div className="grid aspect-square w-67.5 grid-cols-[repeat(25,1fr)] sm:w-87.5">
              {Array.from({ length: 625 }).map((_, index) => {
                const row = Math.floor(index / size);
                const col = index % size;

                const finder = (
                  startRow: number,
                  startCol: number
                ) => {
                  const r = row - startRow;
                  const c = col - startCol;

                  if (
                    r < 0 ||
                    r > 6 ||
                    c < 0 ||
                    c > 6
                  ) {
                    return false;
                  }

                  return (
                    r === 0 ||
                    r === 6 ||
                    c === 0 ||
                    c === 6 ||
                    (r >= 2 &&
                      r <= 4 &&
                      c >= 2 &&
                      c <= 4)
                  );
                };

                const isFinder =
                  finder(0, 0) ||
                  finder(0, 18) ||
                  finder(18, 0);

                const inFinderZone =
                  (row <= 7 && col <= 7) ||
                  (row <= 7 && col >= 17) ||
                  (row >= 17 && col <= 7);

                let active =
                  ((row * 41 +
                    col * 23 +
                    row * col * 7) %
                    11) < 4;

                if (isFinder) {
                  active = true;
                }

                if (
                  inFinderZone &&
                  !isFinder
                ) {
                  active = false;
                }

                const snakeIndex =
                  row % 2 === 0
                    ? row * size + col
                    : row * size +
                      (size - 1 - col);

                return (
                  <motion.div
                    key={index}
                    className="h-full w-full"
                    initial={{
                      backgroundColor: active
                        ? BRAND.ink
                        : "#FFFFFF",
                    }}
                    animate={{
                      backgroundColor: active
                        ? [
                            BRAND.ink,
                            BRAND.ink,
                            BRAND.blue,
                            BRAND.violet,
                            BRAND.ink,
                          ]
                        : "#FFFFFF",
                    }}
                    transition={{
                      duration: 1,
                      delay: snakeIndex * 0.018,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>

            {/* SCANNER LINE */}
            <motion.div
              animate={{
                top: ["5%", "92%", "5%"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-4 right-4 h-0.5"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #7357FF, #2F8CFF, transparent)",
                boxShadow:
                  "0 0 20px rgba(115,87,255,.75)",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* FLOATING IDENTITY CARD */}
      <motion.div
        animate={{
          y: [0, 6, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-5 -left-6 z-30 rounded-[14px] border border-white/80 bg-white/95 px-4 py-3 shadow-[0_20px_60px_rgba(8,11,16,.12)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[10px]"
            style={{
              backgroundColor: BRAND.violetSoft,
              color: BRAND.violet,
            }}
          >
            <Sparkles size={17} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Identité digitale
            </p>

            <p className="text-sm font-bold text-[#080B10]">
              Un seul scan.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white font-sans text-[#080B10] selection:bg-blue-100 selection:text-blue-700">

      {/* HEADER */}

      <motion.header
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="absolute inset-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl" />

        <div className="relative mx-auto flex h-18.5 max-w-360 items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* LOGO */}

          <Link
            href="/"
            aria-label="MonCode - accueil"
            className="group flex items-center text-[24px] font-black tracking-[-0.06em]"
          >
            <span className="text-[#080B10]">
              Mon
            </span>

            <span
              className="transition-colors duration-300 group-hover:text-[#5A3FE6]"
              style={{
                color: BRAND.violet,
              }}
            >
              Code
            </span>

            <motion.span
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="ml-2 h-1.5 w-1.5 rounded-full bg-[#2F8CFF]"
            />
          </Link>

          {/* NAV */}

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="#solutions"
              className="rounded-[9px] px-4 py-2 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#080B10]"
            >
              Pourquoi MonCode
            </Link>

            <Link
              href="#fonctionnement"
              className="rounded-[9px] px-4 py-2 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#080B10]"
            >
              Fonctionnement
            </Link>
          </nav>

          {/* ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/connexion"
              className="hidden rounded-[9px] px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:text-[#080B10] sm:block"
            >
              Se connecter
            </Link>

            <PremiumButton
              href="/intervenant"
              variant="blue"
              icon={ArrowRight}
            >
              Commencer
            </PremiumButton>
          </div>
        </div>
      </motion.header>

      {/* HERO */}

      <section className="relative min-h-195 overflow-hidden pt-32 sm:pt-40 lg:min-h-225 lg:pt-44">

        <DecorativeGrid />

        <div className="pointer-events-none absolute inset-0 -z-10">

          {/* BLUE */}

          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[-12%] top-[2%] h-162.5 w-162.5 rounded-full bg-blue-100/70 blur-[150px]"
          />

          {/* VIOLET */}

          <motion.div
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[-20%] left-[-12%] h-150 w-150 rounded-full bg-violet-100/70 blur-[150px]"
          />

          {/* SMALL BLUE/VIOLET MIX */}

          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[45%] top-[25%] h-75 w-75 rounded-full bg-violet-50/80 blur-[120px]"
          />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 sm:px-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">

          {/* HERO COPY */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.75,
              delay: 0.15,
            }}
            className="relative z-10 max-w-2xl"
          >
            <SectionBadge
              title="Carte de visite digitale"
              accent="violet"
            />

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.3,
              }}
              className="mt-7 text-[50px] font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-[78px]"
            >
              Votre identité.

              <br />

              <span
                className="relative inline-block"
                style={{
                  color: BRAND.blue,
                }}
              >
                Un scan.

                <motion.span
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: "100%",
                  }}
                  transition={{
                    delay: 1,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="absolute -bottom-2 left-0 h-0.75 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #2F8CFF, #7357FF)",
                  }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.55,
              }}
              className="mt-8 max-w-xl text-[17px] leading-8 text-[#687181] sm:text-[19px]"
            >
              Une identité professionnelle moderne,
              accessible instantanément depuis un simple
              QR Code.
            </motion.p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <PremiumButton
                href="/intervenant"
                variant="blue"
                icon={ArrowRight}
              >
                Créer mon MonCode
              </PremiumButton>

              <PremiumButton
                href="#fonctionnement"
                variant="light"
                icon={ChevronRight}
              >
                Découvrir
              </PremiumButton>

            </div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.9,
                duration: 0.6,
              }}
              className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Check
                  size={16}
                  className="text-blue-500"
                />
                QR Code unique
              </div>

              <div className="flex items-center gap-2">
                <Check
                  size={16}
                  className="text-violet-500"
                />
                Partage instantané
              </div>

              <div className="flex items-center gap-2">
                <Check
                  size={16}
                  className="text-blue-500"
                />
                Accessible partout
              </div>
            </motion.div>
          </motion.div>

          {/* QR */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.88,
              x: 30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex justify-center lg:justify-end"
          >
            <AnimatedQRCode />
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#F7F9FC] to-transparent" />
      </section>

      {/* FEATURES */}

      <section
        id="solutions"
        className="relative bg-[#F7F9FC] px-6 py-24 sm:px-10 lg:px-14 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">

            <div className="lg:col-span-5">
              <SectionBadge
                title="Pourquoi MonCode"
                accent="blue"
              />

              <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-tighter sm:text-5xl">
                Votre carte de visite.

                <br />

                <span className="text-slate-400">
                  Sans les limites.
                </span>
              </h2>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-lg leading-8 text-[#687181]">
                Oubliez les cartes qui finissent au fond
                d&apos;un portefeuille. MonCode transforme
                votre identité professionnelle en une
                expérience numérique accessible en quelques
                secondes.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature, index) => {
              const Icon = feature.icon;

              const violet =
                index === 1 || index === 3;

              return (
                <motion.div
                  key={feature.title}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.08,
                  }}
                  whileHover={{
                    y: -8,
                  }}
                  className="group relative overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-7 shadow-[0_8px_35px_rgba(8,11,16,.035)] transition-all duration-500 hover:border-blue-100 hover:shadow-[0_30px_80px_rgba(8,11,16,.10)]"
                >
                  <motion.div
                    initial={{
                      x: "-120%",
                      opacity: 0,
                    }}
                    whileHover={{
                      x: "120%",
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-li-to-r from-transparent via-white/80 to-transparent"
                  />

                  <div
                    className="absolute right-12.5 top-12.5 h-36 w-36 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      backgroundColor: violet
                        ? "#E5DFFF"
                        : "#DDEEFF",
                    }}
                  />

                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      rotate: -3,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                    }}
                    className="relative mb-7 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: violet
                        ? BRAND.violetSoft
                        : BRAND.blueSoft,
                      color: violet
                        ? BRAND.violet
                        : BRAND.blue,
                    }}
                  >
                    <Icon size={22} />
                  </motion.div>

                  <h3 className="relative text-lg font-bold tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="relative mt-3 text-sm leading-6 text-[#687181]">
                    {feature.description}
                  </p>

                  <motion.div
                    initial={{
                      width: 28,
                    }}
                    whileHover={{
                      width: 56,
                    }}
                    className="relative mt-7 h-1 rounded-full"
                    style={{
                      backgroundColor: violet
                        ? BRAND.violet
                        : BRAND.blue,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section
        id="fonctionnement"
        className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-14 lg:py-32"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-50/50 blur-[140px]"
        />

        <div className="relative mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <SectionBadge
              title="Fonctionnement"
              accent="violet"
            />

            <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              Trois étapes.

              <br />

              <span className="text-slate-400">
                Une nouvelle façon de vous présenter.
              </span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#687181]">
              Pensé pour être compris immédiatement,
              même par quelqu&apos;un qui découvre MonCode
              pour la première fois.
            </p>
          </div>

          <div className="relative mt-20 grid gap-5 lg:grid-cols-3">

            <div className="pointer-events-none absolute left-[17%] right-[17%] top-14.5 hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent lg:block" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              const violet = index === 1;

              return (
                <motion.div
                  key={step.number}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    y: -6,
                  }}
                  className="group relative rounded-[18px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_12px_45px_rgba(8,11,16,.045)] backdrop-blur-sm transition-all duration-500 hover:border-blue-100 hover:shadow-[0_25px_70px_rgba(8,11,16,.09)]"
                >
                  <div className="relative flex items-center justify-between">

                    <motion.div
                      whileHover={{
                        scale: 1.08,
                        rotate: -4,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 18,
                      }}
                      className="flex h-14 w-14 items-center justify-center rounded-[13px] shadow-sm"
                      style={{
                        backgroundColor: violet
                          ? BRAND.violetSoft
                          : BRAND.blueSoft,
                        color: violet
                          ? BRAND.violet
                          : BRAND.blue,
                      }}
                    >
                      <Icon size={23} />
                    </motion.div>

                    <span className="text-sm font-black tracking-[0.2em] text-slate-300">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-9 text-xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[15px] leading-7 text-[#687181]">
                    {step.description}
                  </p>

                  <motion.div
                    initial={{
                      width: 28,
                    }}
                    whileHover={{
                      width: 65,
                    }}
                    className="mt-7 h-1 rounded-full"
                    style={{
                      backgroundColor: violet
                        ? BRAND.violet
                        : BRAND.blue,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="px-5 py-10 sm:px-10 lg:px-14 lg:py-20">

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#080B10] px-7 py-20 text-center sm:px-16 lg:py-28"
        >

          {/* BLUE GLOW */}

          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/30 blur-[100px]"
          />

          {/* VIOLET GLOW */}

          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-violet-500/25 blur-[120px]"
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-3xl">

            <SectionBadge
              title="Votre identité professionnelle"
              accent="violet"
            />

            <h2 className="mt-7 text-4xl font-black leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              Votre prochaine rencontre

              <span
                className="block"
                style={{
                  color: BRAND.blue,
                }}
              >
                commence par un scan.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Créez votre MonCode et donnez à vos
              contacts une manière simple, moderne et
              instantanée de vous retrouver.
            </p>

            <div className="mt-10 flex justify-center">
              <PremiumButton
                href="/intervenant"
                variant="blue"
                icon={ArrowRight}
              >
                Créer mon MonCode
              </PremiumButton>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-slate-100 bg-white px-6 py-10 sm:px-10 lg:px-14">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">

          <Link
            href="/"
            className="group text-xl font-black tracking-[-0.055em]"
          >
            <span className="text-[#080B10]">
              Mon
            </span>

            <span
              style={{
                color: BRAND.violet,
              }}
            >
              Code
            </span>

            <motion.span
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#2F8CFF]"
            />
          </Link>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <span>
              © {new Date().getFullYear()} MonCode
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span>
              Tous droits réservés.
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
