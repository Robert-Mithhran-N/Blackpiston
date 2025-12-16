import { Link } from "react-router-dom";
import { ArrowRight, Wrench, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import rider image - add rider-hero.jpg to src/assets/ folder
// Uncomment the line below and add your image file
// import riderImage from "@/assets/rider-hero.jpg";

// For now, using a path that will work when image is added to public folder
// Or uncomment the import above and use: src={riderImage}
const riderImageSrc = "/rider-hero.jpg";

const Hero = () => {
  return (
    <section className="relative py-16 lg:py-20 flex items-center overflow-hidden">
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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-4">
                Premium Motorcycle Gear & Workshop
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground leading-tight tracking-wide mb-6">
                GEAR UP.<br />
                <span className="text-gradient-flame">RIDE HARD.</span><br />
                MODIFY SMARTER.
              </h1>
            </div>
            
            {/* CTAs in compact row */}
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="inline-block">
                <Button 
                  size="lg" 
                  className="bg-gradient-flame hover:bg-[#f97316] hover:scale-105 hover:text-black transition-all duration-300 text-base font-ui font-semibold px-6 py-5 group rounded-md"
                >
                  Shop Gear
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:text-black transition-all duration-300" />
                </Button>
              </Link>
              <Link to="/garage" className="inline-block">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-metal text-metal-light hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 text-base font-ui font-semibold px-6 py-5 group rounded-md"
                >
                  <Wrench className="mr-2 h-4 w-4 group-hover:text-black transition-colors duration-300" />
                  Book Service
                </Button>
              </Link>
            </div>

            {/* Trust badges with inline icons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-metal">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Same-day shipping</span>
              </div>
              <span className="text-metal/40">•</span>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>30-Day returns</span>
              </div>
              <span className="text-metal/40">•</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Certified mechanics</span>
              </div>
            </div>
          </div>

          {/* Right Content - Rider/Product Image with animated ring */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
              {/* Animated parallax ring behind image */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border-2 border-primary/20 animate-rotate-slow" />
                <div className="absolute w-[90%] h-[90%] rounded-full border border-primary/15 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
                <div className="absolute w-[80%] h-[80%] rounded-full border border-primary/10 animate-rotate-slow" style={{ animationDuration: '30s' }} />
              </div>

              {/* Blur highlight effect - subtle glow around image */}
              <div className="absolute inset-0 -z-10 blur-3xl opacity-25">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/50 via-flame-end/40 to-primary/30" />
              </div>

              {/* Image container with blended border */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden animate-float">
                {/* Subtle border overlay that blends with background - creates seamless edge */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-background/70 via-background/30 to-background/50 pointer-events-none z-10 mix-blend-soft-light" />
                <div className="absolute inset-[1px] rounded-2xl border border-background/20 pointer-events-none z-10" />
                {/* Additional soft edge fade */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none z-10" />
                
                {/* Rider image - 3/4 shot, properly fitted */}
                <img 
                  src={riderImageSrc} 
                  alt="Rider with premium motorcycle gear" 
                  className="w-full h-full object-cover object-center scale-105"
                  onError={(e) => {
                    // Fallback if image not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback placeholder - hidden by default */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card via-secondary to-background" style={{ display: 'none' }}>
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-flame opacity-20 blur-2xl" />
                    <p className="font-display text-2xl text-gradient-flame mb-2">RIDER</p>
                    <p className="font-ui text-metal-light text-sm uppercase tracking-widest">
                      Premium Gear
                    </p>
                    <p className="font-ui text-metal text-xs mt-4 max-w-xs">
                      Add rider-hero.jpg to src/assets/ or public/
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
