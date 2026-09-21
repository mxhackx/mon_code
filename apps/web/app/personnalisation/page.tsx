"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFile } from "../context/FileContext";
import RestaurantCardLayout from "../components/RestaurantCardLayout";

const THEMES = [
  { id: "theme-1", name: "premier", subtitle: "Dark Luxury", desc: "Noir profond et touches or champagne.", bgPreview: "#0d0b09", accentColor: "#d4af37", textColor: "#fdf8e2", badge: "Gastronomique" },
  { id: "theme-2", name: "deuxième", subtitle: "Terracotta & Bois", desc: "Ambiance bistrot convivial.", bgPreview: "#fcf8f2", accentColor: "#c85a32", textColor: "#321d14", badge: "Convivial" },
  { id: "theme-3", name: "troisième", subtitle: "Minimaliste & Clair", desc: "Épuré, blanc et sable.", bgPreview: "#ffffff", accentColor: "#827a72", textColor: "#2d2a28", badge: "Moderne" },
  { id: "theme-4", name: "quatrième", subtitle: "Botanique & Gourmet", desc: "Vert émeraude profond.", bgPreview: "#f2f7f4", accentColor: "#2c5f43", textColor: "#193626", badge: "Nature" },
  { id: "theme-5", name: "cinquième", subtitle: "Street Food", desc: "Foncé avec des touches oranges fluo.", bgPreview: "#13100e", accentColor: "#ef6a22", textColor: "#fff5ec", badge: "Vibrant" },
  { id: "retro", name: "Retro", subtitle: "Vintage", desc: "Un look chaleureux, old-school.", bgPreview: "#e4d8b4", accentColor: "#ef9995", textColor: "#282425", badge: "Classique" },
  { id: "cyberpunk", name: "Cyberpunk", subtitle: "Futuriste", desc: "Jaune éclatant, contrastes forts.", bgPreview: "#ffe600", accentColor: "#ff7598", textColor: "#000000", badge: "Audacieux" },
  { id: "cupcake", name: "Cupcake", subtitle: "Douceur", desc: "Tons pastel, rose et bleu clair.", bgPreview: "#faf7f5", accentColor: "#65c3c8", textColor: "#291334", badge: "Doux" },
  { id: "dracula", name: "Dracula", subtitle: "Sombre", desc: "Mode sombre avec violets et roses.", bgPreview: "#282a36", accentColor: "#ff79c6", textColor: "#f8f8f2", badge: "Moderne" },
  { id: "luxury", name: "Luxury", subtitle: "Premium", desc: "Noir et or absolu pour un rendu haut de gamme.", bgPreview: "#09090b", accentColor: "#cca53f", textColor: "#dca54c", badge: "Élégant" },
  { id: "valentine", name: "Valentine", subtitle: "Romantique", desc: "Nuances de rose et rouge.", bgPreview: "#f0d6e8", accentColor: "#e96d7b", textColor: "#632c3b", badge: "Passion" },
  { id: "aqua", name: "Aqua", subtitle: "Océan", desc: "Des bleus profonds et vifs.", bgPreview: "#345da7", accentColor: "#09ecf3", textColor: "#c8e1e7", badge: "Frais" },
  { id: "emerald", name: "Emerald", subtitle: "Nature", desc: "Blanc pur et vert émeraude percutant.", bgPreview: "#ffffff", accentColor: "#66cc8a", textColor: "#333c4d", badge: "Épuré" },
  { id: "synthwave", name: "Synthwave", subtitle: "Années 80", desc: "Lueurs néons sur fond nuit noire.", bgPreview: "#2d1b69", accentColor: "#e779c1", textColor: "#f9f8fd", badge: "Néon" },
  { id: "coffee", name: "Coffee", subtitle: "Café", desc: "Nuances de marron profond.", bgPreview: "#20161f", accentColor: "#db924b", textColor: "#c59f60", badge: "Chaud" },
];

