import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'New':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'Best Seller':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'Track Rated':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'Limited Edition':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'text-green-500';
      case 'Low Stock':
        return 'text-yellow-500';
      case 'Out of Stock':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden">
        {/* Product Image */}
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            {product.category} Image
          </div>
        </div>
        
        {/* Badge */}
        {product.badge && (
          <Badge 
            className={`absolute top-2 left-2 ${getBadgeColor(product.badge)}`}
          >
            {product.badge}
          </Badge>
        )}
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="h-8 w-8 p-0 bg-gradient-flame hover:opacity-90"
              disabled={product.stockStatus === 'Out of Stock'}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Brand */}
        <div className="text-xs font-medium text-primary uppercase tracking-wider">
          {product.brand}
        </div>
        
        {/* Product Name */}
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Type/Subcategory */}
        {(product.type || product.subcategory) && (
          <div className="text-xs text-muted-foreground">
            {product.type || product.subcategory}
          </div>
        )}
        
        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.sizes.slice(0, 4).map((size) => (
              <span 
                key={size}
                className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        )}
        
        {/* Size Range */}
        {product.sizeRange && (
          <div className="text-xs text-muted-foreground">
            Sizes: {product.sizeRange}
          </div>
        )}
        
        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-bold text-foreground">
              ₹{product.price.toLocaleString()}
            </div>
            <div className={`text-xs font-medium ${getStockColor(product.stockStatus)}`}>
              {product.stockStatus}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;