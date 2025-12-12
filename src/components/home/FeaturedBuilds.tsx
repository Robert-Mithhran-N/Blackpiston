import { Link } from "react-router-dom";
import { ArrowRight, Clock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const builds = [
  {
    id: 1,
    title: "Café Racer Revival",
    bike: "Royal Enfield Continental GT",
    description: "Complete custom build with clip-ons, rearsets, and bespoke exhaust system.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    duration: "3 weeks",
    services: ["Custom Exhaust", "Suspension", "Lighting"],
  },
  {
    id: 2,
    title: "Adventure Ready",
    bike: "KTM 390 Adventure",
    description: "Full adventure kit with crash guards, auxiliary lights, and luggage system.",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&h=400&fit=crop",
    duration: "1 week",
    services: ["Protection", "Lighting", "Mounting"],
  },
  {
    id: 3,
    title: "Street Fighter Build",
    bike: "Kawasaki Z900",
    description: "Aggressive styling with shorty levers, tail tidy, and ECU flash.",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=400&fit=crop",
    duration: "2 weeks",
    services: ["ECU Tuning", "Body Mods", "Performance"],
  },
];

const FeaturedBuilds = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-2">
              Our Work
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide">
              FEATURED BUILDS
            </h2>
          </div>
          <Link
            to="/garage"
            className="flex items-center gap-2 text-metal-light hover:text-primary transition-colors font-ui font-medium group"
          >
            View All Projects
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Builds Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build, index) => (
            <div
              key={build.id}
              className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={build.image}
                  alt={build.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-primary font-ui font-semibold uppercase tracking-wider">
                    {build.bike}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-foreground tracking-wide mb-2">
                  {build.title.toUpperCase()}
                </h3>
                <p className="text-metal text-sm mb-4 line-clamp-2">
                  {build.description}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-xs text-metal">
                    <Clock className="h-3 w-3" />
                    <span>{build.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-metal">
                    <Wrench className="h-3 w-3" />
                    <span>{build.services.length} services</span>
                  </div>
                </div>

                {/* Services tags */}
                <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {build.services.map((service) => (
                    <span
                      key={service}
                      className="text-xs px-2 py-1 bg-secondary rounded text-metal"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/garage">
            <Button
              size="lg"
              variant="outline"
              className="border-metal text-metal-light hover:bg-secondary hover:text-foreground font-ui font-semibold px-8"
            >
              <Wrench className="mr-2 h-5 w-5" />
              Book Your Build
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBuilds;
