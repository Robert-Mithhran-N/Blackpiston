import { useState, useEffect } from "react";
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
} from "lucide-react";
import { getProductById, getProductsByCategory, products } from "@/data/userMockData";
import { Product } from "@/types/user";
import { toast } from "sonner";

// Mock specifications data
const getProductSpecs = (product: Product) => {
    const specsMap: Record<string, { label: string; value: string }[]> = {
        helmets: [
            { label: "Shell Material", value: "Carbon Fiber Composite" },
            { label: "Weight", value: "1,350g ± 50g" },
            { label: "Certification", value: "ECE 22.06, DOT, SNELL" },
            { label: "Visor", value: "Anti-fog, Pinlock Ready" },
            { label: "Ventilation", value: "8 intake, 6 exhaust vents" },
            { label: "Interior", value: "Removable, Washable" },
        ],
        jackets: [
            { label: "Material", value: "Premium Cowhide Leather" },
            { label: "Protection", value: "CE Level 2 (Shoulders, Elbows, Back)" },
            { label: "Lining", value: "Mesh + Thermal Liner" },
            { label: "Closure", value: "YKK Zippers" },
            { label: "Pockets", value: "4 External, 2 Internal" },
            { label: "Airbag Ready", value: "Yes" },
        ],
        boots: [
            { label: "Upper Material", value: "Microfiber + Leather" },
            { label: "Sole", value: "Vibram Racing Compound" },
            { label: "Protection", value: "Toe Slider, Heel Counter" },
            { label: "Closure", value: "Velcro + Buckle System" },
            { label: "Height", value: "320mm" },
            { label: "Weight", value: "1.2kg per boot" },
        ],
        accessories: [
            { label: "Material", value: "Premium Grade" },
            { label: "Compatibility", value: "Universal" },
            { label: "Warranty", value: "1 Year Manufacturer" },
            { label: "Origin", value: "Imported" },
        ],
    };
    return specsMap[product.category] || specsMap.accessories;
};

const ProductDetail = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const product = getProductById(productId || "");
    const relatedProducts = product
        ? getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4)
        : [];

    // Simulate loading
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [productId]);

    // Mock image gallery (same image repeated for demo)
    const images = product
        ? [product.image, product.image, product.image, product.image]
        : [];

    const discountPercent = product?.offerPrice
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        toast.success(`${product?.name} added to cart!`, {
            description: `Quantity: ${quantity}`,
        });
    };

    const handleBuyNow = () => {
        toast.success("Proceeding to checkout...");
        // Navigate to checkout (placeholder)
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
                                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50 border-2 border-border group">
                                    {discountPercent > 0 && (
                                        <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-bold text-lg px-4 py-1">
                                            {discountPercent}% OFF
                                        </Badge>
                                    )}
                                    <img
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop";
                                        }}
                                    />
                                </div>

                                {/* Thumbnail Gallery */}
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300
                        ${selectedImage === i ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}
                      `}
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
                                            ({product.rating}) · 128 reviews
                                        </span>
                                    </div>
                                </div>

                                {/* Product Name */}
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>

                                {/* Price */}
                                <div className="flex items-baseline gap-4">
                                    {product.offerPrice ? (
                                        <>
                                            <span className="text-4xl font-bold text-primary">
                                                ₹{product.offerPrice.toLocaleString()}
                                            </span>
                                            <span className="text-2xl text-muted-foreground line-through">
                                                ₹{product.price.toLocaleString()}
                                            </span>
                                            <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                                                Save ₹{(product.price - product.offerPrice).toLocaleString()}
                                            </Badge>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-bold">₹{product.price.toLocaleString()}</span>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center gap-2">
                                    {product.inStock ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-green-500 font-medium">In Stock</span>
                                        </>
                                    ) : (
                                        <>
                                            <Package className="h-5 w-5 text-red-500" />
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
                                        disabled={!product.inStock}
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="flex-1 text-lg h-14"
                                        onClick={handleBuyNow}
                                        disabled={!product.inStock}
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
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
