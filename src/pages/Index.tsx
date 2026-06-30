import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import TopOffers from "@/components/home/TopOffers";
import SEO from "@/components/seo/SEO";
// FeaturedCategories removed - categories feature removed
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrustBadges from "@/components/home/TrustBadges";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Home"
        description="BlackPiston Garage is your premium one-stop shop for motorcycle accessories, riding gear, and custom garage workshop services including styling and tuning."
      />
      <Header />
      <main>
        <Hero />
        <TrustBadges />
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
