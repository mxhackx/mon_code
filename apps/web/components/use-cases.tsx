"use client";

export default function UseCases() {
  const cases = [
    {
      icon: "🍽️",
      title: "Restaurants & Bistros",
      description: "Menu digital interactif avec photos plats, tarifs et horaires. Génération de codes QR pour chaque table.",
      example: "La Brasserie Centrale utilise Visicard depuis 3 mois : +35% de consultations de menu, -80% de déchets papier",
    },
    {
      icon: "☕",
      title: "Cafés & Bars",
      description: "Carte des boissons, promotions du jour, événements à venir. Suivi en temps réel des consultations.",
      example: "CaféMoment a augmenté ses ventes de cocktails de 28% grâce aux photos HD et descriptions enrichies",
    },
    {
      icon: "🍕",
      title: "Fast Food & Pizzerias",
      description: "Menu ultra-rapide à charger, commandes faciles à lire, liens de commande en ligne intégrés.",
      example: "Pizz'Express : 2.5K scans/mois, réduction des appels téléphoniques, meilleure gestion des stocks",
    },
    {
      icon: "🏨",
      title: "Hôtels & Chambres d'hôtes",
      description: "Menu room service, services proposés, horaires, contact d'urgence accessible en 1 scan.",
      example: "Auberge du Mont : amélioration 4.8⭐ satisfaction clients, réduction des demandes de service -40%",
    },
    {
      icon: "🎂",
      title: "Pâtisseries & Boulangeries",
      description: "Showcase des produits avec photos alléchantes, tarifs à jour, commandes spéciales en ligne.",
      example: "La Pâtisserie du Coin : commandes de gâteaux personnalisés multiplié par 3 en 2 mois",
    },
    {
      icon: "💅",
      title: "Services (Coiffeur, Spa, Salon)",
      description: "Tarifs des services, disponibilités, portfolio, prise de rendez-vous directe via le menu digital.",
      example: "Salon Beauté Étoile : +45% de nouvelles clientes via le QR Code en vitrine",
    },
  ];

  return (
    <section id="exemples" className="py-20 sm:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Exemples d'utilisation
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez comment différents établissements transforment leur expérience client avec Visicard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((useCase, idx) => (
            <div
              key={idx}
              className="group p-8 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {useCase.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {useCase.description}
              </p>

              {/* Example badge */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">📊 Résultat client</p>
                <p className="text-sm text-blue-800">
                  {useCase.example}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Votre établissement est unique</h3>
          <p className="text-blue-100 mb-6">
            Chaque business a des besoins différents. Nous nous adaptons à votre secteur d'activité.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Demander un cas d'usage personnalisé
          </a>
        </div>
      </div>
    </section>
  );
}
