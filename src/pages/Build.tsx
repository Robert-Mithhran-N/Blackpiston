import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Percent,
  Shield,
  Truck,
  Headphones,
  PackageSearch
} from "lucide-react";
import { buildKits } from "@/config/services";
import { ProductRequestModal } from "@/components/shared/ProductRequestModal";

const Build = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/20 via-background to-orange-500/10 border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%220.5%22%20opacity%3D%220.05%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          <div className="container relative py-16 md:py-24">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Package className="h-3 w-3 mr-1" />
                Curated Gear Bundles
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Build & <span className="text-primary">Fit</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Custom builds without the guesswork. Pick your platform, share your riding style,
                and we'll recommend parts, fitment, and tuning paths that work together.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                    Start Build Consult
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button size="lg" variant="outline">
                    Browse Shop
                  </Button>
                </Link>
                <ProductRequestModal defaultProduct="Custom Build / Product Inquiry">
                  <Button size="lg" variant="secondary" className="bg-background/50 backdrop-blur-md border-primary/20 hover:bg-primary/10 transition-all">
                    Request a Product
                    <PackageSearch className="ml-2 h-5 w-5" />
                  </Button>
                </ProductRequestModal>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-8 border-b border-border bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bundle Savings</p>
                  <p className="text-xs text-muted-foreground">Save up to 20%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Fitment Guaranteed</p>
                  <p className="text-xs text-muted-foreground">100% compatible</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On all kits</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Expert Support</p>
                  <p className="text-xs text-muted-foreground">Build guidance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Build Kits */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready-to-Ride <span className="text-primary">Kits</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Expertly curated gear bundles designed for different riding styles.
                Each kit includes everything you need to hit the road safely.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {buildKits.map((kit) => {
                const discountPercent = Math.round(
                  ((kit.totalPrice - kit.discountedPrice) / kit.totalPrice) * 100
                );

                return (
                  <Card
                    key={kit.id}
                    className="group relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                  >
                    {/* Discount Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-bold">
                        SAVE {discountPercent}%
                      </Badge>
                    </div>

                    {/* Kit Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={kit.image}
                        alt={kit.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {kit.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">{kit.description}</p>

                      {/* Included Items Count */}
                      <div className="mb-6">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Includes:
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          <span>{kit.products.length} premium items included</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-3xl font-bold text-primary">
                          ₹{kit.discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{kit.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* CTA */}
                      <Button className="w-full group/btn bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Build Your Setup
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Custom Build CTA */}
        <section className="py-16 bg-gradient-to-br from-primary/10 to-orange-500/10 border-y border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Need a Custom Build?</h2>
              <p className="text-muted-foreground mb-8">
                Don't see what you're looking for? Our experts can create a custom kit
                tailored to your bike and riding style.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Platform-specific guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Fitment checks included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Install support available</span>
                </div>
              </div>
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                  Start Custom Build
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Build;
