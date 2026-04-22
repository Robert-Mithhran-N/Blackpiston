import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
  PackageCheck,
  Tag,
  Percent,
} from "lucide-react";
import { fetchProducts, fetchProductFilters } from "@/lib/api";
import { Product } from "@/types/user";

// ============================================================
// Constants
// ============================================================

const PRODUCT_TYPES = [
  { id: "helmet", label: "Helmets", icon: "🪖" },
  { id: "jacket", label: "Jackets", icon: "🧥" },
  { id: "gloves", label: "Gloves", icon: "🧤" },
  { id: "boots", label: "Boots", icon: "🥾" },
  { id: "riding-pants", label: "Riding Pants", icon: "👖" },
  { id: "guards", label: "Guards & Armor", icon: "🛡️" },
  { id: "rain-gear", label: "Rain Gear", icon: "🌧️" },
  { id: "accessories", label: "Accessories", icon: "⚙️" },
  { id: "parts", label: "Parts", icon: "🔧" },
  { id: "lubricants", label: "Lubricants", icon: "🛢️" },
];

const DISCOUNT_OPTIONS = [
  { value: 10, label: "10% & above" },
  { value: 25, label: "25% & above" },
  { value: 50, label: "50% & above" },
];

const COLOR_SWATCHES: { name: string; hex: string }[] = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Orange", hex: "#f97316" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Matte Black", hex: "#2d2d2d" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Neon Green", hex: "#39ff14" },
  { name: "Hi-Viz", hex: "#ccff00" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "name_asc", label: "Name: A → Z" },
];

// ============================================================
// Helpers
// ============================================================

function mapProduct(p: any): Product {
  const primaryImg = p.images?.find((i: any) => i.isPrimary);
  const firstImg = p.images?.[0];
  const imageUrl =
    primaryImg?.url ||
    firstImg?.url ||
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";

  return {
    id: p.id,
    name: p.name,
    category: p.brand || "Gear",
    price: p.price,
    offerPrice: p.offerPrice || undefined,
    image: imageUrl,
    rating: p.averageRating || p.rating || 0,
    description: p.description || "",
    shortDescription: p.shortDescription || "",
    inStock:
      p.inStock !== false &&
      (p.stockQuantity === undefined || p.stockQuantity > 0),
    featured: p.isFeatured || false,
    isTopOffer: false,
    variants: p.variants || [],
    stockQuantity: p.stockQuantity,
  };
}

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

// ============================================================
// Filter State from URL
// ============================================================
interface FilterState {
  search: string;
  types: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  minPrice: string;
  maxPrice: string;
  discount: string;
  inStock: boolean;
  sort: string;
  page: number;
}

function filtersFromParams(params: URLSearchParams): FilterState {
  return {
    search: params.get("search") || "",
    types: params.get("tags")?.split(",").filter(Boolean) || [],
    brands: params.get("brand")?.split(",").filter(Boolean) || [],
    colors: params.get("color")?.split(",").filter(Boolean) || [],
    sizes: params.get("size")?.split(",").filter(Boolean) || [],
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    discount: params.get("discount") || "",
    inStock: params.get("inStock") === "true",
    sort: params.get("sort") || "newest",
    page: parseInt(params.get("page") || "1"),
  };
}

function filtersToParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.search) p.set("search", f.search);
  if (f.types.length) p.set("tags", f.types.join(","));
  if (f.brands.length) p.set("brand", f.brands.join(","));
  if (f.colors.length) p.set("color", f.colors.join(","));
  if (f.sizes.length) p.set("size", f.sizes.join(","));
  if (f.minPrice) p.set("minPrice", f.minPrice);
  if (f.maxPrice) p.set("maxPrice", f.maxPrice);
  if (f.discount) p.set("discount", f.discount);
  if (f.inStock) p.set("inStock", "true");
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  if (f.page > 1) p.set("page", String(f.page));
  return p;
}

// ============================================================
// Filter Sidebar Component
// ============================================================

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  availableBrands: string[];
  availableColors: string[];
  availableSizes: string[];
  priceRange: { min: number; max: number };
}

