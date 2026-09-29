export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Votre restaurant en un <span className="text-primary">Scan</span>
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Bienvenue sur MonCode. Nous créons des menus digitaux interactifs, performants et à votre image pour offrir la meilleure expérience à vos clients.
        </p>
      </div>
      <div className="mt-8 flex gap-4">
        <a
          href="#contact"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Demander une démo
        </a>
        <a
          href="/connexion"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Espace Agence
        </a>
      </div>
    </section>
  );
}