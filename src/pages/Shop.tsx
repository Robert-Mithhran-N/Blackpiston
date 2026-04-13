import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  HardHat,
  Shirt,
  Footprints,
  Sparkles,
  Loader2,
} from "lucide-react";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { Product } from "@/types/user";

// Category icons removed - categories feature removed

// Map API product to ProductCard shape
function mapProduct(p: any): Product {
  // Images come from DB as { url, alt, isPrimary } objects
  const primaryImg = p.images?.find((i: any) => i.isPrimary);
  const firstImg = p.images?.[0];
  const imageUrl = primaryImg?.url || firstImg?.url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";

  return {
    id: p.id,
    name: p.name,
    category: "products", // Simplified - no categories
    price: p.price,
    offerPrice: p.offerPrice || undefined,
    image: imageUrl,
    rating: p.averageRating || p.rating || 0,
    description: p.description || "",
    inStock: p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0),
    featured: p.isFeatured || false,
    isTopOffer: false,
    variants: p.variants || [],
    stockQuantity: p.stockQuantity,
  };
}

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // Category filtering removed - categories feature removed
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ limit: 200 })
      .then((prodData) => {
        setAllProducts((prodData.products || []).map(mapProduct));
      })
      .catch((err) => console.error("Failed to load shop data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
    }

    // Category filter removed - using tags instead

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "offers":
        filtered = filtered.filter((p) => p.offerPrice).sort((a, b) => {
          const discA = a.offerPrice ? ((a.price - a.offerPrice) / a.price) * 100 : 0;
          const discB = b.offerPrice ? ((b.price - b.offerPrice) / b.price) * 100 : 0;
          return discB - discA;
        });
        break;
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }, [allProducts, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-orange-500/10 border-b border-border">
          <div className="container py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Shop</h1>
                <p className="text-muted-foreground">
                  Premium motorcycle gear & accessories
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {/* Filter Bar */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter removed - categories feature removed */}

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="offers">Best Offers</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Quick Links removed - categories feature removed */}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
