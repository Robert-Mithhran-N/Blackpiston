import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Helmets",
    description: "Full-face, modular & open-face",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    href: "/shop/helmets",
    count: 48,
  },
  {
    name: "Riding Jackets",
    description: "Leather, textile & mesh",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    href: "/shop/jackets",
    count: 36,
  },
  {
    name: "Riding Boots",
    description: "Racing, touring & casual",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    href: "/shop/boots",
    count: 24,
  },
  {
    name: "Lights & DRLs",
    description: "LEDs, auxiliary & DRL kits",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
    href: "/shop/lights",
    count: 52,
  },
  {
    name: "Accessories",
    description: "Mounts, bags & more",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop",
    href: "/shop/accessories",
    count: 120,
  },
  {
    name: "Oils & Filters",
    description: "Engine oils & maintenance",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=400&fit=crop",
    href: "/shop/oils",
    count: 32,
  },
];

const FeaturedCategories = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-2">
              Browse Categories
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-2 text-metal-light hover:text-primary transition-colors font-ui font-medium group"
          >
            View All Categories
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={category.href}
              className="group relative overflow-hidden rounded-lg bg-secondary border border-border hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-display text-lg text-foreground tracking-wide group-hover:text-primary transition-colors">
                  {category.name.toUpperCase()}
                </p>
                <p className="text-xs text-metal mt-1">{category.count} products</p>
              </div>

              {/* Hover indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
