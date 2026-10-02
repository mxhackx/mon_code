"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, QrCode, ShieldCheck, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-blue-50 via-cyan-50 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              Menus digitaux pour restaurants & commerce
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Créez un menu digital <span className="text-blue-600">qui vend</span> en quelques minutes.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Moncode transforme votre établissement avec un menu numérique moderne, des QR codes élégants et une expérience client fluide, sans besoin de compétences techniques.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/connexion" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                Créer mon menu
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50">
                Demander une démo
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Sans engagement</div>
              <div className="flex items-center gap-2"><QrCode className="h-4 w-4 text-blue-500" /> QR code personnalisé</div>
              <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-500" /> Support rapide</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-8 h-32 w-32 rounded-full bg-cyan-200/60 blur-3xl" />
            <div className="absolute -right-4 bottom-4 h-32 w-32 rounded-full bg-blue-200/70 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)]">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Restaurant</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">Le Jardin</h2>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Online</div>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Menu du jour</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">Entrées & plats</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">QR</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Maki saumon", "18€"],
                    ["Burger maison", "16€"],
                    ["Salade fraîche", "12€"],
                  ].map(([name, price], i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <span className="text-sm font-medium text-slate-700">{name}</span>
                      <span className="text-sm font-semibold text-slate-900">{price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
