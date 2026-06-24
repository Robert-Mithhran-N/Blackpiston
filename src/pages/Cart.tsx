import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Package,
  ShieldCheck,
  Truck,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { verifyStock } from "@/lib/api";
import { toast } from "sonner";

const Cart = () => {
  const { cartItems, cartCount, cartTotal, cartShippingTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const hasStockError = cartItems.some(item => {
    const variant = item.variantId && item.product.variants
      ? item.product.variants.find(v => v.id === item.variantId)
      : null;
    const stock = variant ? variant.stockQuantity : (item.product.stockQuantity ?? 0);
    const inStock = variant ? variant.stockQuantity > 0 : item.product.inStock;
    return !inStock || stock <= 0 || item.quantity > stock;
  });

  const handleCheckout = async () => {
    setIsVerifying(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.product.id,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const result = await verifyStock(items);

      if (!result.available) {
        const unavailable = result.items
          .filter(i => !i.available)
          .map(i => `${i.productName || 'Unknown'}: only ${i.currentStock} left (requested ${i.requested})`)
          .join('\n');
        toast.error('Some items are no longer available', {
          description: unavailable,
          duration: 6000,
        });
        return;
      }

      // Stock verified — proceed to checkout
      navigate("/checkout");
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify stock');
    } finally {
      setIsVerifying(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any gear yet. Browse our shop to find premium motorcycle gear.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                <Package className="mr-2 h-5 w-5" />
                Browse the Shop
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
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">{cartCount} item{cartCount !== 1 ? "s" : ""} in your cart</p>
          </div>
          <Button variant="ghost" className="text-destructive hover:text-destructive self-start sm:self-auto" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => {
              const variant = item.variantId && item.product.variants
                ? item.product.variants.find(v => v.id === item.variantId)
                : null;
              const unitPrice = variant?.price ?? item.product.offerPrice ?? item.product.price;
              const lineTotal = unitPrice * item.quantity;

              return (
                <Card key={`${item.product.id}-${item.variantId || index}`} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link to={`/product/${item.product.id}`} className="shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop";
                          }}
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.variantLabel}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          Delivery: {((variant?.deliveryCharge ?? item.product.deliveryCharge ?? 0) > 0) ? (
                            <span>₹{variant?.deliveryCharge ?? item.product.deliveryCharge ?? 0}</span>
                          ) : (
                            <span className="text-green-500 font-medium">FREE</span>
                          )}
                        </p>

                        {(() => {
                          const stock = variant ? variant.stockQuantity : (item.product.stockQuantity ?? 0);
                          const inStock = variant ? variant.stockQuantity > 0 : item.product.inStock;
                          const isLowStock = inStock && stock > 0 && stock <= 5;
                          const isOutOfStock = !inStock || stock <= 0;
                          const isInsufficient = inStock && stock > 0 && item.quantity > stock;

                          return (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {isOutOfStock && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                                  Out of Stock
                                </span>
                              )}
                              {isInsufficient && !isOutOfStock && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                                  Only {stock} available (Requested {item.quantity})
                                </span>
                              )}
                              {isLowStock && !isInsufficient && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                                  Low Stock (Only {stock} left)
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <p className="text-sm font-bold text-primary mt-2">
                          ₹{unitPrice.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">₹{lineTotal.toLocaleString()}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromCart(item.product.id, item.variantId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Link to="/shop">
              <Button variant="ghost" className="mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                    <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={cartShippingTotal > 0 ? "font-medium" : "text-green-500 font-medium"}>
                      {cartShippingTotal > 0 ? `₹${cartShippingTotal.toLocaleString()}` : "FREE"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{(cartTotal + cartShippingTotal).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 h-12 text-lg"
                  onClick={handleCheckout}
                  disabled={isVerifying || hasStockError}
                >
                  {isVerifying ? 'Verifying Stock...' : 'Proceed to Checkout'}
                </Button>

                {hasStockError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-500 flex items-start gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-400">Checkout Blocked</p>
                      <p className="text-muted-foreground mt-0.5">Please update or remove items with insufficient stock to proceed.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    Fast Delivery
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
