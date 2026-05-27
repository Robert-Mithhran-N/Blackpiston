import { Link } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

// import heroImage from "@/assets/hero-gear.jpg";
const heroImage = "https://res.cloudinary.com/dp890nvg2/image/upload/f_auto,q_auto/v1/blackpiston/assets/hero-gear";

const Hero = () => {
  return (
    <section className="relative py-6 lg:py-10 flex items-center overflow-hidden">
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
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-4 animate-slide-up">
            <div>
              <p className="text-primary font-ui font-semibold text-xs uppercase tracking-widest mb-2">
                Premium Motorcycle Gear & Workshop
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-5xl lg:text-6xl text-foreground leading-tight tracking-wide mb-4">
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
                  Explore Garage
                </Button>
              </Link>
            </div>


          </div>

          {/* Right Content - Hero Image with premium effects */}
          <div className="relative hidden md:block">
            <div className="relative w-full aspect-square max-w-[16rem] md:max-w-[16rem] lg:max-w-[20rem] mx-auto">
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

              {/* Image container with effects */}
              <div className="hero-image-container relative w-full h-full rounded-2xl overflow-hidden animate-float">
                {/* Layer 1: Hero Image */}
                <img
                  src={heroImage}
                  alt="Rider with premium motorcycle gear"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Layer 2: Subtle overlay for edge contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                {/* Layer 3: Cross-direction diagonal white light sweep */}
                <div className="hero-cross-light-sweep absolute inset-0 pointer-events-none z-10" />

                {/* Soft edge overlay */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] pointer-events-none z-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

