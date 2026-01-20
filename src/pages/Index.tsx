import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import TrustBadges from "@/components/home/TrustBadges";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TrustBadges />
        <CTABanner />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
