import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/layout/BackButton";
import ProductGrid from "@/components/shop/ProductGrid";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Grid, List } from "lucide-react";
import { shopCategories, categories, getBrandsByCategory, getProductsByCategory } from "@/data/products";

const ShopCategory = () => {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get category data - check both shop categories and detailed categories
  const categoryData = useMemo(() => {
    if (!category) return null;
    
    // First check shop categories (main categories)
    let cat = shopCategories.find(cat => cat.id === category);
    if (cat) return cat;
    
    // Then check detailed categories
    cat = categories.find(cat => cat.id === category);
    return cat || null;
  }, [category]);

  const categoryProducts = useMemo(() => {
    if (!categoryData) return [];
    return categoryData.products;
  }, [categoryData]);

  // Get filter options for this category
  const categoryBrands = useMemo(() => {
    return [...new Set(categoryProducts.map(p => p.brand))].sort();
  }, [categoryProducts]);

  const categoryStockStatuses = useMemo(() => {
    return [...new Set(categoryProducts.map(p => p.stockStatus))];
  }, [categoryProducts]);

  const categoryBadges = useMemo(() => {
    return [...new Set(categoryProducts.filter(p => p.badge).map(p => p.badge!))];
  }, [categoryProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = categoryProducts;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        (product.type && product.type.toLowerCase().includes(query))
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Stock status filter
    if (selectedStockStatuses.length > 0) {
      filtered = filtered.filter(product => selectedStockStatuses.includes(product.stockStatus));
    }

    // Badge filter
    if (selectedBadges.length > 0) {
      filtered = filtered.filter(product => 
        product.badge && selectedBadges.includes(product.badge)
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "brand":
          return a.brand.localeCompare(b.brand);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [categoryProducts, searchQuery, selectedBrands, selectedStockStatuses, selectedBadges, sortBy]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedStockStatuses([]);
    setSelectedBadges([]);
    setSearchQuery("");
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <BackButton />
          <div className="text-center">
            <h1 className="text-2xl font-bold">Category not found</h1>
            <p className="text-muted-foreground mt-2">
              The category you're looking for doesn't exist.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-8">
        <BackButton />
        
        {/* Page Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Shop
            </p>
            <h1 className="text-4xl font-display tracking-tight text-foreground sm:text-5xl">
              {categoryData.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {categoryProducts.length} products available in this category
            </p>
          </div>
        </div>

        {/* Products Section */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <FilterSidebar
                brands={categoryBrands}
                selectedBrands={selectedBrands}
                onBrandChange={setSelectedBrands}
                stockStatuses={categoryStockStatuses}
                selectedStockStatuses={selectedStockStatuses}
                onStockStatusChange={setSelectedStockStatuses}
                badges={categoryBadges}
                selectedBadges={selectedBadges}
                onBadgeChange={setSelectedBadges}
                priceRange={[0, 150000]}
                selectedPriceRange={[0, 150000]}
                onPriceRangeChange={() => {}}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${categoryData.name.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="brand">Brand A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border border-border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {categoryProducts.length} products
              </div>

              {/* Products Grid */}
              <ProductGrid 
                products={filteredProducts}
                emptyMessage={`No ${categoryData.name.toLowerCase()} match your filters. Try adjusting your search criteria.`}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ShopCategory;


