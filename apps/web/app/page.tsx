import Header from "../components/header";
import Hero from "../components/hero";
import FeaturesSection from "../components/features-section";
import B2BSection from "../components/b2b-section";
import Footer from "../components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <FeaturesSection />

      {/* B2B Section */}
      <B2BSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
