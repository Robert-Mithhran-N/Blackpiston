import { Link } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card">
        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-flame-end/10 blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--metal)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--metal)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-4">
                Premium Motorcycle Gear & Workshop
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-none tracking-wide">
                GEAR UP.<br />
                <span className="text-gradient-flame">RIDE HARD.</span><br />
                MODIFY SMARTER.
              </h1>
            </div>
            
            <p className="text-metal-light text-lg max-w-lg font-ui">
              Premium motorcycle gear & professional workshop services — shipped fast or fitted at our garage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button 
                  size="lg" 
                  className="bg-gradient-flame hover:opacity-90 transition-all text-lg font-ui font-semibold px-8 py-6 group"
                >
                  Shop Gear
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/garage">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-metal text-metal-light hover:bg-secondary hover:text-foreground text-lg font-ui font-semibold px-8 py-6 group"
                >
                  <Wrench className="mr-2 h-5 w-5" />
                  Book Service
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-metal">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Same-Day Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-metal">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-metal">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Certified Mechanics</span>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square">
              {/* Metallic ring decoration */}
              <div className="absolute inset-0 rounded-full border-2 border-metal/30" />
              <div className="absolute inset-4 rounded-full border border-metal/20" />
              <div className="absolute inset-8 rounded-full border border-metal/10" />
              
              {/* Center content */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-secondary to-card flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-6xl text-gradient-flame">2024</p>
                  <p className="font-ui text-metal-light text-sm uppercase tracking-widest mt-2">
                    New Collection
                  </p>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-8 -right-4 bg-card border border-border rounded-lg p-4 shadow-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="font-display text-2xl text-primary">500+</p>
                <p className="text-xs text-metal">Products</p>
              </div>
              
              <div className="absolute bottom-20 -left-8 bg-card border border-border rounded-lg p-4 shadow-xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <p className="font-display text-2xl text-primary">15+</p>
                <p className="text-xs text-metal">Services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
