import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/layout/BackButton";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package } from "lucide-react";

// Simple hardcoded categories for now
const simpleCategories = [
  { id: 'helmets', name: 'Helmets', count: 18 },
  { id: 'gloves-jackets', name: 'Gloves & Jackets', count: 27 },
  { id: 'shoes', name: 'Shoes', count: 9 },
  { id: 'accessories', name: 'Accessories', count: 10 },
];

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container">
          <BackButton />
        </div>
        
        {/* Category Selection */}
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
              {simpleCategories.map((category, index) => (
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
                          <div className="w-full h-full bg-current opacity-30 rounded-lg"></div>
                        </div>
                      </div>
                      
                      {/* Category Info */}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-xl font-display tracking-wide text-foreground group-hover:text-primary transition-colors">
                          {category.name.toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.count} products available
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;


