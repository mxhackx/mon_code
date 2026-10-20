import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="Moncode - accueil">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                M
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900">Moncode</span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Menus digitaux et cartes QR pour les restaurants, hôtels et commerces.
            </p>
          </div>

          <nav aria-label="Le site">
            <h2 className="text-sm font-semibold text-slate-900">Le site</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/#features" className="text-slate-600 transition hover:text-slate-900">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/#b2b" className="text-slate-600 transition hover:text-slate-900">
                  Offre pour les pros
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-slate-600 transition hover:text-slate-900">
                  Se connecter
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Contact">
            <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:contact@moncode.app"
                  className="text-slate-600 transition hover:text-slate-900"
                >
                  contact@moncode.app
                </a>
              </li>
              <li className="text-slate-600">Support du lundi au vendredi, 9h - 18h</li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Un scan, une carte</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Vos clients ouvrent votre menu sur leur téléphone, sans application à installer.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Moncode</p>
          <p className="text-xs text-slate-500">Menus digitaux et cartes QR</p>
        </div>
      </div>
    </footer>
  );
}
