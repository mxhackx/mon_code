"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";
import RestaurantCardLayout from "../../components/RestaurantCardLayout";
import { ArrowLeft, ArrowRight, Palette, Smartphone, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEMES = [
  { id: "theme-1", name: "Gastronomique", subtitle: "Dark Luxury", desc: "Noir profond et touches or champagne.", bgPreview: "#0d0b09", accentColor: "#d4af37", textColor: "#fdf8e2" },
  { id: "theme-2", name: "Bistrot", subtitle: "Terracotta & Bois", desc: "Ambiance chaleureuse et conviviale.", bgPreview: "#fcf8f2", accentColor: "#c85a32", textColor: "#321d14" },
  { id: "theme-3", name: "Moderne", subtitle: "Minimaliste", desc: "Design épuré, blanc et teintes sable.", bgPreview: "#ffffff", accentColor: "#827a72", textColor: "#2d2a28" },
  { id: "theme-4", name: "Végétal", subtitle: "Botanique", desc: "Vert émeraude profond et tons nature.", bgPreview: "#f2f7f4", accentColor: "#2c5f43", textColor: "#193626" },
  { id: "theme-5", name: "Vibrant", subtitle: "Street Food", desc: "Foncé avec des touches oranges fluo.", bgPreview: "#13100e", accentColor: "#ef6a22", textColor: "#fff5ec" },
  { id: "theme-6", name: "Cyber", subtitle: "Néon & Futur", desc: "Noir total avec des accents cyan brillants.", bgPreview: "#000000", accentColor: "#00ffcc", textColor: "#ffffff" },
  { id: "theme-7", name: "Océan", subtitle: "Fraîcheur Marine", desc: "Bleus apaisants et fond azur clair.", bgPreview: "#f0f8ff", accentColor: "#0066cc", textColor: "#003366" },
  { id: "theme-8", name: "Élégance", subtitle: "Rose Poudré", desc: "Tons doux, rose pâle et accents cuivrés.", bgPreview: "#fff5f5", accentColor: "#d4a373", textColor: "#4a3030" },
  { id: "theme-9", name: "Torréfié", subtitle: "Chaud & Corsé", desc: "Nuances de café intense et jaune ambré.", bgPreview: "#3e2723", accentColor: "#ffb300", textColor: "#efebe9" },
  { id: "theme-10", name: "Crépuscule", subtitle: "Mystique", desc: "Fond violet sombre et accents lilas.", bgPreview: "#282a36", accentColor: "#bd93f9", textColor: "#f8f8f2" },
];

export default function PersonnalisationPage() {
  const router = useRouter();
  const { restaurantInfo, customization, setThemeId, authToken, isAuthLoading } = useFile();

  useEffect(() => {
    if (!isAuthLoading && !authToken) router.push("/connexion");
  }, [authToken, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
          <span>Chargement...</span>
        </div>
      </main>
    );
  }

  const previewLogo = restaurantInfo.logoFile ? URL.createObjectURL(restaurantInfo.logoFile) : undefined;
  const previewPlaces = restaurantInfo.placeFiles.length > 0 ? restaurantInfo.placeFiles.map(f => URL.createObjectURL(f)) : [];
  const previewMenus = restaurantInfo.menuFiles.length > 0 
    ? restaurantInfo.menuFiles.map(f => URL.createObjectURL(f))
    : [];

  const themeClass = `restaurant-${customization.themeId}`;

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="w-full h-16 border-b bg-white flex items-center justify-between px-6 lg:px-12 sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="grid grid-cols-2 gap-0.5 w-5 h-5 text-blue-600">
            <img src="/logo.svg" alt="MonCode Logo" className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">MonCode</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/restaurant")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button size="sm" onClick={() => router.push("/qr-studio")} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-none">
            Suivant : Studio QR
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto overflow-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col p-6 lg:p-12 overflow-y-auto max-h-screen">
          <div className="mb-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-6 h-px bg-blue-600" />
              Étape 3 sur 3
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center gap-3">
              <Palette className="h-8 w-8 text-blue-600" />
              Personnalisation
            </h1>
            <p className="text-slate-500 text-base leading-relaxed">
              Choisissez le thème visuel qui correspond le mieux à l'identité de votre établissement. Le rendu final s'affiche en temps réel sur l'écran à droite.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {THEMES.map((theme) => {
              const isSelected = customization.themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => setThemeId(theme.id)}
                  className={`relative group cursor-pointer rounded-xl p-5 border-2 transition-all duration-200 overflow-hidden ${
                    isSelected 
                      ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100" 
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  {/* Theme Preview Color Chips */}
                  <div className="flex gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.bgPreview }}></div>
                    <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.accentColor }}></div>
                    <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.textColor }}></div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                    {theme.name}
                    {isSelected && <Sparkles className="h-4 w-4 text-blue-600" />}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-2">{theme.subtitle}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{theme.desc}</p>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Mobile Preview */}
        <div className="w-full lg:w-[45%] xl:w-[40%] bg-slate-100/50 border-l border-slate-200 flex flex-col items-center justify-center p-8 lg:p-12 min-h-[700px] lg:min-h-0 relative">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm mb-8 z-10">
            <Smartphone className="h-4 w-4 text-blue-600" />
            Aperçu en direct
          </div>

          {/* iPhone Mockup */}
          <div className="relative mx-auto w-[320px] h-[650px] sm:w-[360px] sm:h-[720px] bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl border-[8px] border-[#1a1a1a] ring-1 ring-slate-900/10 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
            
            {/* iPhone Notch */}
            <div className="absolute top-0 inset-x-0 w-32 h-6 bg-[#1a1a1a] rounded-b-3xl mx-auto z-30 flex items-center justify-center gap-2">
              {/* Speaker / Camera details inside notch */}
              <div className="w-10 h-1.5 bg-[#0a0a0a] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#080808] rounded-full ring-1 ring-white/10"></div>
            </div>

            {/* Screen Content */}
            <div className={`w-full h-full rounded-[2rem] overflow-y-auto overflow-x-hidden relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${themeClass}`} style={{ backgroundColor: "var(--theme-bg)" }}>
              <RestaurantCardLayout 
                restaurantName={restaurantInfo.restaurantName || "Mon Restaurant"}
                address={restaurantInfo.address}
                logoUrl={previewLogo}
                locationUrl={restaurantInfo.locationUrl}
                phoneNumber={restaurantInfo.phoneNumber}
                facebookUrl={restaurantInfo.facebookUrl}
                instagramUrl={restaurantInfo.instagramUrl}
                xUrl={restaurantInfo.xUrl}
                snapchatUrl={restaurantInfo.snapchatUrl}
                additionalInfo={restaurantInfo.additionalInfo}
                schedule={restaurantInfo.schedule}
                menuImages={previewMenus}
                placeImages={previewPlaces}
                inPreview={true}
              />
            </div>
            
            {/* Screen Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none rounded-[2rem]"></div>
          </div>
        </div>

      </div>
    </main>
  );
}
