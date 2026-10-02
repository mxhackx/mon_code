"use client";

import { CheckCircle2, QrCode, Smartphone, Users } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Créez votre profil",
    description: "Inscrivez-vous en quelques secondes et remplissez les informations de votre établissement",
    icon: Users,
  },
  {
    number: "2",
    title: "Personnalisez votre menu",
    description: "Ajoutez vos photos, horaires, contact et informations. Choisissez votre design préféré",
    icon: Smartphone,
  },
  {
    number: "3",
    title: "Générez votre QR Code",
    description: "Créez un code QR unique et personnalisé en un clic",
    icon: QrCode,
  },
  {
    number: "4",
    title: "Partagez et gagnez",
    description: "Imprimez vos QR Codes et partagez-les avec vos clients. Suivez les statistiques en temps réel",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section id="fonctionnement" className="py-20 sm:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            4 étapes simples pour transformer votre restaurant avec Visicard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-[60%] w-[90%] h-0.5 bg-gradient-to-r from-blue-300 to-transparent"></div>
                )}

                <div className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full">
                  {/* Number badge */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold rounded-full flex items-center justify-center mb-4 text-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual timeline for mobile */}
        <div className="lg:hidden mt-12 space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 mt-2"></div>
              <div className="w-0.5 h-12 bg-blue-300 my-2"></div>
            </div>
            <div className="pb-4">
              <p className="text-sm text-gray-500">Étape 1 → Étape 2 → Étape 3 → Étape 4</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
