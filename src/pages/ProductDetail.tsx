import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    ShoppingCart,
    Zap,
    Star,
    Shield,
    Truck,
    RotateCcw,
    CheckCircle,
    Heart,
    Share2,
    Minus,
    Plus,
    Package,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { fetchProductById, fetchProductsByCategory } from "@/lib/api";
import { Product, ProductVariant } from "@/types/user";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useStockUpdates, StockUpdatePayload } from "@/hooks/useStockUpdates";

// Product specifications — uses real data from the API, falls back to defaults
const getProductSpecs = (product: Product) => {
    // If the product has specifications stored in the database, use them
    if (product.specifications && product.specifications.length > 0) {
        return product.specifications;
    }

    // Fallback: generic category-based defaults (shown only when no specs in DB)
    const defaultSpecsMap: Record<string, { label: string; value: string }[]> = {
        helmets: [
            { label: "Shell Material", value: "Composite" },
            { label: "Certification", value: "ISI / ECE" },
            { label: "Visor", value: "Clear Visor" },
            { label: "Interior", value: "Removable, Washable" },
        ],
        jackets: [
            { label: "Material", value: "Textile / Leather" },
            { label: "Protection", value: "CE Certified" },
            { label: "Lining", value: "Mesh Liner" },
        ],
        boots: [
            { label: "Upper Material", value: "Synthetic / Leather" },
            { label: "Sole", value: "Rubber Compound" },
            { label: "Protection", value: "Ankle Protection" },
        ],
        accessories: [
            { label: "Material", value: "Premium Grade" },
            { label: "Warranty", value: "Manufacturer Warranty" },
        ],
    };
    return defaultSpecsMap[product.category] || defaultSpecsMap.accessories;
};

