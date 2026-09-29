"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        
        {/* LOGO */}
        <Link
          href="/"
          aria-label="MonCode - accueil"
          className="flex items-center text-xl font-bold tracking-tight"
        >
          <span className="text-foreground">
            Mon
          </span>
          <span className="text-primary">
            Code
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-4">
          <Link
            href="#apropos"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            A propos
          </Link>

          <Link
            href="#contact"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Contactez-nous
          </Link>
        </nav>
      </div>
    </header>
  );
}