export default function PersonnalisationPage() {
  const router = useRouter();
  const { restaurantInfo, customization, setThemeId, authToken, isAuthLoading } = useFile();

  useEffect(() => {
    if (!isAuthLoading && !authToken) router.push("/connexion");
  }, [authToken, isAuthLoading, router]);

  if (isAuthLoading) return null;

  // Préparation des données factices ou réelles pour le preview
  const previewLogo = restaurantInfo.logoFile ? URL.createObjectURL(restaurantInfo.logoFile) : undefined;
  const previewMenus = restaurantInfo.menuFiles.length > 0 
    ? restaurantInfo.menuFiles.map(f => URL.createObjectURL(f))
    : [];

  const isCustomTheme = customization.themeId.startsWith("theme-");
  const themeClass = isCustomTheme ? `restaurant-${customization.themeId}` : "daisy-theme-wrapper";
  const dataTheme = !isCustomTheme ? customization.themeId : undefined;

  return (
    <main className="landing-page scene-ready" style={{ padding: "0" }}>
      <div className="splash"></div>
      
      <header className="site-header" style={{ padding: "20px 40px", maxWidth: "1400px", width: "100%" }}>
        <Link href="/" className="logo">Visicard <span>PRO</span></Link>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => router.push("/restaurant")} style={{ background: "none", border: "1px solid #ccc", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Retour</button>
          <button onClick={() => router.push("/qr-studio")} style={{ background: "var(--orange)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Suivant : Studio QR →</button>
        </div>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", width: "100%", maxWidth: "1400px", margin: "0 auto", flex: 1, zIndex: 10, position: "relative" }}>
        
        {/* Colonne Gauche : Sélection des thèmes */}
        <div style={{ flex: "1 1 600px", padding: "20px 40px", overflowY: "auto", maxHeight: "calc(100vh - 80px)" }}>
          <h1 className="brand" style={{ fontSize: "32px", marginBottom: "8px" }}>Choisissez l'interface</h1>
          <p style={{ color: "#666", marginBottom: "32px" }}>Sélectionnez l'apparence de la page digitale de votre restaurant.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {THEMES.map((theme) => {
              const isSelected = customization.themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => setThemeId(theme.id)}
                  style={{
                    background: theme.bgPreview,
                    color: theme.textColor,
                    border: isSelected ? "3px solid var(--orange)" : "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "16px",
                    padding: "16px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: isSelected ? "0 8px 24px rgba(239, 106, 34, 0.22)" : "0 2px 8px rgba(0,0,0,0.05)",
                    transform: isSelected ? "scale(1.02)" : "none",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  {isSelected && (
                    <span style={{ position: "absolute", top: "10px", right: "10px", background: "var(--orange)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>✓</span>
                  )}
                  <strong style={{ fontSize: "15px" }}>{theme.name}</strong>
                  <span style={{ fontSize: "12px", opacity: 0.8, fontWeight: 600 }}>{theme.badge}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne Droite : Preview Mobile */}
        <div style={{ flex: "1 1 400px", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", borderLeft: "1px solid #eaeaea" }}>
          <div style={{ 
            width: "375px", height: "812px", background: "#000", borderRadius: "40px", 
            padding: "12px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative"
          }}>
            {/* Ecran du téléphone */}
            <div className={`${themeClass}`} data-theme={dataTheme} style={{ width: "100%", height: "100%", background: "var(--theme-bg)", borderRadius: "28px", overflow: "hidden", position: "relative" }}>
              <RestaurantCardLayout 
                restaurantName={restaurantInfo.restaurantName || "Mon Restaurant"}
                logoUrl={previewLogo}
                locationUrl={restaurantInfo.locationUrl}
                phoneNumber={restaurantInfo.phoneNumber}
                menuImages={previewMenus}
                inPreview={true}
              />
            </div>
            {/* Encoche iPhone */}
            <div style={{ position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)", width: "120px", height: "30px", background: "#000", borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}></div>
          </div>
        </div>

      </div>
    </main>
  );
}
