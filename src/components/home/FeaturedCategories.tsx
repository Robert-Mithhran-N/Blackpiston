import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HardHat, Shirt, Footprints, Sparkles } from "lucide-react";
import { fetchCategories } from "@/lib/api";

// Category icons
const categoryIcons: Record<string, React.ElementType> = {
  helmets: HardHat,
  jackets: Shirt,
  boots: Footprints,
  accessories: Sparkles,
};

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error("Failed to load categories:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-card">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-2">
                Browse Categories
              </p>
              <h2 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide">
                SHOP BY CATEGORY
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Sparkles;
            return (
              <Link
                key={category.id}
                to={`/shop/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50 border-2 border-border hover:border-primary/50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"}
                    alt={category.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop";
                    }}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-xl text-foreground tracking-wide group-hover:text-primary transition-colors">
                        {category.name.toUpperCase()}
                      </p>
                      {category.productCount !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {category.productCount} products
                        </p>
                      )}
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
