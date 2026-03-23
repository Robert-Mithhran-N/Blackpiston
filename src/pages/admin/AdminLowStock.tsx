import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    ArrowLeft,
    AlertTriangle,
} from "lucide-react";
import { fetchLowStockProducts } from "@/lib/api";

// ============================================================
// Product Card Component
// ============================================================
interface ProductCardProps {
    name: string;
    category: string;
    stock: number;
    loading?: boolean;
}

const ProductCard = ({ name, category, stock, loading }: ProductCardProps) => {
    const isCritical = stock <= 2;

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 ${isCritical ? 'border-red-500/50' : 'border-yellow-500/50'
            }`}>
            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                ) : (
                    <>
                        {/* Icon */}
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${isCritical ? 'bg-red-500/10' : 'bg-yellow-500/10'
                            }`}>
                            <Package className={`h-6 w-6 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`} />
                        </div>

                        {/* Product Name */}
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{name}</h3>

                        {/* Category */}
                        <p className="text-sm text-muted-foreground mb-4">{category}</p>

                        {/* Stock Badge */}
                        <Badge className={`text-sm ${isCritical
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                            }`}>
                            {stock} {stock === 1 ? 'unit' : 'units'} left
                        </Badge>

                        {/* Warning indicator for critical stock */}
                        {isCritical && (
                            <div className="absolute top-4 right-4">
                                <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                            </div>
                        )}

                        {/* Bottom accent line */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${isCritical ? 'bg-red-500' : 'bg-yellow-500'
                            } opacity-50`} />
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// ============================================================
// Low Stock Products Page
// ============================================================
const AdminLowStock = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<{ id: string; name: string; category: string; currentStock: number }[]>([]);

    // Fetch low stock products from API
    useEffect(() => {
        setIsLoading(true);
        fetchLowStockProducts()
            .then((data) => {
                const mapped = (data?.lowStockProducts || []).map((item: any) => ({
                    id: item.product?.id || Math.random().toString(),
                    name: item.product?.name || 'Unknown',
                    category: item.product?.categorySlug || 'Uncategorized',
                    currentStock: item.availableStock || 0,
                }));
                setProducts(mapped);
            })
            .catch((err) => console.error("Failed to load low stock products:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Link to="/admin">
                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Low Stock Products</h1>
                        <p className="text-muted-foreground mt-1">
                            Products with stock less than 5 units
                        </p>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex items-center gap-2 p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-medium">
                        {products.length} products need restocking
                    </span>
                </div>

                {/* Product Cards Grid */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array(6).fill(0).map((_, i) => (
                            <ProductCard key={i} name="" category="" stock={0} loading={true} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-lg">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">All Products In Stock</h3>
                        <p className="text-muted-foreground">
                            No products with low stock at the moment
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                category={product.category}
                                stock={product.currentStock}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminLowStock;
