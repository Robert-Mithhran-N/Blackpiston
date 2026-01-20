import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package } from "lucide-react";
import { Category } from "@/data/products";

interface ShopCategorySelectorProps {
  categories: Category[];
}

const ShopCategorySelector = ({ categories }: ShopCategorySelectorProps) => {
  return (
    <section className="py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            CHOOSE YOUR GEAR
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a category to explore our curated collection of premium motorcycle gear and accessories.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop/${category.id}`}
              className="group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="h-full overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-8 text-center space-y-6 h-full flex flex-col">
                  {/* Category Icon */}
                  <div className="w-20 h-20 mx-auto bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <div className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors">
                      {/* Icon placeholder - in a real app, you'd use the actual icon */}
                      <div className="w-full h-full bg-current opacity-30 rounded-lg"></div>
                    </div>
                  </div>
                  
                  {/* Category Info */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-display tracking-wide text-foreground group-hover:text-primary transition-colors">
                      {category.name.toUpperCase()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.products.length} products available
                    </p>
                  </div>
                  
                  {/* Action Indicator */}
                  <div className="flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="text-sm font-medium mr-2">Shop Now</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-8">
          {/* Browse All Link */}
          <div>
            <Link
              to="/shop/browse"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Browse All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-medium text-foreground">Premium Brands</h4>
              <p className="text-sm text-muted-foreground">
                Curated selection from trusted manufacturers
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-medium text-foreground">Fast Shipping</h4>
              <p className="text-sm text-muted-foreground">
                Same-day dispatch for in-stock items
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-medium text-foreground">Expert Support</h4>
              <p className="text-sm text-muted-foreground">
                Fitment guidance and technical advice
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopCategorySelector;