import { BrandLogo } from "@/types/user";

// Import brand logos from assets
import axorLogo from "@/assets/homeBrandLogos/AXOR_NEW_LOGO.webp";
import mtHelmetsLogo from "@/assets/homeBrandLogos/MT helmets.svg";
import smkLogo from "@/assets/homeBrandLogos/SMK-LOGO-2.webp";
import vegaLogo from "@/assets/homeBrandLogos/Vega_LOGO.webp";
import motulLogo from "@/assets/homeBrandLogos/Motul_logo.svg.png";
import liquiMolyLogo from "@/assets/homeBrandLogos/liqui molly logo.svg";
import agvLogo from "@/assets/homeBrandLogos/AGV logo.svg";
import daineseLogo from "@/assets/homeBrandLogos/Dainese logo.svg";
import rcbLogo from "@/assets/homeBrandLogos/RCB logo.svg";
import bremboLogo from "@/assets/homeBrandLogos/brembo Logo_White 1x.svg";
import insta360Logo from "@/assets/homeBrandLogos/insta 360logo-black.svg";
import planetDsgLogo from "@/assets/homeBrandLogos/planet_dsg_logo.avif";

// Brand data with actual logo images
const brandLogos: BrandLogo[] = [
  { id: "axor", name: "Axor", image: axorLogo, altText: "Axor Helmets" },
  { id: "mt-helmets", name: "MT Helmets", image: mtHelmetsLogo, altText: "MT Helmets" },
  { id: "smk", name: "SMK", image: smkLogo, altText: "SMK Helmets" },
  { id: "vega", name: "Vega", image: vegaLogo, altText: "Vega Helmets" },
  { id: "motul", name: "Motul", image: motulLogo, altText: "Motul Oils" },
  { id: "liqui-moly", name: "Liqui Moly", image: liquiMolyLogo, altText: "Liqui Moly" },
  { id: "agv", name: "AGV", image: agvLogo, altText: "AGV Helmets" },
  { id: "dainese", name: "Dainese", image: daineseLogo, altText: "Dainese Protection" },
  { id: "rcb", name: "RCB", image: rcbLogo, altText: "Racing Boy" },
  { id: "brembo", name: "Brembo", image: bremboLogo, altText: "Brembo Brakes" },
  { id: "insta360", name: "Insta360", image: insta360Logo, altText: "Insta360 Cameras" },
  { id: "planet-dsg", name: "Planet DSG", image: planetDsgLogo, altText: "Planet DSG" },
];

// Brand Logo Card Component - Individual hover effects only (no marquee pause)
const BrandLogoCard = ({ brand }: { brand: BrandLogo }) => (
  <div
    className="brand-card flex-shrink-0 flex items-center justify-center
      w-[110px] h-[60px] md:w-[130px] md:h-[70px]
      rounded-xl bg-zinc-800 border border-zinc-700/50
      transition-all duration-300 ease-out cursor-default
      hover:scale-105 hover:border-primary/40
      group p-3"
  >

    <img
      src={brand.image}
      alt={brand.altText}
      className="max-w-full max-h-full object-contain
        filter grayscale opacity-50
        group-hover:grayscale-0 group-hover:opacity-100
        transition-all duration-300 ease-out
        select-none pointer-events-none"
      draggable={false}
    />
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

      {/* Marquee Container - NO hover pause, animation runs continuously */}
      <div className="relative w-full">
        {/* Gradient Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track - Continuous animation, never pauses */}
        <div className="marquee-track flex gap-4 md:gap-6" style={{ width: "max-content" }}>
          {duplicatedBrands.map((brand, index) => (
            <BrandLogoCard key={`${brand.id}-${index}`} brand={brand} />
          ))}
        </div>
      </div>

      {/* Pure CSS Animation Styles - No hover pause */}
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
        
        /* Animated track - runs continuously, never pauses */
        .marquee-track {
          animation: marquee-scroll 35s linear infinite;
          will-change: transform;
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
