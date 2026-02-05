import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/data/userMockData";

const FeaturedProducts = () => {
    const featuredProducts = getFeaturedProducts();

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
                    {featuredProducts.slice(0, 12).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
