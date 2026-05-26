import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import TopOffers from "@/components/home/TopOffers";
// FeaturedCategories removed - categories feature removed
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrustBadges from "@/components/home/TrustBadges";
import AboutSection from "@/components/home/AboutSection";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TrustBadges />
        <AboutSection />
        <TopOffers />
        {/* FeaturedCategories removed - categories feature removed */}
        <FeaturedProducts />
        <CTABanner />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
