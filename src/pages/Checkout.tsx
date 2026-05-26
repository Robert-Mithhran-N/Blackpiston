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
import { useRazorpay, PaymentState } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import {
    MapPin,
    CreditCard,
    CheckCircle2,
    Package,
    Loader2,
    Tag,
    Shield,
    Smartphone,
    RefreshCw,
    XCircle,
    ArrowLeft,
} from "lucide-react";

import { useUserAuth } from "@/context/UserAuthContext";

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, cartCount, cartTotal, cartShippingTotal, clearCart } = useCart();
    const { user } = useUserAuth();
    const {
        paymentState,
        error: paymentError,
        orderId: paymentOrderId,
        orderNumber: paymentOrderNumber,
        initiatePayment,
        retryFailedPayment,
        reset: resetPayment,
    } = useRazorpay();

    // State
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discount: number;
        type: string;
    } | null>(null);

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
            const defaultAddr =
                user.savedAddresses.find((a: any) => a.isDefault) ||
                user.savedAddresses[0];
            setFormData((prev) => ({
                ...prev,
                fullName: defaultAddr.fullName || user.name || "",
                phone: defaultAddr.phone || user.phone || "",
                addressLine: defaultAddr.addressLine1 || "",
                city: defaultAddr.city || "",
                state: defaultAddr.state || "",
                pincode: defaultAddr.pincode || "",
            }));
        }
    }, [user]);

    // Redirect if cart is empty
    useEffect(() => {
        if (cartCount === 0 && paymentState === "idle") {
            toast.info("Your cart is empty. Please add items to checkout.");
            navigate("/shop");
        }
    }, [cartCount, navigate, paymentState]);

    // Handle payment success
    useEffect(() => {
        if (paymentState === "success" && paymentOrderId) {
            clearCart();
            toast.success("Payment successful! Order confirmed.");
            navigate("/order-success", {
                state: {
                    orderId: paymentOrderId,
                    orderNumber: paymentOrderNumber,
                    paymentMethod: "ONLINE",
                },
            });
        }
    }, [paymentState, paymentOrderId, paymentOrderNumber, clearCart, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (
            !formData.fullName ||
            !formData.email ||
            !formData.phone ||
            !formData.addressLine ||
            !formData.city ||
            !formData.state ||
            !formData.pincode
        ) {
            toast.error("Please fill in all address fields");
            return false;
        }
        return true;
    };

    const shippingAddress = {
        name: formData.fullName,
        phone: formData.phone,
        street: formData.addressLine,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: "India",
    };

    // ────────────────────────────────────────────────
    // COD Order Flow (existing behavior preserved)
    // ────────────────────────────────────────────────
    const handleCODOrder = async () => {
        if (cartCount === 0) return;
        if (!validateForm()) return;

        setIsProcessing(true);

        try {
            // 1. Verify Stock
            const stockItems = cartItems.map((item) => ({
                productId: item.product.id,
                variantId: item.variantId,
                quantity: item.quantity,
            }));

            const stockResult = await verifyStock(stockItems);

            if (!stockResult.available) {
                const unavailable = stockResult.items
                    .filter((i: any) => !i.available)
                    .map(
                        (i: any) =>
                            `${i.productName || "Unknown"}: only ${i.currentStock} left (requested ${i.requested})`
                    )
                    .join("\n");

                toast.error("Some items are no longer available", {
                    description: unavailable,
                    duration: 6000,
                });
                setIsProcessing(false);
                return;
            }

            // 2. Place Order (COD)
            const orderProducts = cartItems.map((item) => {
                const variant =
                    item.variantId && item.product.variants
                        ? item.product.variants.find((v) => v.id === item.variantId)
                        : null;
                const unitPrice =
                    variant?.price ?? item.product.offerPrice ?? item.product.price;

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
                shippingAddress,
                paymentMethod: "COD",
                couponCode: appliedCoupon?.code || undefined,
            };

            const orderResult = await placeOrder(orderData);

            // 3. Handle Success
            clearCart();
            toast.success("Order placed successfully!");
            navigate("/order-success", {
                state: {
                    orderId:
                        orderResult.order?._id ||
                        orderResult.order?.id ||
                        orderResult.id ||
                        "TRK-" + Math.floor(Math.random() * 1000000),
                    orderNumber: orderResult.order?.orderNumber,
                    paymentMethod: "COD",
                },
            });
        } catch (err: any) {
            toast.error(err.message || "Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ────────────────────────────────────────────────
    // Razorpay Online Payment Flow
    // ────────────────────────────────────────────────
    const handleOnlinePayment = async () => {
        if (cartCount === 0) return;
        if (!validateForm()) return;

        const items = cartItems.map((item) => ({
            productId: item.product.id,
            variantId: item.variantId,
            quantity: item.quantity,
        }));

        await initiatePayment({
            items,
            shippingAddress,
            couponCode: appliedCoupon?.code,
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
        });
    };

    // ────────────────────────────────────────────────
    // Form Submit Handler
    // ────────────────────────────────────────────────
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMethod === "COD") {
            await handleCODOrder();
        } else {
            await handleOnlinePayment();
        }
    };

    // ────────────────────────────────────────────────
    // Coupon handlers
    // ────────────────────────────────────────────────
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
            toast.error(err.message || "Invalid coupon code");
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
    const shippingCost = cartShippingTotal;
    const finalTotal = cartTotal - discountAmount + shippingCost;

    // Prevent rendering while redirecting
    if (cartCount === 0 && paymentState === "idle") return null;

    // Determine if form should be disabled during payment
    const isPaymentInProgress = [
        "creating_order",
        "awaiting_payment",
        "verifying",
    ].includes(paymentState);

    // ────────────────────────────────────────────────
    // Payment Status Overlay
    // ────────────────────────────────────────────────
    const renderPaymentOverlay = () => {
        if (paymentState === "idle" || paymentState === "success") return null;

        return (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center space-y-6">
                        {/* Creating Order */}
                        {paymentState === "creating_order" && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Creating Your Order
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Validating prices and reserving items...
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Awaiting Payment */}
                        {paymentState === "awaiting_payment" && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Complete Payment
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Please complete the payment in the Razorpay window.
                                        <br />
                                        Do not close this page.
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <Shield className="w-3 h-3" />
                                    <span>Secured by Razorpay</span>
                                </div>
                            </>
                        )}

                        {/* Verifying */}
                        {paymentState === "verifying" && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Verifying Payment
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Please wait while we verify your payment...
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Failed */}
                        {paymentState === "failed" && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-red-500">
                                        Payment Failed
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {paymentError || "Something went wrong with your payment."}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {paymentOrderId && (
                                        <Button
                                            onClick={() => retryFailedPayment(paymentOrderId)}
                                            className="flex-1 bg-gradient-to-r from-primary to-orange-500"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Retry Payment
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            resetPayment();
                                            setPaymentMethod("COD");
                                        }}
                                        className="flex-1"
                                    >
                                        Switch to COD
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={resetPayment}
                                    className="text-muted-foreground"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Checkout
                                </Button>
                            </>
                        )}

                        {/* Dismissed */}
                        {paymentState === "dismissed" && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-amber-600">
                                        Payment Cancelled
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        You closed the payment window. Your order is saved — you can
                                        retry anytime.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {paymentOrderId && (
                                        <Button
                                            onClick={() => retryFailedPayment(paymentOrderId)}
                                            className="flex-1 bg-gradient-to-r from-primary to-orange-500"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Retry Payment
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={resetPayment}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Checkout
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Error */}
                        {paymentState === "error" && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-red-500">
                                        Something Went Wrong
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {paymentError || "An unexpected error occurred."}
                                    </p>
                                </div>
                                <Button onClick={resetPayment} variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Payment status overlay */}
            {renderPaymentOverlay()}

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
                                    {user?.savedAddresses &&
                                        user.savedAddresses.length > 0 && (
                                            <select
                                                className="text-sm border rounded p-1 bg-background"
                                                onChange={(e) => {
                                                    const addr = user.savedAddresses.find(
                                                        (a: any) => a.id === e.target.value
                                                    );
                                                    if (addr) {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            fullName: addr.fullName,
                                                            phone: addr.phone,
                                                            addressLine: addr.addressLine1,
                                                            city: addr.city,
                                                            state: addr.state,
                                                            pincode: addr.pincode,
                                                        }));
                                                    }
                                                }}
                                            >
                                                <option value="">
                                                    -- Select Saved Address --
                                                </option>
                                                {user.savedAddresses.map((addr: any) => (
                                                    <option key={addr.id} value={addr.id}>
                                                        {addr.label} - {addr.addressLine1},{" "}
                                                        {addr.city}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                </div>

                                <form
                                    id="checkout-form"
                                    onSubmit={handlePlaceOrder}
                                    className="grid gap-4 sm:grid-cols-2"
                                >
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            required
                                            disabled={isPaymentInProgress}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            required
                                            disabled={isPaymentInProgress}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+91 9876543210"
                                            required
                                            disabled={isPaymentInProgress}
                                        />
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="addressLine">Address Line</Label>
                                        <Input
                                            id="addressLine"
                                            name="addressLine"
                                            value={formData.addressLine}
                                            onChange={handleInputChange}
                                            placeholder="123 Street Name, Apartment/Suite"
                                            required
                                            disabled={isPaymentInProgress}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Mumbai"
                                            required
                                            disabled={isPaymentInProgress}
                                        />
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Maharashtra"
                                            required
                                            disabled={isPaymentInProgress}
                                        />
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            placeholder="400001"
                                            required
                                            disabled={isPaymentInProgress}
                                        />
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
                                    {/* Razorpay Online Payment */}
                                    <label
                                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                            paymentMethod === "ONLINE"
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="ONLINE"
                                            checked={paymentMethod === "ONLINE"}
                                            onChange={() => setPaymentMethod("ONLINE")}
                                            className="mt-1"
                                            disabled={isPaymentInProgress}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-foreground">
                                                    Pay Online
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5 text-green-500" />
                                                    <span className="text-xs text-green-600 font-medium">
                                                        Secure
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                Card, UPI, Netbanking, Wallets — powered by Razorpay
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <Smartphone className="w-3 h-3" />
                                                <span>
                                                    Works on all devices including mobile & PWA
                                                </span>
                                            </div>
                                        </div>
                                    </label>

                                    {/* COD */}
                                    <label
                                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                            paymentMethod === "COD"
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === "COD"}
                                            onChange={() => setPaymentMethod("COD")}
                                            className="mt-1"
                                            disabled={isPaymentInProgress}
                                        />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Cash on Delivery (COD)
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Pay with cash when your order is delivered.
                                            </p>
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
                                                <span className="font-semibold text-green-700">
                                                    {appliedCoupon.code}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-1 text-xs hover:bg-transparent text-muted-foreground hover:text-red-500"
                                                onClick={removeCoupon}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter code"
                                                value={couponCode}
                                                onChange={(e) =>
                                                    setCouponCode(e.target.value.toUpperCase())
                                                }
                                                className="uppercase"
                                                disabled={isApplyingCoupon || isPaymentInProgress}
                                            />
                                            <Button
                                                onClick={handleApplyCoupon}
                                                disabled={
                                                    !couponCode.trim() ||
                                                    isApplyingCoupon ||
                                                    isPaymentInProgress
                                                }
                                                variant="secondary"
                                            >
                                                {isApplyingCoupon ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Apply"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 border-b border-border pb-4 mt-2">
                                    {cartItems.map((item, index) => {
                                        const variant =
                                            item.variantId && item.product.variants
                                                ? item.product.variants.find(
                                                      (v) => v.id === item.variantId
                                                  )
                                                : null;
                                        const unitPrice =
                                            variant?.price ??
                                            item.product.offerPrice ??
                                            item.product.price;

                                        return (
                                            <div
                                                key={`${item.product.id}-${item.variantId || index}`}
                                                className="flex gap-3"
                                            >
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 rounded-md object-cover border border-border"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium line-clamp-1">
                                                        {item.product.name}
                                                    </p>
                                                    <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                                                        <span>Qty: {item.quantity}</span>
                                                        <span className="font-semibold text-foreground">
                                                            ₹
                                                            {(
                                                                unitPrice * item.quantity
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {item.variantLabel && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {item.variantLabel}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2 text-sm pt-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">
                                            ₹{cartTotal.toLocaleString()}
                                        </span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({appliedCoupon.code})</span>
                                            <span className="font-medium">
                                                -₹{discountAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium">
                                            {shippingCost === 0 ? (
                                                <span className="text-green-500">FREE</span>
                                            ) : (
                                                `₹${shippingCost}`
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            ₹{finalTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    form="checkout-form"
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 h-12 text-lg mt-4"
                                    disabled={isProcessing || isPaymentInProgress}
                                >
                                    {isProcessing || isPaymentInProgress ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : paymentMethod === "ONLINE" ? (
                                        <>
                                            <Shield className="mr-2 h-5 w-5" />
                                            Pay ₹{finalTotal.toLocaleString()}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Place Order (₹{finalTotal.toLocaleString()})
                                        </>
                                    )}
                                </Button>

                                {paymentMethod === "ONLINE" && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                                        <Shield className="w-3 h-3 text-green-500" />
                                        <span>
                                            256-bit SSL encrypted • Secured by Razorpay
                                        </span>
                                    </div>
                                )}

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    By placing your order, you agree to our Terms of Service &
                                    Privacy Policy.
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
