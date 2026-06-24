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
    Banknote,
    ChevronDown,
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
    const [isItemsExpanded, setIsItemsExpanded] = useState(false);

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

            <main className="checkout-mobile-form px-4 py-5 md:container md:py-8 max-w-6xl pb-36 md:pb-8">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-4 md:mb-8">
                    Checkout
                </h1>

                <div className="grid gap-3 md:gap-8 lg:grid-cols-3">
                    {/* Left Column: Form & Payment */}
                    <div className="lg:col-span-2 space-y-3 md:space-y-6">
                        {/* ──────────────────────────────────────
                            SHIPPING ADDRESS SECTION
                        ────────────────────────────────────── */}
                        <Card className="border-border/40 md:border-border">
                            <CardContent className="p-4 md:p-6">
                                {/* Section Header */}
                                <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-border/40 pb-3 md:pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 md:w-auto md:h-auto rounded-full bg-primary/10 flex items-center justify-center md:bg-transparent">
                                            <MapPin className="text-primary h-4 w-4 md:h-6 md:w-6" />
                                        </div>
                                        <h2 className="text-sm md:text-xl font-semibold">
                                            Shipping Address
                                        </h2>
                                    </div>
                                </div>

                                {/* Visual Address Grid */}
                                {user?.savedAddresses && user.savedAddresses.length > 0 && (
                                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mb-6">
                                        {user.savedAddresses.map((addr: any) => {
                                            const isSelected =
                                                formData.fullName === addr.fullName &&
                                                formData.phone === addr.phone &&
                                                formData.addressLine === addr.addressLine1 &&
                                                formData.city === addr.city &&
                                                formData.state === addr.state &&
                                                formData.pincode === addr.pincode;

                                            return (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            fullName: addr.fullName,
                                                            phone: addr.phone,
                                                            addressLine: addr.addressLine1,
                                                            city: addr.city,
                                                            state: addr.state,
                                                            pincode: addr.pincode,
                                                        }));
                                                    }}
                                                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 bg-card/45 hover:bg-card/75 text-left relative ${
                                                        isSelected
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                                                            : "border-border/60 hover:border-border"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-xs capitalize flex items-center gap-1.5 text-foreground">
                                                            <MapPin className="w-3.5 h-3.5 text-primary" />
                                                            {addr.label || "Address"}
                                                        </span>
                                                        {addr.isDefault && (
                                                            <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-bold">
                                                                DEFAULT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-semibold text-foreground line-clamp-1">{addr.fullName}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1.5">Tel: {addr.phone}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Address Form */}
                                <form
                                    id="checkout-form"
                                    onSubmit={handlePlaceOrder}
                                    className="grid gap-3 md:gap-4 md:grid-cols-2"
                                >
                                    {/* Full Name — full width */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label
                                            htmlFor="fullName"
                                            className="text-[11px] md:text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            required
                                            disabled={isPaymentInProgress}
                                            autoComplete="name"
                                            className="h-11 md:h-10 text-sm"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="email"
                                            className="text-[11px] md:text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            required
                                            disabled={isPaymentInProgress}
                                            inputMode="email"
                                            autoComplete="email"
                                            className="h-11 md:h-10 text-sm"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="phone"
                                            className="text-[11px] md:text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+91 9876543210"
                                            required
                                            disabled={isPaymentInProgress}
                                            inputMode="tel"
                                            autoComplete="tel"
                                            className="h-11 md:h-10 text-sm"
                                        />
                                    </div>

                                    {/* Address Line — full width */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label
                                            htmlFor="addressLine"
                                            className="text-[11px] md:text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >
                                            Address Line
                                        </Label>
                                        <Input
                                            id="addressLine"
                                            name="addressLine"
                                            value={formData.addressLine}
                                            onChange={handleInputChange}
                                            placeholder="123 Street Name, Apartment/Suite"
                                            required
                                            disabled={isPaymentInProgress}
                                            autoComplete="street-address"
                                            className="h-11 md:h-10 text-sm"
                                        />
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="city"
                                            className="text-[11px] md:text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >
                                            City
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Mumbai"
                                            required
                                            disabled={isPaymentInProgress}
                                            autoComplete="address-level2"
                                            className="h-11 md:h-10 text-sm"
                                        />
                                    </div>

                                    {/* State */}
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="state"
                                            className="text-[11px] md:text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >
                                            State
                                        </Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Maharashtra"
                                            required
                                            disabled={isPaymentInProgress}
                                            autoComplete="address-level1"
                                            className="h-11 md:h-10 text-sm"
                                        />
                                    </div>

                                    {/* Pincode — full width on mobile, spans 2 on desktop */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label
                                            htmlFor="pincode"
                                            className="text-[11px] md:text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >
                                            Pincode
                                        </Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            placeholder="400001"
                                            required
                                            disabled={isPaymentInProgress}
                                            inputMode="numeric"
                                            autoComplete="postal-code"
                                            className="h-11 md:h-10 text-sm md:max-w-[200px]"
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* ──────────────────────────────────────
                            PAYMENT METHOD SECTION
                        ────────────────────────────────────── */}
                        <Card className="border-border/40 md:border-border">
                            <CardContent className="p-4 md:p-6">
                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-3 md:mb-6">
                                    <div className="w-8 h-8 md:w-auto md:h-auto rounded-full bg-primary/10 flex items-center justify-center md:bg-transparent">
                                        <CreditCard className="text-primary h-4 w-4 md:h-6 md:w-6" />
                                    </div>
                                    <h2 className="text-sm md:text-xl font-semibold">
                                        Payment Method
                                    </h2>
                                </div>

                                <div className="space-y-2.5 md:space-y-3">
                                    {/* ── Pay Online (Razorpay) ── */}
                                    <label
                                        className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                            paymentMethod === "ONLINE"
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                                                : "border-border/60 bg-card/25 hover:border-border hover:bg-card/45"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="ONLINE"
                                            checked={paymentMethod === "ONLINE"}
                                            onChange={() => setPaymentMethod("ONLINE")}
                                            className="sr-only"
                                            disabled={isPaymentInProgress}
                                        />
                                        <div
                                            className="checkout-radio-dot mt-1 shrink-0"
                                            data-checked={paymentMethod === "ONLINE"}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-primary" />
                                                    Pay Online
                                                </p>
                                                <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                                    <Shield className="w-3 h-3 text-green-500" />
                                                    <span className="text-[9px] md:text-xs text-green-500 font-bold uppercase">
                                                        Secure
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                                                UPI, Cards (Visa, Mastercard, RuPay), Netbanking, Wallets
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                <span className="text-[10px] bg-muted/80 text-foreground px-2 py-0.5 rounded font-mono border border-border/40">UPI</span>
                                                <span className="text-[10px] bg-muted/80 text-foreground px-2 py-0.5 rounded font-mono border border-border/40">CARDS</span>
                                                <span className="text-[10px] bg-muted/80 text-foreground px-2 py-0.5 rounded font-mono border border-border/40">NETBANKING</span>
                                            </div>
                                        </div>
                                    </label>

                                    {/* ── Cash on Delivery ── */}
                                    <label
                                        className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                            paymentMethod === "COD"
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                                                : "border-border/60 bg-card/25 hover:border-border hover:bg-card/45"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === "COD"}
                                            onChange={() => setPaymentMethod("COD")}
                                            className="sr-only"
                                            disabled={isPaymentInProgress}
                                        />
                                        <div
                                            className="checkout-radio-dot mt-1 shrink-0"
                                            data-checked={paymentMethod === "COD"}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
                                                    <Banknote className="w-4 h-4 text-primary" />
                                                    Cash on Delivery (COD)
                                                </p>
                                            </div>
                                            <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                                Pay in cash or UPI when your parcel is delivered at your door.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ──────────────────────────────────────
                        ORDER SUMMARY SECTION
                    ────────────────────────────────────── */}
                    <div className="space-y-3 md:space-y-6">
                        <Card className="md:sticky md:top-24 border-border/40 md:border-border">
                            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                                {/* Section Header */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 md:w-auto md:h-auto rounded-full bg-primary/10 flex items-center justify-center md:bg-transparent">
                                        <Package className="h-4 w-4 md:h-5 md:w-5 text-primary md:text-foreground" />
                                    </div>
                                    <h2 className="text-sm md:text-xl font-bold">
                                        Order Summary
                                    </h2>
                                </div>

                                {/* ── Promo Code ── */}
                                <div className="bg-muted/20 md:bg-muted/30 p-3 md:p-4 rounded-lg border border-border/30 md:border-border">
                                    <div className="flex items-center gap-2 font-medium mb-2 md:mb-3">
                                        <Tag className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                                        <span className="text-xs md:text-sm">
                                            Have a promo code?
                                        </span>
                                    </div>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-2.5 md:p-3 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
                                                <span className="font-semibold text-green-700 text-xs md:text-sm">
                                                    {appliedCoupon.code}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-1 text-[10px] md:text-xs hover:bg-transparent text-muted-foreground hover:text-red-500"
                                                onClick={removeCoupon}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="ENTER CODE"
                                                value={couponCode}
                                                onChange={(e) =>
                                                    setCouponCode(e.target.value.toUpperCase())
                                                }
                                                className="uppercase h-10 md:h-10 text-xs md:text-sm"
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
                                                className="h-10 px-4 text-xs md:text-sm shrink-0"
                                            >
                                                {isApplyingCoupon ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    "Apply"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* ── Cart Items ── */}
                                <div className="md:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                                        className="flex items-center justify-between w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground border-b border-border/40 mb-3"
                                    >
                                        <span>{isItemsExpanded ? "Hide item details" : "Show item details"} ({cartCount})</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isItemsExpanded ? "rotate-180" : ""}`} />
                                    </button>
                                </div>

                                <div className={`space-y-3 md:space-y-4 max-h-[240px] md:max-h-[300px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar border-b border-border/40 md:border-border pb-3 md:pb-4 ${
                                    isItemsExpanded ? "block" : "hidden md:block"
                                }`}>
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
                                                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border border-border/40"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs md:text-sm font-medium line-clamp-1">
                                                        {item.product.name}
                                                    </p>
                                                    <div className="flex justify-between mt-0.5 md:mt-1 text-xs md:text-sm text-muted-foreground">
                                                        <span>Qty: {item.quantity}</span>
                                                        <span className="font-semibold text-foreground">
                                                            ₹
                                                            {(
                                                                unitPrice * item.quantity
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {item.variantLabel && (
                                                        <p className="text-[10px] md:text-xs text-muted-foreground truncate mt-0.5">
                                                            {item.variantLabel}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ── Price Breakdown ── */}
                                <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm pt-1 md:pt-2">
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
                                                `₹${shippingCost.toLocaleString()}`
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Total ── */}
                                <div className="border-t border-border/60 md:border-border pt-3 md:pt-4">
                                    <div className="flex justify-between text-base md:text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            ₹{finalTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Desktop CTA (hidden on mobile) ── */}
                                <div className="hidden md:block">
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

                                    <p className="text-xs text-center text-muted-foreground mt-4 font-ui">
                                        By placing your order, you agree to our{" "}
                                        <Link to="/terms" target="_blank" className="text-primary hover:underline font-semibold">
                                            Terms & Conditions
                                        </Link>{" "}
                                        &{" "}
                                        <Link to="/privacy" target="_blank" className="text-primary hover:underline font-semibold">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </p>
                                </div>

                                {/* ── Mobile security & terms (visible only on mobile, above sticky CTA) ── */}
                                <div className="md:hidden space-y-2 pt-1">
                                    {paymentMethod === "ONLINE" && (
                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/70">
                                            <Shield className="w-3 h-3 text-green-500/70" />
                                            <span>
                                                256-bit SSL encrypted • Secured by Razorpay
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-center text-muted-foreground/60 leading-relaxed font-ui">
                                        By placing your order, you agree to our{" "}
                                        <Link to="/terms" target="_blank" className="text-primary hover:underline font-semibold">
                                            Terms & Conditions
                                        </Link>{" "}
                                        &{" "}
                                        <Link to="/privacy" target="_blank" className="text-primary hover:underline font-semibold">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* ──────────────────────────────────────
                MOBILE STICKY CTA
            ────────────────────────────────────── */}
            <div className="checkout-sticky-cta md:hidden">
                <div className="flex items-center gap-3">
                    {/* Price summary */}
                    <div className="shrink-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">
                            Total
                        </p>
                        <p className="text-lg font-bold text-primary leading-tight">
                            ₹{finalTotal.toLocaleString()}
                        </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                        type="submit"
                        form="checkout-form"
                        className={`flex-1 h-[52px] rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-200 ${
                            !(isProcessing || isPaymentInProgress) ? "checkout-cta-shimmer" : ""
                        }`}
                        disabled={isProcessing || isPaymentInProgress}
                    >
                        {isProcessing || isPaymentInProgress ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : paymentMethod === "ONLINE" ? (
                            <>
                                <Shield className="mr-1.5 h-4 w-4" />
                                Pay ₹{finalTotal.toLocaleString()}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Place Order
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="hidden md:block">
                <Footer />
            </div>
        </div>
    );
};

export default Checkout;
