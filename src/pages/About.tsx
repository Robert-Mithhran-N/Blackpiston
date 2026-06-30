import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/seo/SEO";
import BackButton from "@/components/layout/BackButton";
import { CheckCircle2, Wrench, Shield, ShoppingBag, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactConfig } from "@/config/contact";

const About = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Us"
        description="Learn more about BlackPiston Garage - a premium motorcycle gear store and advanced multi-brand service clinic in Tamil Nadu. Discover our values, team, and mission."
        breadcrumbs={breadcrumbs}
      />
      <Header />
      <main className="py-16 space-y-20">
        <div className="container">
          <BackButton />
        </div>
        
        {/* Hero Section */}
        <section className="container max-w-4xl mx-auto space-y-6">
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

        {/* Who We Are & What We Do Section */}
        <section className="py-20 relative bg-zinc-950/40 border-y border-border overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-orange-600/5 blur-[150px] pointer-events-none" />

          <div className="container relative z-10">
            <div className="grid gap-12 lg:grid-cols-12 items-center">
              {/* Left Text details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <span className="text-primary font-ui font-semibold text-xs uppercase tracking-widest block">
                    The Performance Hub
                  </span>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight leading-[0.95]">
                    Who We Are & <br />
                    <span className="text-gradient-flame">What We Do</span>
                  </h2>
                </div>
                
                <p className="text-zinc-300 text-base md:text-lg leading-relaxed font-light font-ui">
                  <strong>BlackPiston Garage</strong> is a premium, authorized multi-brand retail store and advanced motorcycle service clinic based in Tamil Nadu. We serve passionate motorcycle enthusiasts across India by providing top-tier riding safety equipment and track-grade workshop services under one roof.
                </p>

                {/* Structured Points */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="flex gap-3 items-start">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-primary">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
                        Premium Gear Store
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Authorized dealers of premium helmets, riding jackets, safety armor, boots, and performance accessories from Axor, MT, SMK, and Dainese.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-primary">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
                        Advanced Workshop
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Certified technicians specializing in ECU tuning, custom DRL installs, high-performance suspension setup, and general mechanical servicing.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
                        Pan-India Shipping
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Secure and fully tracked delivery of parts and accessories to Pin codes all across India, backed by reliable transit partners.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-primary">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
                        Secure checkout
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Transactions are verified and processed securely via Razorpay payment gateway with full end-to-end 256-bit SSL protection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 font-bold px-6">
                    <Link to="/shop">Browse Store</Link>
                  </Button>
                  <Button variant="outline" asChild className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900">
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>

              {/* Right Visual Box - Location details card */}
              <div className="lg:col-span-5">
                <div className="relative group p-1.5 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-800/80 shadow-2xl overflow-hidden">
                  {/* Card visual header */}
                  <div className="relative h-48 w-full rounded-xl overflow-hidden bg-zinc-950">
                    <img
                      src="https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&q=80&fit=crop"
                      alt="BlackPiston Garage Showroom"
                      className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 border border-white/10 px-3 py-1 rounded-sm text-xs text-zinc-300 backdrop-blur-sm">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>Tamil Nadu, India</span>
                    </div>
                  </div>

                  {/* Card content info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">
                        Flagship Garage & Store
                      </h3>
                      <p className="text-xs text-muted-foreground leading-normal">
                        Feel free to visit our physical showroom to try on riding gear or book performance modifications in person.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs border-t border-zinc-900 pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-zinc-500 font-medium">Business Name</span>
                        <span className="text-zinc-300 text-right font-semibold">BlackPiston Garage</span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-zinc-500 font-medium">Physical Address</span>
                        <span className="text-zinc-300 text-right max-w-[220px]">
                          {contactConfig.address.full}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-zinc-500 font-medium">Support Contact</span>
                        <span className="text-zinc-300 text-right font-semibold">
                          {contactConfig.phone.display} <br />
                          {contactConfig.email.display}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-zinc-500 font-medium">Store Timings</span>
                        <span className="text-zinc-300 text-right font-semibold">
                          Mon-Sat: {contactConfig.businessHours?.weekdays} <br />
                          Sun: {contactConfig.businessHours?.sunday}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="container max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-display tracking-wide text-foreground sm:text-4xl">
            Our Vision
          </h2>
          <p className="text-lg text-metal-light font-ui leading-relaxed">
            We're here to create a community-driven platform where riders can explore, shop, and maintain their bikes with confidence. Whether you're upgrading your ride or simply keeping your two-wheeler in peak condition, BlackPiston Garage is your trusted partner on and off the road.
          </p>
        </section>

        {/* Why Choose Us */}
        <section className="container max-w-4xl mx-auto space-y-6">
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
        <section className="container max-w-4xl mx-auto space-y-6 text-center">
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

