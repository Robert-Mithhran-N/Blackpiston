import { useLocation, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  // Protect route - if no orderId in state, user probably navigated here directly
  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          
          {/* Animated Success Icon */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-full h-full bg-green-500/10 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 my-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              <span>Order ID</span>
            </div>
            <p className="text-xl font-mono font-bold text-foreground tracking-wider">
              {orderId}
            </p>
            <div className="mt-4 text-sm text-amber-500/90 bg-amber-500/10 p-3 rounded-md">
              You will receive an email confirmation shortly with your order details.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </Link>
            
            <Link to="/garage" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/50">
                Explore Garage Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderSuccess;
