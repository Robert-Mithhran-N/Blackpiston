import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { verifyStock, placeOrder, applyCoupon } from "@/lib/api";
import { toast } from "sonner";
import { MapPin, CreditCard, CheckCircle2, Package, Loader2, Tag } from "lucide-react";

import { useUserAuth } from "@/context/UserAuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();
  const { user } = useUserAuth();
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD" | "UPI">("COD");
  
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Pre-fill default address
  useEffect(() => {
    if (user?.savedAddresses && user.savedAddresses.length > 0) {
      const defaultAddr = user.savedAddresses.find((a: any) => a.isDefault) || user.savedAddresses[0];
      setFormData(prev => ({
        ...prev,
        fullName: defaultAddr.fullName || user.name || "",
        phone: defaultAddr.phone || user.phone || "",
        addressLine: defaultAddr.addressLine1 || "",
        city: defaultAddr.city || "",
        state: defaultAddr.state || "",
        pincode: defaultAddr.pincode || ""
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartCount === 0) {
      toast.info("Your cart is empty. Please add items to checkout.");
      navigate("/shop");
    }
  }, [cartCount, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartCount === 0) return;
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine || !formData.city || !formData.state || !formData.pincode) {
      toast.error("Please fill in all address fields");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Verify Stock
      const stockItems = cartItems.map(item => ({
        productId: item.product.id,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const stockResult = await verifyStock(stockItems);

      if (!stockResult.available) {
        const unavailable = stockResult.items
          .filter(i => !i.available)
          .map(i => `${i.productName || 'Unknown'}: only ${i.currentStock} left (requested ${i.requested})`)
          .join('\n');
        
        toast.error('Some items are no longer available', {
          description: unavailable,
          duration: 6000,
        });
        setIsProcessing(false);
        return;
      }

      // 2. Place Order
      const orderProducts = cartItems.map(item => {
        const variant = item.variantId && item.product.variants
          ? item.product.variants.find(v => v.id === item.variantId)
          : null;
        const unitPrice = variant?.price ?? item.product.offerPrice ?? item.product.price;

        return {
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          unitPrice: unitPrice,
          variantSize: variant?.size,
          variantColor: variant?.color,
        };
      });

      const orderData = {
        products: orderProducts,
        shippingAddress: {
          name: formData.fullName,
          phone: formData.phone,
          street: formData.addressLine,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: "India"
        },
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      };

      const orderResult = await placeOrder(orderData);

      // 3. Handle Success
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/order-success", { state: { orderId: orderResult.order?._id || orderResult.id || "TRK-" + Math.floor(Math.random() * 1000000) } });
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartCount === 0) return null; // Prevent rendering anything while redirecting

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const response = await applyCoupon(couponCode, cartTotal);
      setAppliedCoupon({
        code: response.couponCode,
        discount: response.discountAmount,
        type: response.type,
      });
      toast.success(`Coupon applied! Saved ₹${response.discountAmount}`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingCost = (cartTotal - discountAmount) >= 5000 ? 0 : 199;
  const finalTotal = cartTotal - discountAmount + shippingCost;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Form & Payment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Form */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    <MapPin className="text-primary h-6 w-6" />
                    <h2>Shipping Address</h2>
                  </div>
                  {user?.savedAddresses && user.savedAddresses.length > 0 && (
                    <select 
                      className="text-sm border rounded p-1 bg-background"
                      onChange={(e) => {
                        const addr = user.savedAddresses.find((a: any) => a.id === e.target.value);
                        if (addr) {
                          setFormData(prev => ({
                            ...prev,
                            fullName: addr.fullName,
                            phone: addr.phone,
                            addressLine: addr.addressLine1,
                            city: addr.city,
                            state: addr.state,
                            pincode: addr.pincode
                          }));
                        }
                      }}
                    >
                      <option value="">-- Select Saved Address --</option>
                      {user.savedAddresses.map((addr: any) => (
                        <option key={addr.id} value={addr.id}>{addr.label} - {addr.addressLine1}, {addr.city}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" required />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="addressLine">Address Line</Label>
                    <Input id="addressLine" name="addressLine" value={formData.addressLine} onChange={handleInputChange} placeholder="123 Street Name, Apartment/Suite" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" required />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" required />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="400001" required />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method UI */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
                  <CreditCard className="text-primary h-6 w-6" />
                  <h2>Payment Method</h2>
                </div>
                
                <div className="space-y-3">
                  {/* COD */}
                  <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-foreground">Cash on Delivery (COD)</p>
                      <p className="text-sm text-muted-foreground">Pay with cash when your order is delivered.</p>
                    </div>
                  </label>
                  
                  {/* CARD (Disabled Placeholder) */}
                  <label className="flex items-start gap-3 p-4 border border-border rounded-lg opacity-50 cursor-not-allowed bg-muted/20">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="CARD" 
                      disabled
                      className="mt-1"
                    />
                    <div className="w-full">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-foreground">Credit / Debit Card</p>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-semibold">Coming Soon</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Online payment integration is currently under development.</p>
                    </div>
                  </label>

                  {/* UPI (Disabled Placeholder) */}
                  <label className="flex items-start gap-3 p-4 border border-border rounded-lg opacity-50 cursor-not-allowed bg-muted/20">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="UPI" 
                      disabled
                      className="mt-1"
                    />
                    <div className="w-full">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-foreground">UPI (GPay, PhonePe, Paytm)</p>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-semibold">Coming Soon</span>
                      </div>
                      <p className="text-sm text-muted-foreground">UPI payments will be available shortly.</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Package className="h-5 w-5" />
                  <h2>Order Summary</h2>
                </div>

                {/* Apply Coupon Section */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 font-medium mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>Have a promo code?</span>
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-700">{appliedCoupon.code}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-xs hover:bg-transparent text-muted-foreground hover:text-red-500" onClick={removeCoupon}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="uppercase"
                        disabled={isApplyingCoupon}
                      />
                      <Button 
                        onClick={handleApplyCoupon} 
                        disabled={!couponCode.trim() || isApplyingCoupon}
                        variant="secondary"
                      >
                        {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 border-b border-border pb-4 mt-2">
                  {cartItems.map((item, index) => {
                    const variant = item.variantId && item.product.variants
                      ? item.product.variants.find(v => v.id === item.variantId)
                      : null;
                    const unitPrice = variant?.price ?? item.product.offerPrice ?? item.product.price;

                    return (
                      <div key={`${item.product.id}-${item.variantId || index}`} className="flex gap-3">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-16 h-16 rounded-md object-cover border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                          <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            <span className="font-semibold text-foreground">₹{(unitPrice * item.quantity).toLocaleString()}</span>
                          </div>
                          {item.variantLabel && (
                            <p className="text-xs text-muted-foreground truncate">{item.variantLabel}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-medium">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? <span className="text-green-500">FREE</span> : `₹${shippingCost}`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  form="checkout-form"
                  size="lg" 
                  className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 h-12 text-lg mt-4"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Place Order (₹{finalTotal.toLocaleString()})
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  By placing your order, you agree to our Terms of Service & Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
