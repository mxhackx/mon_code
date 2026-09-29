"use client";

import { MapPin, MessageCircle, Clock, Image as ImageIcon, Info } from "lucide-react";



interface ScheduleDay {
  isOpen: boolean;
  open: string;
  close: string;
}

interface RestaurantCardLayoutProps {
  restaurantName: string;
  logoUrl?: string;
  address?: string;
  locationUrl?: string;
  phoneNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  snapchatUrl?: string;
  additionalInfo?: string;
  schedule?: Record<string, ScheduleDay>;
  menuImages: string[];
  placeImages?: string[];
  inPreview?: boolean;
}

export default function RestaurantCardLayout({
  restaurantName,
  logoUrl,
  address,
  locationUrl,
  phoneNumber,
  menuImages,
  placeImages = [],
  facebookUrl,
  instagramUrl,
  xUrl,
  snapchatUrl,
  additionalInfo,
  schedule,
  inPreview = false,
}: RestaurantCardLayoutProps) {
  const cleanPhone = phoneNumber ? phoneNumber.replace(/[^0-9+]/g, "") : "";
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace("+", "")}` : "#";

  return (
    <div 
      className="w-full h-full min-h-full flex flex-col font-sans overflow-hidden" 
      style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)" }}
    >
      <div className="p-5 sm:p-7 flex justify-between items-start">
        <div className="flex flex-col gap-3 max-w-[75%]">
          {/* Logo */}
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shadow-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--theme-card-bg)", borderColor: "var(--theme-border)" }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black opacity-30">
                {restaurantName ? restaurantName.charAt(0).toUpperCase() : "R"}
              </span>
            )}
          </div>
          
          {/* Nom du resto & Adresse */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight break-words">
              {restaurantName || "Nom du Restaurant"}
            </h1>
            {address && (
              <p className="mt-1.5 text-sm sm:text-base opacity-80 leading-snug break-words">
                {address}
              </p>
            )}
          </div>
        </div>

        {/* Localisation */}
        {locationUrl && (
          <a
            href={inPreview ? "#" : locationUrl}
            target={inPreview ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm border transition-transform hover:scale-105 shrink-0"
            style={{ backgroundColor: "var(--theme-card-bg)", color: "var(--theme-accent)", borderColor: "var(--theme-border)" }}
            onClick={(e) => inPreview && e.preventDefault()}
          >
            <MapPin size={22} strokeWidth={2.5} />
          </a>
        )}
      </div>

      
        {/* Socials & Horaires */}
        {(facebookUrl || instagramUrl || xUrl || snapchatUrl || schedule) && (
          <div className="px-5 sm:px-7 mt-4 flex flex-col gap-4">
            
            {/* Reseaux Sociaux */}
            {(facebookUrl || instagramUrl || xUrl || snapchatUrl) && (
              <div className="flex gap-3">
                {facebookUrl && (
                  <a href={inPreview ? "#" : facebookUrl} target={inPreview ? undefined : "_blank"} className="w-10 h-10 rounded-full flex items-center justify-center border hover:scale-105 transition-transform" style={{ borderColor: "var(--theme-border)" }}>
                    FB
                  </a>
                )}
                {instagramUrl && (
                  <a href={inPreview ? "#" : instagramUrl} target={inPreview ? undefined : "_blank"} className="w-10 h-10 rounded-full flex items-center justify-center border hover:scale-105 transition-transform" style={{ borderColor: "var(--theme-border)" }}>
                    IG
                  </a>
                )}
                {xUrl && (
                  <a href={inPreview ? "#" : xUrl} target={inPreview ? undefined : "_blank"} className="w-10 h-10 rounded-full flex items-center justify-center border hover:scale-105 transition-transform" style={{ borderColor: "var(--theme-border)" }}>
                    X
                  </a>
                )}
                {snapchatUrl && (
                  <a href={inPreview ? "#" : snapchatUrl} target={inPreview ? undefined : "_blank"} className="w-10 h-10 rounded-full flex items-center justify-center border hover:scale-105 transition-transform" style={{ borderColor: "var(--theme-border)" }}>
                    SC
                  </a>
                )}
              </div>
            )}

            
            {/* Infos supplementaires */}
            {additionalInfo && (
              <div className="text-sm p-4 rounded-xl border mt-2" style={{ backgroundColor: "var(--theme-card-bg)", borderColor: "var(--theme-border)" }}>
                <div className="flex items-center gap-2 mb-2 font-semibold">
                  <Info size={16} /> À savoir
                </div>
                <div className="opacity-80 whitespace-pre-wrap leading-relaxed">
                  {additionalInfo}
                </div>
              </div>
            )}

            {/* Horaires */}
            {schedule && (
              <div className="text-sm p-4 rounded-xl border" style={{ backgroundColor: "var(--theme-card-bg)", borderColor: "var(--theme-border)" }}>
                <div className="flex items-center gap-2 mb-3 font-semibold">
                  <Clock size={16} /> Horaires d'ouverture
                </div>
                <div className="flex flex-col gap-1.5 opacity-80">
                  {Object.entries({
                    "Lundi": schedule.monday,
                    "Mardi": schedule.tuesday,
                    "Mercredi": schedule.wednesday,
                    "Jeudi": schedule.thursday,
                    "Vendredi": schedule.friday,
                    "Samedi": schedule.saturday,
                    "Dimanche": schedule.sunday
                  }).map(([day, hrs]) => (
                    <div key={day} className="flex justify-between">
                      <span className="w-20">{day}</span>
                      <span className="font-medium">
                        {hrs?.isOpen ? `${hrs.open} - ${hrs.close}` : "Fermé"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Section Menu */}
      <div className="flex-1 flex flex-col mt-2">
        <div className="px-5 sm:px-7 flex items-center gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold opacity-90">Notre Menu</h2>
          <div className="h-[2px] flex-1 rounded-full opacity-50" style={{ backgroundColor: "var(--theme-border)" }}></div>
        </div>

        <div 
          className="flex overflow-x-auto gap-4 px-5 sm:px-7 pb-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {menuImages && menuImages.length > 0 ? (
            menuImages.map((img, i) => (
              <div 
                key={i} 
                className="shrink-0 snap-center w-[75vw] sm:w-[320px] max-w-[320px] aspect-[3/4] rounded-3xl overflow-hidden border shadow-md relative"
                style={{ backgroundColor: "var(--theme-card-bg)", borderColor: "var(--theme-border)" }}
              >
                <img src={img} alt={`Menu ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            [1, 2].map((i) => (
              <div 
                key={i} 
                className="shrink-0 snap-center w-[75vw] sm:w-[320px] max-w-[320px] aspect-[3/4] rounded-3xl overflow-hidden border flex flex-col items-center justify-center opacity-60"
                style={{ backgroundColor: "var(--theme-card-bg)", borderColor: "var(--theme-border)" }}
              >
                <span className="text-4xl mb-2">🍽️</span>
                <span className="text-sm font-semibold">Page {i}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Bouton WhatsApp */}
      <div className="p-5 sm:p-7 mt-auto pb-8">
        <a
          href={inPreview ? "#" : whatsappUrl}
          target={inPreview ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="w-full rounded-2xl border-none text-white shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: "#25d366", minHeight: "60px", padding: "16px", textDecoration: "none" }}
          onClick={(e) => inPreview && e.preventDefault()}
        >
          <MessageCircle size={24} />
          <span className="text-lg font-bold">Contactez nous</span>
        </a>
      </div>
    </div>
  );
}
