import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types/user";

interface ProductCardProps {
    product: Product;
    variant?: "default" | "compact" | "featured";
    onAddToCart?: (product: Product) => void;
}

const ProductCard = ({ product, variant = "default", onAddToCart }: ProductCardProps) => {
    const discountPercent = product.offerPrice
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart?.(product);
    };

    return (
        <Link to={`/shop/${product.category}/${product.id}`} className="block group">
            <Card
                className={`relative overflow-hidden transition-all duration-300 border-2 border-border hover:border-primary/50 hover:shadow-xl bg-card ${variant === "featured" ? "h-full" : ""
                    }`}
            >
                {/* Discount Badge */}
                {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-bold">
                            {discountPercent}% OFF
                        </Badge>
                    </div>
                )}

                {/* Out of Stock Badge */}
                {!product.inStock && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                )}

                {/* Product Image */}
                <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-muted to-muted/50">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";
                        }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        {product.inStock && (
                            <Button
                                size="sm"
                                onClick={handleAddToCart}
                                className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 bg-primary hover:bg-primary/90"
                            >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        )}
                    </div>
                </div>

                <CardContent className={`p-4 ${variant === "compact" ? "p-3" : ""}`}>
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < Math.floor(product.rating)
                                        ? "fill-orange-400 text-orange-400"
                                        : "fill-muted text-muted"
                                    }`}
                            />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
                    </div>

                    {/* Product Name */}
                    <h3
                        className={`font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors ${variant === "compact" ? "text-sm" : "text-base"
                            }`}
                    >
                        {product.name}
                    </h3>

                    {/* Category */}
                    <p className="text-xs text-muted-foreground capitalize mt-1 mb-3">{product.category}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                        {product.offerPrice ? (
                            <>
                                <span className="text-xl font-bold text-primary">
                                    ₹{product.offerPrice.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                    ₹{product.price.toLocaleString()}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-foreground">
                                ₹{product.price.toLocaleString()}
                            </span>
                        )}
                    </div>
                </CardContent>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
        </Link>
    );
};

export default ProductCard;
