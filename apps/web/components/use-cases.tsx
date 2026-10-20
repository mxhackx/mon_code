"use client";

const cases = [
  {
    icon: "🍽️",
    title: "Restaurants & bistros",
    text: "Présentez votre carte, les plats du jour et les services de votre établissement en un scan. Une page d'accueil que vous modifiez sans réimprimer quoi que ce soit.",
  },
  {
    icon: "💈",
    title: "Salons & instituts",
    text: "Tarifs, prestations, horaires et WhatsApp sur une seule page. Le client scanne au comptoir, il garde vos coordonnées.",
  },
  {
    icon: "🏨",
    title: "Hôtels & locations",
    text: "Un QR dans la chambre ou sur la table du jardin : règles de la maison, Wi-Fi, petit-déjeuner et contact, en PDF ou en page dédiée.",
  },
  {
    icon: "🔧",
    title: "Artisans & services",
    text: "Devis, fiches produit et attestations en ligne, reliés à un QR posé sur la vitrine ou la facture.",
  },
];

export default function UseCases() {
  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Ils posent un QR, vous changez le contenu
        </h2>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Le code imprimé ne bouge pas : la carte, le tarif ou la page d&apos;accueil derrière, si.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((cas) => (
            <article
              key={cas.title}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <span className="text-2xl" aria-hidden="true">
                {cas.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{cas.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{cas.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
