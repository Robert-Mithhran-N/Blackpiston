import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedCategories = () => {
  // TODO: Fetch categories from API
  const categories: Array<{
    name: string;
    description: string;
    image: string;
    href: string;
    count: number;
  }> = [];
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
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No categories available
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
