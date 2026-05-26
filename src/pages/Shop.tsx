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

import {
  HardHat,
  Shirt,
  Hand,
  Footprints,
  ShieldCheck,
  CloudRain,
  Wrench,
  Cog,
  Droplets,
} from "lucide-react";

// Custom SVG icon (Lucide lacks a pants icon)
const PantsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2h12v4l-2 16h-3l-1-12-1 12H8L6 6V2z" />
  </svg>
);

const PRODUCT_TYPES = [
  { id: "helmet", label: "Helmets", Icon: HardHat },
  { id: "jacket", label: "Jackets", Icon: Shirt },
  { id: "gloves", label: "Gloves", Icon: Hand },
  { id: "boots", label: "Boots", Icon: Footprints },
  { id: "riding-pants", label: "Riding Pants", Icon: PantsIcon },
  { id: "guards", label: "Guards & Armor", Icon: ShieldCheck },
  { id: "rain-gear", label: "Rain Gear", Icon: CloudRain },
  { id: "accessories", label: "Accessories", Icon: Cog },
  { id: "parts", label: "Parts", Icon: Wrench },
  { id: "lubricants", label: "Lubricants", Icon: Droplets },
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
  const imageUrl = p.thumbnailUrl || p.images?.find((i: any) => i.isPrimary)?.url || p.images?.[0]?.url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";

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
// Premium Filter Sidebar
// ============================================================

function FilterSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">{children}</h4>
      <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
    </div>
  );
}

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
    <div className="space-y-5">
      {/* ── Premium Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Filters</h3>
            {activeFilterCount > 0 && <p className="text-[10px] text-orange-400/80">{activeFilterCount} active</p>}
          </div>
        </div>
        {activeFilterCount > 0 && (
          <button className="text-[11px] font-medium text-zinc-500 hover:text-red-400 transition-colors duration-300 uppercase tracking-wider"
            onClick={() => onFilterChange({ types: [], brands: [], colors: [], sizes: [], minPrice: "", maxPrice: "", discount: "", inStock: false })}>
            Reset
          </button>
        )}
      </div>

      {/* ── Product Type ── */}
      <div className="space-y-3">
        <FilterSectionHeader>Product Type</FilterSectionHeader>
        <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
          {PRODUCT_TYPES.map((type) => {
            const isActive = filters.types.includes(type.id);
            const IconComp = type.Icon;
            return (
              <button key={type.id}
                onClick={() => onFilterChange({ types: toggleInArray(filters.types, type.id), page: 1 })}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500/15 to-red-500/10 text-orange-300 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50"
                }`}>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  isActive ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800/80 text-zinc-500 group-hover:bg-zinc-700/80 group-hover:text-zinc-300"
                }`}>
                  <IconComp className="h-4 w-4" />
                </div>
                <span className="flex-1 text-left">{type.label}</span>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      {/* ── Brand ── */}
      {availableBrands.length > 0 && (
        <>
          <div className="space-y-3">
            <FilterSectionHeader>Brand</FilterSectionHeader>
            <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
              {availableBrands.map((b) => {
                const isActive = filters.brands.includes(b);
                return (
                  <button key={b} onClick={() => onFilterChange({ brands: toggleInArray(filters.brands, b), page: 1 })}
                    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                      isActive ? "bg-zinc-800/80 text-orange-300 border border-orange-500/25" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                    }`}>
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isActive ? "border-orange-500 bg-orange-500" : "border-zinc-600 group-hover:border-zinc-400"
                    }`}>
                      {isActive && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="flex-1 text-left font-medium">{b}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        </>
      )}

      {/* ── Price Range ── */}
      <div className="space-y-3">
        <FilterSectionHeader>Price Range</FilterSectionHeader>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">₹</span>
            <Input type="number" placeholder={String(priceRange.min)} value={filters.minPrice}
              onChange={(e) => onFilterChange({ minPrice: e.target.value, page: 1 })}
              className="h-9 text-sm pl-7 bg-zinc-900/60 border-zinc-700/50 focus:border-orange-500/50 transition-colors" min={0} />
          </div>
          <div className="h-px w-3 bg-zinc-600" />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">₹</span>
            <Input type="number" placeholder={String(priceRange.max)} value={filters.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value, page: 1 })}
              className="h-9 text-sm pl-7 bg-zinc-900/60 border-zinc-700/50 focus:border-orange-500/50 transition-colors" min={0} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Under ₹1K", min: "", max: "1000" },
            { label: "₹1K–₹3K", min: "1000", max: "3000" },
            { label: "₹3K–₹5K", min: "3000", max: "5000" },
            { label: "₹5K–₹10K", min: "5000", max: "10000" },
            { label: "₹10K+", min: "10000", max: "" },
          ].map((range) => {
            const isActive = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button key={range.label}
                className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                  isActive ? "bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.1)]" : "bg-zinc-900/50 text-zinc-500 border-zinc-700/40 hover:text-zinc-300 hover:border-zinc-600"
                }`}
                onClick={() => isActive ? onFilterChange({ minPrice: "", maxPrice: "", page: 1 }) : onFilterChange({ minPrice: range.min, maxPrice: range.max, page: 1 })}>
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      {/* ── Color ── */}
      {availableColors.length > 0 && (
        <>
          <div className="space-y-3">
            <FilterSectionHeader>Color</FilterSectionHeader>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_SWATCHES.filter((c) =>
                availableColors.some((ac) => ac.toLowerCase() === c.name.toLowerCase()) || filters.colors.includes(c.name)
              ).map((c) => {
                const isActive = filters.colors.includes(c.name);
                return (
                  <button key={c.name} title={c.name}
                    onClick={() => onFilterChange({ colors: toggleInArray(filters.colors, c.name), page: 1 })}
                    className={`h-8 w-8 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                      isActive ? "border-orange-400 ring-2 ring-orange-400/30 scale-110 shadow-[0_0_12px_rgba(249,115,22,0.2)]" : "border-zinc-700 hover:border-zinc-500"
                    }`}
                    style={{ backgroundColor: c.hex }} />
                );
              })}
            </div>
            {filters.colors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {filters.colors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50 cursor-pointer hover:border-red-500/50 hover:text-red-300 transition-all duration-300"
                    onClick={() => onFilterChange({ colors: filters.colors.filter((x) => x !== c), page: 1 })}>
                    {c} <X className="h-2.5 w-2.5" />
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        </>
      )}

      {/* ── Size ── */}
      {availableSizes.length > 0 && (
        <>
          <div className="space-y-3">
            <FilterSectionHeader>Size</FilterSectionHeader>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((s) => {
                const isActive = filters.sizes.includes(s);
                return (
                  <button key={s}
                    className={`h-9 min-w-[40px] px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                      isActive ? "bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.1)]" : "bg-zinc-900/60 text-zinc-500 border-zinc-700/40 hover:text-zinc-200 hover:border-zinc-500"
                    }`}
                    onClick={() => onFilterChange({ sizes: toggleInArray(filters.sizes, s), page: 1 })}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        </>
      )}

      {/* ── Discount ── */}
      <div className="space-y-3">
        <FilterSectionHeader><span className="flex items-center gap-1.5"><Percent className="h-3 w-3" /> Discount</span></FilterSectionHeader>
        <div className="space-y-1">
          {DISCOUNT_OPTIONS.map((opt) => {
            const isActive = filters.discount === String(opt.value);
            return (
              <button key={opt.value}
                onClick={() => onFilterChange({ discount: isActive ? "" : String(opt.value), page: 1 })}
                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                }`}>
                <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  isActive ? "border-emerald-500 bg-emerald-500" : "border-zinc-600 group-hover:border-zinc-400"
                }`}>
                  {isActive && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      {/* ── In Stock ── */}
      <div className="flex items-center justify-between px-1 py-2">
        <Label htmlFor="inStock" className="text-sm font-medium flex items-center gap-2.5 text-zinc-300">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <PackageCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          In Stock Only
        </Label>
        <Switch id="inStock" checked={filters.inStock} onCheckedChange={(v) => onFilterChange({ inStock: v, page: 1 })} />
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
                <SheetContent side="left" className="w-[min(320px,85vw)] p-0">
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
                <SelectTrigger className="w-[170px] min-w-0 h-10">
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
                <div className="text-sm text-muted-foreground">
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
                </div>
              </div>

              {/* Loading Skeletons */}
              {loading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
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
