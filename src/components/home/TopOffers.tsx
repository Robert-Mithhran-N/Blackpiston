import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Flame, Percent } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { fetchTopOffers } from "@/lib/api";
import { Product } from "@/types/user";

// Map top offer API response to Product type for ProductCard
function mapOfferToProduct(offer: any): Product {
    const p = offer.product || offer;
    return {
        id: p.id,
        name: p.name,
        category: p.categorySlug || "accessories",
        price: offer.originalPrice || p.price,
        offerPrice: offer.offerPrice || p.compareAtPrice || undefined,
        image: p.images?.[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        rating: p.averageRating || 0,
        description: p.description || "",
        inStock: p.isActive !== false,
        featured: p.isFeatured || false,
        isTopOffer: true,
    };
}

const TopOffers = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopOffers()
            .then((data) => setProducts((data.offers || []).map(mapOfferToProduct)))
            .catch((err) => console.error("Failed to load top offers:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-b from-background to-muted/30">
                <div className="container">
                    <div className="mb-10">
                        <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                            <Flame className="h-3 w-3 mr-1" />
                            Hot Deals
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Top <span className="text-primary">Offers</span>
                        </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {[1, 2, 3, 4].map((i) => (
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
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
            <div className="container">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                    <div>
                        <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                            <Flame className="h-3 w-3 mr-1" />
                            Hot Deals
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Top <span className="text-primary">Offers</span>
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-lg">
                            Limited time discounts on premium motorcycle gear. Grab them before they're gone!
                        </p>
                    </div>
                    <Link to="/shop?filter=offers">
                        <Button variant="outline" className="group">
                            View All Offers
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.slice(0, 8).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Promo Banner */}
                <div className="mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-orange-500/20 to-red-500/20 border border-primary/30 p-8 md:p-12">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%220.5%22%20opacity%3D%220.1%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                                <Percent className="h-6 w-6 text-primary" />
                                <span className="text-primary font-bold text-lg">EXTRA 10% OFF</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                Use Code: <span className="text-primary">BLACKPISTON10</span>
                            </h3>
                            <p className="text-muted-foreground">On all orders above ₹10,000. Limited time offer!</p>
                        </div>
                        <Link to="/shop">
                            <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                                Shop Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TopOffers;
