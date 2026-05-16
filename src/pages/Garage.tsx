import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Clock,
  ArrowRight,
  Phone,
  MapPin,
  ChevronRight,
  Settings,
  CheckCircle2,
  X,
  GaugeCircle,
  Zap,
  ShieldCheck
} from "lucide-react";
import { services } from "@/config/services";
import { contactConfig } from "@/config/contact";
import { Service } from "@/types/user";

// --- Components ---

const GarageHero = () => (
  <section className="relative min-h-[60vh] flex items-center bg-black overflow-hidden border-b border-white/5">
    {/* Background Image & Overlay */}
    <div className="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1598583489370-1f9d5c4ffb7d?w=1920&q=80&fit=crop"
        alt="Premium Garage"
        className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
    </div>

    {/* Content */}
    <div className="container relative z-10 py-24">
      <div className="max-w-3xl space-y-6">
        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase tracking-widest text-xs px-3 py-1 rounded-sm">
          <Wrench className="h-3 w-3 mr-2 inline" />
          Performance Studio
        </Badge>
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white uppercase leading-[0.9]">
          Precision <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
            Engineering
          </span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed border-l-2 border-orange-500/50 pl-4">
          Where mechanics meets art. A track-proven service bay dedicated to dyno tuning, 
          performance modifications, and meticulous restoration for riders who demand perfection.
        </p>
      </div>
    </div>
  </section>
);

const ServiceHighlights = ({ highlights }: { highlights: string[] }) => (
  <ul className="space-y-2 mt-4">
    {highlights.map((highlight, idx) => (
      <li key={idx} className="flex items-start text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
        <ChevronRight className="h-4 w-4 text-orange-500 mr-2 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
        <span className="leading-snug">{highlight}</span>
      </li>
    ))}
  </ul>
);

const ServiceCard = ({ service, onClick }: { service: Service; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group relative flex flex-col bg-zinc-950 border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-orange-500/50 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.15)]"
  >
    {/* Image Container */}
    <div className="relative h-64 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-500 z-10" />
      <img
        src={service.image}
        alt={service.name}
        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
      
      {/* Duration Badge */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-sm border border-white/10">
        <Clock className="h-3.5 w-3.5 text-orange-500" />
        {service.duration}
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 p-6 relative z-20 bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-display font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-wide">
          {service.name}
        </h3>
      </div>
      
      <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
        {service.description}
      </p>

      {service.highlights && (
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Highlights</p>
          <ServiceHighlights highlights={service.highlights.slice(0, 3)} />
        </div>
      )}

      {/* Decorative Arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <ArrowRight className="h-6 w-6 text-orange-500" />
      </div>
    </div>
  </div>
);

const ServiceDetailModal = ({ service, onClose }: { service: Service; onClose: () => void }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side: Image & Hero */}
        <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-black flex-shrink-0">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-zinc-950" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase leading-tight mb-2">
              {service.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="h-4 w-4 text-orange-500" />
              Est. Time: <span className="text-white font-medium">{service.duration}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <p className="text-lg text-zinc-300 leading-relaxed font-light mb-8">
            {service.description}
          </p>

          <div className="space-y-8">
            {/* What's Included */}
            {service.included && service.included.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-widest mb-4">
                  <Settings className="h-4 w-4 text-orange-500" />
                  What's Included
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.included.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg p-3 border border-white/5">
                      <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits & Process Grid */}
            <div className="grid sm:grid-cols-2 gap-8">
              {service.benefits && service.benefits.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-widest mb-4">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-3">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.process && service.process.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-widest mb-4">
                    <GaugeCircle className="h-4 w-4 text-orange-500" />
                    Our Process
                  </h4>
                  <ul className="space-y-3 relative before:absolute before:inset-y-2 before:left-[3px] before:w-px before:bg-white/10">
                    {service.process.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 relative">
                        <div className="h-2 w-2 rounded-full bg-zinc-700 ring-4 ring-zinc-950 shrink-0 mt-1.5 relative z-10" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Supported Bikes */}
            {service.supportedBikes && (
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Supported Platforms</p>
                  <p className="text-sm text-zinc-300">{service.supportedBikes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="border-white/10 hover:bg-white/5 text-zinc-300"
            >
              Close Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GarageCTASection = () => (
  <section className="relative py-24 bg-zinc-950 border-t border-white/5 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-background to-background pointer-events-none" />
    
    <div className="container relative z-10">
      <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
        <Wrench className="h-10 w-10 text-orange-500 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-wide mb-4">
          Need Professional <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
            Garage Support?
          </span>
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 font-light">
          Whether you're looking for performance upgrades, routine maintenance, or full 
          rebuilds, our certified master technicians are ready to elevate your machine.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/contact" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all">
              Contact The Garage
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href={contactConfig.phone.link} className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all">
              <Phone className="mr-2 h-4 w-4 text-orange-500" />
              Call {contactConfig.phone.display}
            </Button>
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <MapPin className="h-4 w-4" />
          <span>Located at: {contactConfig.address.full}</span>
        </div>
      </div>
    </div>
  </section>
);

const Garage = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <GarageHero />

        {/* Services Showcase */}
        <section className="py-24 relative z-10 bg-background">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-4">
                  Expertise & <span className="text-orange-500">Capabilities</span>
                </h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  Explore our comprehensive suite of professional garage services. 
                  Select any service to view detailed specifications, processes, and benefits.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onClick={() => setSelectedService(service)} 
                />
              ))}
            </div>
          </div>
        </section>

        <GarageCTASection />
      </main>

      <Footer />

      {/* Modal Portal */}
      {selectedService && (
        <ServiceDetailModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
};

export default Garage;
