import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, RefreshCw, ShoppingBag, Headphones, ArrowLeft, Banknote } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useEffect } from "react";

const PaymentFailed = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { paymentState, error, orderId: newOrderId, retryFailedPayment } = useRazorpay();

    // Redirect to success if retry succeeds
    useEffect(() => {
        if (paymentState === "success" && newOrderId) {
            navigate("/order-success", {
                state: { orderId: newOrderId, paymentMethod: "ONLINE" },
                replace: true,
            });
        }
    }, [paymentState, newOrderId, navigate]);

    if (!orderId) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground">No order found.</p>
                        <Link to="/shop">
                            <Button>Go to Shop</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isRetrying = ["creating_order", "awaiting_payment", "verifying"].includes(paymentState);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center space-y-6">
                        {/* Error Icon */}
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
                            <div className="relative flex items-center justify-center w-full h-full bg-red-500/10 rounded-full">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-red-500 mb-2">
                                Payment Failed
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {error || "Your payment could not be processed. Don't worry — no money has been deducted."}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={() => retryFailedPayment(orderId)}
                                disabled={isRetrying}
                                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 h-11"
                            >
                                {isRetrying ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Retrying...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Retry Payment
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => navigate("/checkout")}
                            >
                                <Banknote className="mr-2 h-4 w-4" />
                                Try Different Payment Method
                            </Button>

                            <div className="flex gap-3">
                                <Link to="/shop" className="flex-1">
                                    <Button variant="ghost" className="w-full">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Shop
                                    </Button>
                                </Link>
                                <Link to="/contact" className="flex-1">
                                    <Button variant="ghost" className="w-full">
                                        <Headphones className="mr-2 h-4 w-4" />
                                        Support
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground pt-2">
                            If money was deducted, it will be refunded within 5-7 business days.
                        </p>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentFailed;
