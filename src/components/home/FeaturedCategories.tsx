import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductGrid from "@/components/shop/ProductGrid";
import { getFeaturedProducts, shopCategories } from "@/data/products";

const FeaturedCategories = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-20 bg-card">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary font-ui font-semibold text-sm uppercase tracking-widest mb-2">
              Featured Products
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide">
              GEAR THAT PERFORMS
            </h2>
          </div>
          <Link
            to="/shop/browse"
            className="flex items-center gap-2 text-metal-light hover:text-primary transition-colors font-ui font-medium group"
          >
            View All Products
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Featured Products */}
        <ProductGrid products={featuredProducts} />

        {/* Categories Quick Links */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl text-foreground tracking-wide">
              SHOP BY CATEGORY
            </h3>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-metal-light hover:text-primary transition-colors font-ui font-medium group"
            >
              View All Categories
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopCategories.map((category) => (
              <Link
                key={category.id}
                to={`/shop/${category.id}`}
                className="group p-6 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-all duration-300 text-center"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto bg-background rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
                      {/* Icon placeholder */}
                      <div className="w-full h-full bg-current opacity-20 rounded"></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground group-hover:text-primary transition-colors tracking-wide">
                      {category.name.toUpperCase()}
                    </p>
                    <p className="text-xs text-metal mt-1">{category.products.length} items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
