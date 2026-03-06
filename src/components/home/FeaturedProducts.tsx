import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { fetchFeaturedProducts } from "@/lib/api";
import { Product } from "@/types/user";

// Map API product to the Product type expected by ProductCard
function mapProduct(p: any): Product {
    // Images come from DB as { url, alt, isPrimary } objects
    const primaryImg = p.images?.find((i: any) => i.isPrimary);
    const firstImg = p.images?.[0];
    const imageUrl = primaryImg?.url || firstImg?.url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";

    return {
        id: p.id,
        name: p.name,
        category: p.categorySlug || p.category?.slug || "accessories",
        price: p.price,
        offerPrice: p.offerPrice || undefined,
        image: imageUrl,
        rating: p.averageRating || p.rating || 0,
        description: p.description || "",
        inStock: p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0),
        featured: p.isFeatured || false,
        isTopOffer: false,
    };
}

const FeaturedProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts()
            .then((data) => setProducts((data.products || []).map(mapProduct)))
            .catch((err) => console.error("Failed to load featured products:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-background">
                <div className="container">
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="h-5 w-5 fill-primary text-primary" />
                            <span className="text-primary font-medium text-sm uppercase tracking-wider">
                                Featured Collection
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Featured <span className="text-primary">Products</span>
                        </h2>
                    </div>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-background">
            <div className="container">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="h-5 w-5 fill-primary text-primary" />
                            <span className="text-primary font-medium text-sm uppercase tracking-wider">
                                Featured Collection
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Featured <span className="text-primary">Products</span>
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-lg">
                            Handpicked premium gear trusted by professional riders worldwide
                        </p>
                    </div>
                    <Link to="/shop">
                        <Button variant="outline" className="group">
                            View All Products
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {products.slice(0, 12).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