function FilterSidebar({
  filters,
  onFilterChange,
  availableBrands,
  availableColors,
  availableSizes,
  priceRange,
}: FilterSidebarProps) {
  const activeFilterCount =
    filters.types.length +
    filters.brands.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.discount ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
            onClick={() =>
              onFilterChange({
                types: [],
                brands: [],
                colors: [],
                sizes: [],
                minPrice: "",
                maxPrice: "",
                discount: "",
                inStock: false,
              })
            }
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Product Type */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Product Type
        </h4>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {PRODUCT_TYPES.map((type) => (
            <label
              key={type.id}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                filters.types.includes(type.id)
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50 text-foreground/80"
              }`}
            >
              <Checkbox
                checked={filters.types.includes(type.id)}
                onCheckedChange={() =>
                  onFilterChange({
                    types: toggleInArray(filters.types, type.id),
                    page: 1,
                  })
                }
                className="h-4 w-4"
              />
              <span className="text-base leading-none">{type.icon}</span>
              <span className="flex-1">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brand */}
      {availableBrands.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Brand
            </h4>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {availableBrands.map((b) => (
                <label
                  key={b}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                    filters.brands.includes(b)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-foreground/80"
                  }`}
                >
                  <Checkbox
                    checked={filters.brands.includes(b)}
                    onCheckedChange={() =>
                      onFilterChange({
                        brands: toggleInArray(filters.brands, b),
                        page: 1,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="flex-1">{b}</span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`₹${priceRange.min}`}
            value={filters.minPrice}
            onChange={(e) =>
              onFilterChange({ minPrice: e.target.value, page: 1 })
            }
            className="h-9 text-sm"
            min={0}
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="number"
            placeholder={`₹${priceRange.max}`}
            value={filters.maxPrice}
            onChange={(e) =>
              onFilterChange({ maxPrice: e.target.value, page: 1 })
            }
            className="h-9 text-sm"
            min={0}
          />
        </div>
        {/* Quick price buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Under ₹1K", min: "", max: "1000" },
            { label: "₹1K-₹3K", min: "1000", max: "3000" },
            { label: "₹3K-₹5K", min: "3000", max: "5000" },
            { label: "₹5K-₹10K", min: "5000", max: "10000" },
            { label: "₹10K+", min: "10000", max: "" },
          ].map((range) => {
            const isActive =
              filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <Button
                key={range.label}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-7 text-[11px] px-2 ${isActive ? "bg-primary/90" : ""}`}
                onClick={() => {
                  if (isActive) {
                    onFilterChange({ minPrice: "", maxPrice: "", page: 1 });
                  } else {
                    onFilterChange({
                      minPrice: range.min,
                      maxPrice: range.max,
                      page: 1,
                    });
                  }
                }}
              >
                {range.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Color */}
      {availableColors.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Color
            </h4>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.filter(
                (c) =>
                  availableColors.some(
                    (ac) => ac.toLowerCase() === c.name.toLowerCase()
                  ) || filters.colors.includes(c.name)
              ).map((c) => {
                const isActive = filters.colors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() =>
                      onFilterChange({
                        colors: toggleInArray(filters.colors, c.name),
                        page: 1,
                      })
                    }
                    className={`h-7 w-7 rounded-full border-2 transition-all duration-200 ${
                      isActive
                        ? "border-primary ring-2 ring-primary/30 scale-110"
                        : "border-border hover:border-muted-foreground/50 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
            {filters.colors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.colors.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-destructive/20"
                    onClick={() =>
                      onFilterChange({
                        colors: filters.colors.filter((x) => x !== c),
                        page: 1,
                      })
                    }
                  >
                    {c} <X className="h-2.5 w-2.5 ml-0.5" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Size */}
      {availableSizes.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Size
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((s) => {
                const isActive = filters.sizes.includes(s);
                return (
                  <Button
                    key={s}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`h-8 min-w-[36px] text-xs font-medium ${
                      isActive ? "bg-primary/90" : ""
                    }`}
                    onClick={() =>
                      onFilterChange({
                        sizes: toggleInArray(filters.sizes, s),
                        page: 1,
                      })
                    }
                  >
                    {s}
                  </Button>
                );
              })}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Discount */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Percent className="h-3.5 w-3.5" /> Discount
        </h4>
        <div className="space-y-1.5">
          {DISCOUNT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                filters.discount === String(opt.value)
                  ? "bg-green-500/10 text-green-400"
                  : "hover:bg-muted/50 text-foreground/80"
              }`}
            >
              <Checkbox
                checked={filters.discount === String(opt.value)}
                onCheckedChange={(checked) =>
                  onFilterChange({
                    discount: checked ? String(opt.value) : "",
                    page: 1,
                  })
                }
                className="h-4 w-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div className="flex items-center justify-between px-1">
        <Label htmlFor="inStock" className="text-sm flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-green-500" />
          In Stock Only
        </Label>
        <Switch
          id="inStock"
          checked={filters.inStock}
          onCheckedChange={(v) => onFilterChange({ inStock: v, page: 1 })}
        />
      </div>
    </div>
  );
}

// ============================================================
// Active Filter Tags Component
// ============================================================

function ActiveFilterTags({
  filters,
  onFilterChange,
}: {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
}) {
  const tags: { label: string; onRemove: () => void }[] = [];

  filters.types.forEach((t) => {
    const type = PRODUCT_TYPES.find((pt) => pt.id === t);
    tags.push({
      label: type?.label || t,
      onRemove: () =>
        onFilterChange({
          types: filters.types.filter((x) => x !== t),
          page: 1,
        }),
    });
  });

  filters.brands.forEach((b) => {
    tags.push({
      label: b,
      onRemove: () =>
        onFilterChange({
          brands: filters.brands.filter((x) => x !== b),
          page: 1,
        }),
    });
  });

  filters.colors.forEach((c) => {
    tags.push({
      label: `Color: ${c}`,
      onRemove: () =>
        onFilterChange({
          colors: filters.colors.filter((x) => x !== c),
          page: 1,
        }),
    });
  });

  filters.sizes.forEach((s) => {
    tags.push({
      label: `Size: ${s}`,
      onRemove: () =>
        onFilterChange({
          sizes: filters.sizes.filter((x) => x !== s),
          page: 1,
        }),
    });
  });

  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `₹${filters.minPrice} – ₹${filters.maxPrice}`
      : filters.minPrice
        ? `₹${filters.minPrice}+`
        : `Up to ₹${filters.maxPrice}`;
    tags.push({
      label: `Price: ${label}`,
      onRemove: () =>
        onFilterChange({ minPrice: "", maxPrice: "", page: 1 }),
    });
  }

  if (filters.discount) {
    tags.push({
      label: `${filters.discount}%+ off`,
      onRemove: () => onFilterChange({ discount: "", page: 1 }),
    });
  }

  if (filters.inStock) {
    tags.push({
      label: "In Stock",
      onRemove: () => onFilterChange({ inStock: false, page: 1 }),
    });
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Active:</span>
      {tags.map((tag, i) => (
        <Badge
          key={i}
          variant="secondary"
          className="flex items-center gap-1 text-xs px-2 py-0.5 cursor-pointer hover:bg-destructive/20 transition-colors"
          onClick={tag.onRemove}
        >
          {tag.label}
          <X className="h-3 w-3" />
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-destructive h-6 px-2"
        onClick={() =>
          onFilterChange({
            types: [],
            brands: [],
            colors: [],
            sizes: [],
            minPrice: "",
            maxPrice: "",
            discount: "",
            inStock: false,
            page: 1,
          })
        }
      >
        Clear All
      </Button>
    </div>
  );
}

// ============================================================
// MAIN SHOP COMPONENT
// ============================================================

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Dynamic filter options from backend
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });

  // Derive filters from URL
  const filters = useMemo(
    () => filtersFromParams(searchParams),
    [searchParams]
  );

  // Search input (local state for debounce)
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load filter options once
  useEffect(() => {
    fetchProductFilters()
      .then((data) => {
        setAvailableBrands(data.brands || []);
        setAvailableColors(data.colors || []);
        setAvailableSizes(data.sizes || []);
        if (data.priceRange) setPriceRange(data.priceRange);
      })
      .catch((err) => console.error("Failed to load filters:", err));
  }, []);

  // Update filters → URL
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const next = { ...filters, ...updates };
      setSearchParams(filtersToParams(next), { replace: true });
    },
    [filters, setSearchParams]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilters({ search: searchInput, page: 1 });
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  // Sync search input when URL changes externally
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);

    const params: Record<string, any> = {
      page: filters.page,
      limit: 24,
      sort: filters.sort,
    };

    if (filters.search) params.search = filters.search;
    if (filters.types.length) params.tags = filters.types.join(",");
    if (filters.brands.length) params.brand = filters.brands.join(",");
    if (filters.colors.length) params.color = filters.colors.join(",");
    if (filters.sizes.length) params.size = filters.sizes.join(",");
    if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
    if (filters.discount) params.discount = parseInt(filters.discount);
    if (filters.inStock) params.inStock = true;

    fetchProducts(params)
      .then((data) => {
        setProducts((data.products || []).map(mapProduct));
        setPagination(
          data.pagination || { page: 1, total: 0, totalPages: 1 }
        );
      })
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, [
    filters.page,
    filters.search,
    filters.types.join(","),
    filters.brands.join(","),
    filters.colors.join(","),
    filters.sizes.join(","),
    filters.minPrice,
    filters.maxPrice,
    filters.discount,
    filters.inStock,
    filters.sort,
  ]);

  // Active filter count for mobile badge
  const activeFilterCount =
    filters.types.length +
    filters.brands.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.discount ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-orange-500/10 border-b border-border">
          <div className="container py-10 md:py-14">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Shop
                </h1>
                <p className="text-muted-foreground">
                  Premium motorcycle gear & accessories
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-6">
          {/* Top Bar: Search + Sort + View + Mobile Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search helmets, jackets, gloves..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ search: "", page: 1 });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter button */}
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden gap-2"
                    size="sm"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary"
                      >
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] p-0">
                  <SheetHeader className="px-4 py-3 border-b border-border">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-60px)] px-4 py-4">
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={(updates) => {
                        updateFilters(updates);
                      }}
                      availableBrands={availableBrands}
                      availableColors={availableColors}
                      availableSizes={availableSizes}
                      priceRange={priceRange}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select
                value={filters.sort}
                onValueChange={(v) => updateFilters({ sort: v, page: 1 })}
              >
                <SelectTrigger className="w-[170px] h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View toggle */}
              <div className="hidden sm:flex gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          <ActiveFilterTags
            filters={filters}
            onFilterChange={updateFilters}
          />

          {/* Main Content: Sidebar + Products Grid */}
          <div className="flex gap-6 mt-4">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[260px] flex-shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={updateFilters}
                  availableBrands={availableBrands}
                  availableColors={availableColors}
                  availableSizes={availableSizes}
                  priceRange={priceRange}
                />
              </div>
            </aside>

            {/* Products Area */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    <Skeleton className="h-4 w-32 inline-block" />
                  ) : (
                    <>
                      Showing{" "}
                      <span className="text-foreground font-medium">
                        {pagination.total}
                      </span>{" "}
                      product{pagination.total !== 1 ? "s" : ""}
                    </>
                  )}
                </p>
              </div>

              {/* Loading Skeletons */}
              {loading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "space-y-4"
                  }
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <CardContent className="p-3 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Products Found
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    We couldn't find any products matching your current filters.
                    Try adjusting your search or removing some filters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateFilters({
                        search: "",
                        types: [],
                        brands: [],
                        colors: [],
                        sizes: [],
                        minPrice: "",
                        maxPrice: "",
                        discount: "",
                        inStock: false,
                        page: 1,
                      })
                    }
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                /* Product Grid */
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "space-y-4"
                  }
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() =>
                      updateFilters({ page: Math.max(1, filters.page - 1) })
                    }
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 5) },
                      (_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (filters.page <= 3) {
                          pageNum = i + 1;
                        } else if (
                          filters.page >= pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = filters.page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === filters.page ? "default" : "outline"
                            }
                            size="sm"
                            className="w-9 h-9"
                            onClick={() => updateFilters({ page: pageNum })}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= pagination.totalPages}
                    onClick={() =>
                      updateFilters({ page: filters.page + 1 })
                    }
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
