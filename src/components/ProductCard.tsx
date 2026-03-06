import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, ArrowRight } from "lucide-react";
import { Product } from "@/types/user";

interface ProductCardProps {
    product: Product;
    variant?: "default" | "compact" | "featured";
    onAddToCart?: (product: Product) => void;
}

const ProductCard = ({ product, variant = "default", onAddToCart }: ProductCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const discountPercent = product.offerPrice
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart?.(product);
    };

    return (
        <Link
            to={`/product/${product.id}`}
            className="block group w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card
                className={`relative overflow-hidden transition-all duration-500 ease-out border-2 bg-card
          ${isHovered
                        ? "border-primary/60 shadow-xl shadow-primary/15 scale-[1.02]"
                        : "border-border shadow-md scale-100"
                    }
          ${variant === "featured" ? "h-full" : ""}
        `}
            >
                {/* Discount Badge */}
                {discountPercent > 0 && (
                    <div className={`absolute top-2 left-2 z-20 transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"}`}>
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-semibold shadow-lg text-xs px-2 py-0.5">
                            {discountPercent}% OFF
                        </Badge>
                    </div>
                )}

                {/* Out of Stock Badge */}
                {!product.inStock && (
                    <div className="absolute top-2 right-2 z-20">
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">Out of Stock</Badge>
                    </div>
                )}

                {/* Product Image Container */}
                <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-muted to-muted/50">
                    {/* Product Image */}
                    <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-700 ease-out
              ${isHovered ? "scale-110 brightness-90" : "scale-100 brightness-100"}
            `}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";
                        }}
                    />

                    {/* Dark Overlay on Hover */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500
              ${isHovered ? "opacity-100" : "opacity-0"}
            `}
                    />

                    {/* Hover Content Overlay */}
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-end p-4 transition-all duration-500
              ${isHovered ? "opacity-100" : "opacity-0"}
            `}
                    >
                        {/* Product Description on Hover */}
                        {product.description && (
                            <p
                                className={`text-white/90 text-sm text-center mb-4 line-clamp-2 transition-all duration-500 delay-100
                  ${isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                `}
                            >
                                {product.description}
                            </p>
                        )}

                        {/* CTA Buttons on Hover */}
                        <div
                            className={`flex gap-2 transition-all duration-500 delay-150
                ${isHovered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
              `}
                        >
                            <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View Product
                            </Button>
                            {product.inStock && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleAddToCart}
                                    className="shadow-lg"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile: Always visible CTA (no hover on touch devices) */}
                    <div className="md:hidden absolute bottom-3 right-3">
                        <Button
                            size="sm"
                            className="bg-primary/90 backdrop-blur-sm shadow-lg"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <CardContent className={`p-2.5 transition-all duration-300 ${variant === "compact" ? "p-2" : ""}`}>
                    {/* Rating */}
                    <div className={`flex items-center gap-0.5 mb-1 transition-all duration-300 ${isHovered ? "translate-x-1" : ""}`}>
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3 w-3 transition-all duration-300 ${i < Math.floor(product.rating)
                                    ? "fill-orange-400 text-orange-400"
                                    : "fill-muted text-muted"
                                    } ${isHovered && i < Math.floor(product.rating) ? "scale-110" : ""}`}
                            />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1">({product.rating})</span>
                    </div>

                    {/* Product Name */}
                    <h3
                        className={`font-semibold text-foreground line-clamp-1 transition-all duration-300 text-sm
              ${variant === "compact" ? "text-xs" : ""}
              ${isHovered ? "text-primary" : ""}
            `}
                    >
                        {product.name}
                    </h3>

                    {/* Category */}
                    <p className={`text-[10px] text-muted-foreground capitalize mt-0.5 mb-1.5 transition-all duration-300
            ${isHovered ? "text-primary/70" : ""}
          `}>
                        {product.category}
                    </p>

                    {/* Price */}
                    <div className={`flex items-baseline gap-1.5 transition-all duration-300 ${isHovered ? "translate-x-1" : ""}`}>
                        {(() => {
                            // Compute min variant price if variants exist
                            const variantPrices = (product.variants || [])
                                .map(v => v.price)
                                .filter((p): p is number => p != null && p > 0);
                            const hasVariantPricing = variantPrices.length > 0;
                            const minVariantPrice = hasVariantPricing ? Math.min(...variantPrices) : null;
                            const displayPrice = product.offerPrice || product.price;

                            if (hasVariantPricing && minVariantPrice && minVariantPrice !== displayPrice) {
                                return (
                                    <>
                                        <span className="text-[10px] text-muted-foreground">From</span>
                                        <span className={`text-base font-bold transition-all duration-300 ${isHovered ? "text-primary scale-105" : "text-primary"}`}>
                                            ₹{Math.min(minVariantPrice, displayPrice).toLocaleString()}
                                        </span>
                                    </>
                                );
                            }

                            if (product.offerPrice) {
                                return (
                                    <>
                                        <span className={`text-base font-bold transition-all duration-300 ${isHovered ? "text-primary scale-105" : "text-primary"}`}>
                                            ₹{product.offerPrice.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground line-through">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                    </>
                                );
                            }

                            return (
                                <span className={`text-base font-bold transition-all duration-300 ${isHovered ? "scale-105" : ""}`}>
                                    ₹{product.price.toLocaleString()}
                                </span>
                            );
                        })()}
                    </div>
                </CardContent>

                {/* Bottom accent line */}
                <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-red-500 transition-all duration-500
            ${isHovered ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}
          `}
                />

                {/* Corner glow effect on hover */}
                <div
                    className={`absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl transition-opacity duration-500
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}
                />
            </Card>
        </Link>
    );
};

export default ProductCard;
