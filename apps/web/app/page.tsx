import Header from "../components/header";
import Hero from "../components/hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      <div className="mx-auto max-w-7xl px-4 pt-10">
        <Hero />
      </div>

      <div className="mx-auto max-w-5xl px-4 mt-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Notre solution B2B</h2> 
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Contactez notre équipe pour concevoir un menu digital personnalisé pour votre établissement. 
          Nous gérons tout, de la création visuelle à l'intégration des QR Codes.
        </p>
      </div>
    </main>
  );
}
