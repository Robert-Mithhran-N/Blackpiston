import { BrandLogo } from "@/types/user";

// Brand data for the marquee
const brandLogos: BrandLogo[] = [
  { id: "axor", name: "Axor", image: "", altText: "Axor Helmets" },
  { id: "mt-helmets", name: "MT Helmets", image: "", altText: "MT Helmets" },
  { id: "smk", name: "SMK", image: "", altText: "SMK Helmets" },
  { id: "steelbird", name: "Steelbird", image: "", altText: "Steelbird Helmets" },
  { id: "vega", name: "Vega", image: "", altText: "Vega Helmets" },
  { id: "motul", name: "Motul", image: "", altText: "Motul Oils" },
  { id: "liqui-moly", name: "Liqui Moly", image: "", altText: "Liqui Moly" },
  { id: "rynox", name: "Rynox", image: "", altText: "Rynox Gear" },
  { id: "solace", name: "Solace", image: "", altText: "Solace Apparel" },
  { id: "agv", name: "AGV", image: "", altText: "AGV Helmets" },
  { id: "alpinestars", name: "Alpinestars", image: "", altText: "Alpinestars" },
  { id: "dainese", name: "Dainese", image: "", altText: "Dainese Protection" },
];

// Brand Card Component - Pure CSS hover effects
const BrandCard = ({ brand }: { brand: BrandLogo }) => (
  <div
    className="brand-card flex-shrink-0 flex items-center justify-center
      w-[120px] h-[60px] md:w-[140px] md:h-[70px]
      rounded-xl bg-card/80 border border-border/50
      transition-all duration-300 ease-out cursor-default
      hover:scale-105 hover:brightness-125 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
  >
    <span className="text-sm md:text-base font-semibold text-muted-foreground select-none pointer-events-none">
      {brand.name}
    </span>
  </div>
);

const TrustBadges = () => {
  // Duplicate brands for seamless infinite loop
  const duplicatedBrands = [...brandLogos, ...brandLogos];

  return (
    <section className="py-12 bg-gradient-to-b from-secondary/30 to-background border-y border-border overflow-hidden">
      <div className="container mb-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-2">
            Trusted by Riders
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Premium Brands We Carry
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">
            We partner with the world's leading motorcycle gear and accessories brands
          </p>
        </div>
      </div>

      {/* Marquee Container - Pure CSS pause on hover */}
      <div className="marquee-container relative w-full">
        {/* Gradient Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track - CSS animation with hover pause */}
        <div className="marquee-track flex gap-4 md:gap-6" style={{ width: "max-content" }}>
          {duplicatedBrands.map((brand, index) => (
            <BrandCard key={`${brand.id}-${index}`} brand={brand} />
          ))}
        </div>
      </div>

      {/* Bottom Trust Indicators */}
      <div className="container mt-10">
        <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">100% Genuine Products</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm text-muted-foreground">Authorized Dealer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-sm text-muted-foreground">Manufacturer Warranty</span>
          </div>
        </div>
      </div>

      {/* Pure CSS Animation Styles - No JS state changes */}
      <style>{`
        /* Marquee keyframes */
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        /* Animated track */
        .marquee-track {
          animation: marquee-scroll 35s linear infinite;
          will-change: transform;
        }
        
        /* Pause on hover - CSS only, resumes from same position */
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
        
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TrustBadges;
