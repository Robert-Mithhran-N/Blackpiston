import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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
  ArrowLeft,
  Search,
  Grid3X3,
  LayoutList,
  HardHat,
  Shirt,
  Footprints,
  Sparkles,
  Package,
  Loader2,
} from "lucide-react";
import { fetchProductsByCategory, fetchCategories } from "@/lib/api";
import { Product } from "@/types/user";

// Category icons
const categoryIcons: Record<string, React.ElementType> = {
  helmets: HardHat,
  jackets: Shirt,
  boots: Footprints,
  accessories: Sparkles,
};

// Map API product to ProductCard shape
function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.categorySlug || p.category?.slug || "accessories",
    price: p.price,
    offerPrice: p.compareAtPrice ? p.price : undefined,
    image: p.images?.[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    rating: p.averageRating || 0,
    description: p.description || "",
    inStock: p.isActive !== false,
    featured: p.isFeatured || false,
    isTopOffer: false,
  };
}

const ShopCategory = () => {
  const { category } = useParams<{ category: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{ name: string; description?: string } | null>(null);
  const [otherCategories, setOtherCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const CategoryIcon = category ? categoryIcons[category] || Package : Package;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProductsByCategory(category || ""),
      fetchCategories(),
    ])
      .then(([prodData, catData]) => {
        setProducts((prodData.products || []).map(mapProduct));
        const cats = catData.categories || [];
        const current = cats.find((c: any) => c.slug === category);
        setCategoryInfo(current || null);
        setOtherCategories(cats.filter((c: any) => c.slug !== category));
      })
      .catch((err) => console.error("Failed to load category data:", err))
      .finally(() => setLoading(false));
  }, [category]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }

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
  }, [products, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-orange-500/10 border-b border-border">
          <div className="container py-12 md:py-16">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/shop">
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <CategoryIcon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight capitalize">
                  {categoryInfo?.name || category || "Products"}
                </h1>
                <p className="text-muted-foreground">
                  {categoryInfo?.description || "Browse our premium collection"}
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
                    placeholder={`Search ${categoryInfo?.name || "products"}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

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

          {/* Other Categories Quick Links */}
          <div className="flex flex-wrap gap-2 mb-8">
            {otherCategories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Sparkles;
              return (
                <Link key={cat.id} to={`/shop/${cat.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">
                    <Icon className="h-3 w-3 mr-1" />
                    {cat.name}
                  </Badge>
                </Link>
              );
            })}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredProducts.length}</span>{" "}
              {categoryInfo?.name?.toLowerCase() || "products"}
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <CategoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : `No ${categoryInfo?.name?.toLowerCase() || "products"} available at the moment`}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
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

export default ShopCategory;
