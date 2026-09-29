"use client";

import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";

export interface QRStyleConfig {
  dotsType: "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded";
  cornersType: "dot" | "square" | "extra-rounded";
  color: string;
  useLogo: boolean;
}

interface QRCodeStudioProps {
  dataUrl: string;
  logoUrl?: string;
  initialConfig?: QRStyleConfig;
  onChange?: (configJson: string) => void;
}

const DEFAULT_CONFIG: QRStyleConfig = {
  dotsType: "rounded",
  cornersType: "extra-rounded",
  color: "#d97706",
  useLogo: false,
};

export default function QRCodeStudio({ dataUrl, logoUrl, initialConfig, onChange }: QRCodeStudioProps) {
  const [config, setConfig] = useState<QRStyleConfig>(initialConfig || DEFAULT_CONFIG);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Initialisation dynamique statique (sans dépendances)
  useEffect(() => {
    let isMounted = true;
    import("qr-code-styling").then((module) => {
      if (!isMounted) return;
      const QRCodeStylingClass = module.default;
      // On instancie avec les paramètres fixes.
      // Les paramètres variables (data, color, etc.) seront injectés par le 3ème useEffect.
      const qr = new QRCodeStylingClass({
        width: 250,
        height: 250,
        imageOptions: { crossOrigin: "anonymous", margin: 10 },
      });
      setQrCode(qr);
    });
    return () => { isMounted = false; };
  }, []);

  // Attacher le canvas au DOM
  useEffect(() => {
    if (qrCode && ref.current) {
      if (ref.current.innerHTML !== "") {
        ref.current.innerHTML = "";
      }
      qrCode.append(ref.current);
    }
  }, [qrCode, ref]);

  // Mettre à jour le design quand la configuration change (réactif)
  useEffect(() => {
    if (!qrCode) return;
    qrCode.update({
      data: dataUrl,
      image: config.useLogo && logoUrl ? logoUrl : "",
      dotsOptions: { color: config.color, type: config.dotsType },
      cornersSquareOptions: { color: config.color, type: config.cornersType },
    });
    
    if (onChange) {
      onChange(JSON.stringify(config));
    }
  }, [qrCode, config, dataUrl, logoUrl, onChange]);

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", background: "rgba(0,0,0,0.02)", padding: "24px", borderRadius: "16px", border: "1px dashed rgba(0,0,0,0.1)" }}>
       {/* Gauche : Prévisualisation */}
       <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
         <h4 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "16px" }}>Aperçu du QR Code</h4>
         <div ref={ref} style={{ display: "flex", justifyContent: "center", background: "#fff", padding: "10px", borderRadius: "12px" }} />
       </div>

       {/* Droite : Contrôles */}
       <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "16px" }}>
         <h4 style={{ margin: "0", color: "#333", fontSize: "16px" }}>Personnalisation</h4>
         
         <div>
           <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", color: "#625852" }}>Motif des points</label>
           <select 
             value={config.dotsType} 
             onChange={(e) => setConfig({...config, dotsType: e.target.value as QRStyleConfig["dotsType"]})} 
             style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", outline: "none" }}
           >
             <option value="square">Carrés classiques</option>
             <option value="rounded">Arrondis</option>
             <option value="dots">Points</option>
             <option value="classy">Élégant</option>
             <option value="classy-rounded">Élégant & Arrondi</option>
             <option value="extra-rounded">Extra Arrondi</option>
           </select>
         </div>

         <div>
           <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", color: "#625852" }}>Forme des coins (Repères)</label>
           <select 
             value={config.cornersType} 
             onChange={(e) => setConfig({...config, cornersType: e.target.value as QRStyleConfig["cornersType"]})} 
             style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", outline: "none" }}
           >
             <option value="square">Carrés (Standard)</option>
             <option value="extra-rounded">Arrondis</option>
             <option value="dot">Ronds</option>
           </select>
         </div>

         <div>
           <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", color: "#625852" }}>Couleur principale</label>
           <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
             <input 
               type="color" 
               value={config.color} 
               onChange={(e) => setConfig({...config, color: e.target.value})} 
               style={{ width: "45px", height: "45px", padding: "0", border: "none", borderRadius: "8px", cursor: "pointer", overflow: "hidden" }} 
             />
             <span style={{ fontSize: "14px", color: "#333", fontFamily: "monospace", fontWeight: "bold" }}>{config.color.toUpperCase()}</span>
           </div>
         </div>

         {logoUrl && (
           <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #eee" }}>
             <input 
               type="checkbox" 
               id="useLogo" 
               checked={config.useLogo} 
               onChange={(e) => setConfig({...config, useLogo: e.target.checked})} 
               style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--orange)" }} 
             />
             <label htmlFor="useLogo" style={{ fontSize: "14px", fontWeight: "bold", cursor: "pointer", color: "#333" }}>
               Incruster le logo au centre
             </label>
           </div>
         )}
         
         {!logoUrl && (
           <div style={{ fontSize: "12px", color: "#8a7a70", fontStyle: "italic", marginTop: "8px" }}>
             Ajoutez un logo à la carte pour pouvoir l&apos;incruster dans le QR Code.
           </div>
         )}
       </div>
    </div>
  );
}
