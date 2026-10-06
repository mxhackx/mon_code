"use client";

import { ArrowRight, Calendar, CheckCircle2 } from "lucide-react";

const steps = [
  { number: "1", title: "Créez votre compte", text: "Inscrivez-vous et configurez votre établissement en quelques minutes." },
  { number: "2", title: "Personnalisez votre menu", text: "Ajoutez les infos, photos, horaires et le style visuel de votre marque." },
  { number: "3", title: "Générez votre QR code", text: "Téléchargez votre code QR unique et partagez-le auprès de vos clients." },
  { number: "4", title: "Publiez et analysez", text: "Suivez les scans et optimisez votre expérience client de manière simple." },
];

export default function HowItWorks() {
  return (
    <section id="fonctionnement" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Comment ça marche</p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">En 4 étapes simples</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6">
              {idx < steps.length - 1 && <div className="absolute right-[-18px] top-12 hidden h-0.5 w-9 bg-blue-200 xl:block" />}
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">{step.number}</div>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
