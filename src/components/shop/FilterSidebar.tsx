import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface FilterSidebarProps {
  brands: string[];
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
  stockStatuses: string[];
  selectedStockStatuses: string[];
  onStockStatusChange: (statuses: string[]) => void;
  badges: string[];
  selectedBadges: string[];
  onBadgeChange: (badges: string[]) => void;
  priceRange: [number, number];
  selectedPriceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({
  brands,
  selectedBrands,
  onBrandChange,
  stockStatuses,
  selectedStockStatuses,
  onStockStatusChange,
  badges,
  selectedBadges,
  onBadgeChange,
  onClearFilters,
}: FilterSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  const handleStockStatusToggle = (status: string) => {
    if (selectedStockStatuses.includes(status)) {
      onStockStatusChange(selectedStockStatuses.filter(s => s !== status));
    } else {
      onStockStatusChange([...selectedStockStatuses, status]);
    }
  };

  const handleBadgeToggle = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      onBadgeChange(selectedBadges.filter(b => b !== badge));
    } else {
      onBadgeChange([...selectedBadges, badge]);
    }
  };

  const hasActiveFilters = 
    selectedBrands.length > 0 || 
    selectedStockStatuses.length > 0 || 
    selectedBadges.length > 0;

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {selectedBrands.length + selectedStockStatuses.length + selectedBadges.length}
              </Badge>
            )}
          </div>
        </Button>
      </div>

      {/* Filter Sidebar */}
      <div className={`space-y-4 ${isOpen ? 'block' : 'hidden'} lg:block`}>
        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}

        {/* Brands Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {brand}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stock Status Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stockStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`stock-${status}`}
                  checked={selectedStockStatuses.includes(status)}
                  onCheckedChange={() => handleStockStatusToggle(status)}
                />
                <label
                  htmlFor={`stock-${status}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {status}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Badges Filter */}
        {badges.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Special Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {badges.map((badge) => (
                <div key={badge} className="flex items-center space-x-2">
                  <Checkbox
                    id={`badge-${badge}`}
                    checked={selectedBadges.includes(badge)}
                    onCheckedChange={() => handleBadgeToggle(badge)}
                  />
                  <label
                    htmlFor={`badge-${badge}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {badge}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default FilterSidebar;