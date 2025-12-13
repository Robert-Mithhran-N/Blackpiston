import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/layout/BackButton";
import { CheckCircle2 } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16 space-y-16">
        <BackButton />
        
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              About Us
            </p>
            <h1 className="text-4xl font-display tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              BlackPiston Garage
            </h1>
          </div>
          
          <div className="space-y-6 text-metal-light font-ui">
            <p className="text-lg leading-relaxed">
              Founded in 2025, BlackPiston Garage was built with one mission in mind:
              to fuel every rider's journey with reliable parts, premium accessories, and the spirit of true motor culture.
            </p>
            <p className="text-lg leading-relaxed">
              What started as a small passion project quickly turned into a dedicated garage where craftsmanship meets innovation. At BlackPiston, we believe that every bike deserves the best—and every rider deserves gear they can trust.
            </p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-display tracking-wide text-foreground sm:text-4xl">
            Who We Are
          </h2>
          <p className="text-lg text-metal-light font-ui leading-relaxed">
            BlackPiston Garage is a modern motorcycle service and parts hub created for riders who value quality, performance, and authenticity. Our team is made up of passionate bikers, mechanics, and enthusiasts who understand what your machine means to you.
          </p>
        </section>

        {/* What We Offer */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-display tracking-wide text-foreground sm:text-4xl">
            What We Offer
          </h2>
          <p className="text-lg text-metal-light font-ui leading-relaxed">
            From essential motorcycle parts to custom performance upgrades, from durable riding gear to everyday rider accessories, we aim to bring you everything you need in one place. Every product is carefully selected to meet the standards we expect on our own rides.
          </p>
        </section>

        {/* Our Vision */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-display tracking-wide text-foreground sm:text-4xl">
            Our Vision
          </h2>
          <p className="text-lg text-metal-light font-ui leading-relaxed">
            We're here to create a community-driven platform where riders can explore, shop, and maintain their bikes with confidence. Whether you're building your dream machine or simply keeping your two-wheeler in peak condition, BlackPiston Garage is your trusted partner on and off the road.
          </p>
        </section>

        {/* Why Choose Us */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-display tracking-wide text-foreground sm:text-4xl">
            Why Choose Us
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground">Passion-driven craftsmanship</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground">High-quality and reliable products</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground">A curated selection for all types of riders</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground">Transparent, customer-focused service</p>
            </div>
          </div>
        </section>

        {/* Closing Statement */}
        <section className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-xl text-metal-light font-ui leading-relaxed">
              At BlackPiston Garage, it's more than just bikes—<br />
              it's freedom, culture, and the open road.
            </p>
            <div className="space-y-2 pt-4">
              <p className="text-lg font-ui font-semibold text-foreground">
                Welcome to the family.
              </p>
              <p className="text-2xl font-display tracking-wide text-gradient-flame">
                Ride with power. Ride with purpose. Ride with BlackPiston.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