const ProductDetail = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [rawVariants, setRawVariants] = useState<ProductVariant[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    // Variant selection state
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    // Fetch product from API
    useEffect(() => {
        if (!productId) return;
        setIsLoading(true);
        setSelectedImage(0);
        setQuantity(1);
        setSelectedSize(null);
        setSelectedColor(null);
        setSelectedModel(null);

        fetchProductById(productId)
            .then((data) => {
                const p = data.product || data;
                const primaryImg = p.images?.find((i: any) => i.isPrimary);
                const firstImg = p.images?.[0];
                const mainImageUrl = primaryImg?.url || firstImg?.url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop";
                const imageUrls: string[] = (p.images || []).map((i: any) => i.url || i).filter(Boolean);

                // Parse variants from raw API data
                const variants: ProductVariant[] = (p.variants || []).map((v: any) => ({
                    id: v.id,
                    size: v.size || undefined,
                    color: v.color || undefined,
                    model: v.model || undefined,
                    sku: v.sku || "",
                    stockQuantity: v.stockQuantity ?? 0,
                    price: v.price ?? undefined,
                    priceModifier: v.priceModifier ?? 0,
                    images: v.images || [],
                }));
                setRawVariants(variants);

                const mapped: Product = {
                    id: p.id,
                    name: p.name,
                    category: p.categorySlug || p.category?.slug || "accessories",
                    price: p.price,
                    offerPrice: p.offerPrice || undefined,
                    image: mainImageUrl,
                    images: imageUrls.length > 0 ? imageUrls : [mainImageUrl],
                    rating: p.averageRating || p.rating || 0,
                    description: p.description || "",
                    inStock: p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0),
                    featured: p.isFeatured || false,
                    isTopOffer: false,
                    specifications: p.specifications || [],
                    variants: variants,
                    stockQuantity: p.stockQuantity,
                };
                setProduct(mapped);

                // Fetch related products
                if (mapped.category) {
                    fetchProductsByCategory(mapped.category)
                        .then((catData) => {
                            const related = (catData.products || [])
                                .filter((r: any) => r.id !== p.id)
                                .slice(0, 6)
                                .map((r: any): Product => {
                                    const rPrimary = r.images?.find((i: any) => i.isPrimary);
                                    const rFirst = r.images?.[0];
                                    const rImg = rPrimary?.url || rFirst?.url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";
                                    return {
                                        id: r.id,
                                        name: r.name,
                                        category: r.categorySlug || r.category?.slug || "accessories",
                                        price: r.price,
                                        offerPrice: r.offerPrice || undefined,
                                        image: rImg,
                                        rating: r.averageRating || r.rating || 0,
                                        description: r.description || "",
                                        inStock: r.inStock !== false && (r.stockQuantity === undefined || r.stockQuantity > 0),
                                        featured: r.isFeatured || false,
                                        isTopOffer: false,
                                    };
                                });
                            setRelatedProducts(related);
                        })
                        .catch(() => setRelatedProducts([]));
                }
            })
            .catch((err) => {
                console.error("Failed to load product:", err);
                setProduct(null);
            })
            .finally(() => setIsLoading(false));
    }, [productId]);

    // ── Real-time stock updates via Socket.IO ──
    const handleStockUpdate = useCallback((data: StockUpdatePayload) => {
        setProduct(prev => {
            if (!prev) return prev;
            const newInStock = data.inStock;
            return {
                ...prev,
                stockQuantity: data.newStock,
                inStock: newInStock,
            };
        });

        // Update variant stocks if provided
        if (data.variants) {
            setRawVariants(prev =>
                prev.map(v => {
                    const updated = data.variants?.find(uv => uv.id === v.id);
                    return updated ? { ...v, stockQuantity: updated.stockQuantity } : v;
                })
            );
        }

        // Show a toast so the user knows stock changed
        if (!data.inStock) {
            toast.error("This item is now out of stock");
        } else {
            toast.info(`Stock updated — ${data.newStock} available`);
        }

        // Cap quantity selector to new stock
        setQuantity(q => {
            const maxStock = data.newStock;
            if (maxStock <= 0) return 1;
            return q > maxStock ? maxStock : q;
        });
    }, []);

    useStockUpdates(productId, handleStockUpdate);

    // Extract unique variant options
    const uniqueSizes = useMemo(() => {
        const sizes = rawVariants.map(v => v.size).filter(Boolean) as string[];
        return [...new Set(sizes)];
    }, [rawVariants]);

    const uniqueColors = useMemo(() => {
        const colors = rawVariants.map(v => v.color).filter(Boolean) as string[];
        return [...new Set(colors)];
    }, [rawVariants]);

    const uniqueModels = useMemo(() => {
        const models = rawVariants.map(v => v.model).filter(Boolean) as string[];
        return [...new Set(models)];
    }, [rawVariants]);

    const hasVariants = rawVariants.length > 0;

    // Find currently selected variant
    const selectedVariant = useMemo(() => {
        if (!hasVariants) return null;
        return rawVariants.find(v => {
            const sizeMatch = !uniqueSizes.length || !selectedSize || v.size === selectedSize;
            const colorMatch = !uniqueColors.length || !selectedColor || v.color === selectedColor;
            const modelMatch = !uniqueModels.length || !selectedModel || v.model === selectedModel;
            return sizeMatch && colorMatch && modelMatch;
        }) || null;
    }, [rawVariants, selectedSize, selectedColor, selectedModel, uniqueSizes.length, uniqueColors.length, uniqueModels.length, hasVariants]);

    // Build images array — prefer variant images, fallback to product images
    const images = useMemo(() => {
        if (selectedVariant?.images && selectedVariant.images.length > 0) {
            return selectedVariant.images.map(img => img.url);
        }
        return product?.images && product.images.length > 0
            ? product.images
            : product?.image ? [product.image] : [];
    }, [selectedVariant, product]);

    // Effective price, stock, inStock
    const effectivePrice = selectedVariant?.price ?? product?.offerPrice ?? product?.price ?? 0;
    const originalPrice = product?.price ?? 0;
    const effectiveStock = selectedVariant ? selectedVariant.stockQuantity : (product?.stockQuantity ?? 0);
    const isInStock = hasVariants ? (selectedVariant ? selectedVariant.stockQuantity > 0 : true) : (product?.inStock ?? false);

    const discountPercent = effectivePrice < originalPrice
        ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
        : 0;

    // Build variant label for cart
    const variantLabel = useMemo(() => {
        if (!selectedVariant) return undefined;
        const parts: string[] = [];
        if (selectedVariant.size) parts.push(`Size ${selectedVariant.size}`);
        if (selectedVariant.color) parts.push(selectedVariant.color);
        if (selectedVariant.model) parts.push(selectedVariant.model);
        return parts.length > 0 ? parts.join(" / ") : undefined;
    }, [selectedVariant]);

    const handleAddToCart = () => {
        if (!product) return;
        if (hasVariants && !selectedVariant) {
            toast.error("Please select a variant");
            return;
        }
        addToCart(
            { ...product, price: effectivePrice },
            quantity,
            selectedVariant?.id,
            variantLabel
        );
        toast.success(`${product.name} added to cart!`, {
            description: variantLabel ? `${variantLabel} · Qty: ${quantity}` : `Quantity: ${quantity}`,
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate("/cart");
    };

    if (!product && !isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container py-16">
                    <div className="text-center">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
                        <p className="text-muted-foreground mb-6">
                            The product you're looking for doesn't exist or has been removed.
                        </p>
                        <Link to="/shop">
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Shop
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pb-16">
                {/* Breadcrumb */}
                <div className="bg-muted/30 border-b border-border">
                    <div className="container py-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                                Home
                            </Link>
                            <span className="text-muted-foreground">/</span>
                            <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                                Shop
                            </Link>
                            <span className="text-muted-foreground">/</span>
                            {product && (
                                <>
                                    <Link
                                        to={`/shop/${product.category}`}
                                        className="text-muted-foreground hover:text-primary transition-colors capitalize"
                                    >
                                        {product.category}
                                    </Link>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-foreground font-medium truncate max-w-[200px]">
                                        {product.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container py-8">
                    {isLoading ? (
                        /* Loading Skeleton */
                        <div className="grid gap-8 lg:grid-cols-2">
                            <div className="space-y-4">
                                <Skeleton className="aspect-square rounded-2xl" />
                                <div className="grid grid-cols-4 gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <Skeleton key={i} className="aspect-square rounded-lg" />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-10 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-12 w-1/3" />
                                <Skeleton className="h-32" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                    ) : product ? (
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Product Images */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50 border-2 border-border group max-w-md mx-auto">
                                    <style>{`
                                        @keyframes productFadeIn {
                                            from {
                                                opacity: 0.2;
                                                transform: scale(0.96);
                                                filter: blur(4px);
                                            }
                                            to {
                                                opacity: 1;
                                                transform: scale(1);
                                                filter: blur(0);
                                            }
                                        }
                                        .animate-product-fade-in {
                                            animation: productFadeIn 0.35s ease-in-out forwards;
                                        }
                                    `}</style>

                                    {discountPercent > 0 && (
                                        <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-bold text-lg px-4 py-1">
                                            {discountPercent}% OFF
                                        </Badge>
                                    )}
                                    <img
                                        key={selectedImage}
                                        src={images[selectedImage] || images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover animate-product-fade-in group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop";
                                        }}
                                    />

                                    {/* Navigation Buttons */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                                aria-label="Previous product image"
                                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 hover:scale-110"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                                aria-label="Next product image"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 hover:scale-110"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                        </>
                                    )}

                                    {/* Image Indicator Dots */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {images.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedImage(i)}
                                                    aria-label={`View image ${i + 1}`}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedImage === i
                                                        ? "bg-white w-4"
                                                        : "bg-white/50 hover:bg-white/80"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                                        {images.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedImage(i)}
                                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300
                                                    ${selectedImage === i ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${product.name} ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop";
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                {/* Category & Rating */}
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="capitalize">
                                        {product.category}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < Math.floor(product.rating)
                                                    ? "fill-orange-400 text-orange-400"
                                                    : "fill-muted text-muted"
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({product.rating})
                                        </span>
                                    </div>
                                </div>

                                {/* Product Name */}
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>

                                {/* Price */}
                                <div className="flex items-baseline gap-4">
                                    {effectivePrice < originalPrice ? (
                                        <>
                                            <span className="text-4xl font-bold text-primary">
                                                ₹{effectivePrice.toLocaleString()}
                                            </span>
                                            <span className="text-2xl text-muted-foreground line-through">
                                                ₹{originalPrice.toLocaleString()}
                                            </span>
                                            <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                                                Save ₹{(originalPrice - effectivePrice).toLocaleString()}
                                            </Badge>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-bold">₹{effectivePrice.toLocaleString()}</span>
                                    )}
                                </div>

                                {/* ===== VARIANT SELECTORS ===== */}
                                {hasVariants && (
                                    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Variant</h3>

                                        {/* Size Selector */}
                                        {uniqueSizes.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Size: {selectedSize && <span className="text-primary">{selectedSize}</span>}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {uniqueSizes.map(size => (
                                                        <button
                                                            key={size}
                                                            onClick={() => { setSelectedSize(size === selectedSize ? null : size); setSelectedImage(0); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${selectedSize === size
                                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                                                : "bg-background border-border hover:border-primary/60 hover:text-primary"
                                                                }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Color Selector */}
                                        {uniqueColors.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Color: {selectedColor && <span className="text-primary">{selectedColor}</span>}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {uniqueColors.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => { setSelectedColor(color === selectedColor ? null : color); setSelectedImage(0); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${selectedColor === color
                                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                                                : "bg-background border-border hover:border-primary/60 hover:text-primary"
                                                                }`}
                                                        >
                                                            {color}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Model Selector */}
                                        {uniqueModels.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Model: {selectedModel && <span className="text-primary">{selectedModel}</span>}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {uniqueModels.map(model => (
                                                        <button
                                                            key={model}
                                                            onClick={() => { setSelectedModel(model === selectedModel ? null : model); setSelectedImage(0); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${selectedModel === model
                                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                                                : "bg-background border-border hover:border-primary/60 hover:text-primary"
                                                                }`}
                                                        >
                                                            {model}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected variant info */}
                                        {selectedVariant && (
                                            <div className="text-xs text-muted-foreground mt-2">
                                                SKU: {selectedVariant.sku} · Stock: {selectedVariant.stockQuantity}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stock Status */}
                                <div className="flex items-center gap-2">
                                    {isInStock ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-green-500 font-medium">
                                                In Stock {effectiveStock > 0 && effectiveStock <= 5 && `(Only ${effectiveStock} left)`}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                            <span className="text-red-500 font-medium">Out of Stock</span>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="prose prose-sm prose-invert max-w-none">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {product.description ||
                                            "Premium quality product designed for maximum performance and comfort. Built with the finest materials and crafted to perfection."}
                                    </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">Quantity:</span>
                                    <div className="flex items-center border border-border rounded-lg">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-r-none"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-12 text-center font-medium">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-l-none"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        size="lg"
                                        className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 text-lg h-14"
                                        onClick={handleAddToCart}
                                        disabled={!isInStock}
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {!isInStock ? "Out of Stock" : "Add to Cart"}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="flex-1 text-lg h-14"
                                        onClick={handleBuyNow}
                                        disabled={!isInStock}
                                    >
                                        <Zap className="mr-2 h-5 w-5" />
                                        Buy Now
                                    </Button>
                                </div>

                                {/* Wishlist & Share */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className={`flex-1 ${isWishlisted ? "text-red-500 border-red-500/50" : ""}`}
                                        onClick={() => {
                                            setIsWishlisted(!isWishlisted);
                                            toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
                                        }}
                                    >
                                        <Heart className={`mr-2 h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
                                        {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                                    </Button>
                                    <Button variant="outline" onClick={() => toast.success("Link copied!")}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <Truck className="h-6 w-6 text-primary" />
                                        <span className="text-xs font-medium">Free Shipping</span>
                                        <span className="text-xs text-muted-foreground">Orders ₹5000+</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <Shield className="h-6 w-6 text-green-500" />
                                        <span className="text-xs font-medium">Warranty</span>
                                        <span className="text-xs text-muted-foreground">1 Year</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <RotateCcw className="h-6 w-6 text-blue-500" />
                                        <span className="text-xs font-medium">Easy Returns</span>
                                        <span className="text-xs text-muted-foreground">30 Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Specifications */}
                    {product && (
                        <Card className="mt-12">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {getProductSpecs(product).map((spec, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border"
                                        >
                                            <span className="text-muted-foreground">{spec.label}</span>
                                            <span className="font-medium">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <section className="mt-16">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">Related Products</h2>
                                <Link to={`/shop/${product?.category}`}>
                                    <Button variant="outline">View All</Button>
                                </Link>
                            </div>
                            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                                {relatedProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetail;
