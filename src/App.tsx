import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import SplashScreen, { shouldShowSplash } from "@/components/SplashScreen";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
// ShopCategory removed - categories feature removed
import ProductDetail from "./pages/ProductDetail";
import Garage from "./pages/Garage";
import Build from "./pages/Build";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Warranty from "./pages/Warranty";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProfileLayout from "./pages/user/ProfileLayout";
import ProfileDetails from "./pages/user/ProfileDetails";
import ProfileOrders from "./pages/user/ProfileOrders";
import ProfileAddresses from "./pages/user/ProfileAddresses";
import ProfileSettings from "./pages/user/ProfileSettings";

import AdminRoute from "./routes/AdminRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import { CartProvider } from "./context/CartContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderHistory from "./pages/admin/AdminOrderHistory";
import AdminLowStock from "./pages/admin/AdminLowStock";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBuilds from "./pages/admin/AdminBuilds";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminServices from "./pages/admin/AdminServices";
import AdminMessages from "./pages/admin/AdminMessages";
// AdminTopOffers removed - using dynamic discount-based system
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const App = () => {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);

  return (
  <>
    {/* Splash Screen — plays once per localStorage session */}
    {showSplash && (
      <SplashScreen onComplete={() => setShowSplash(false)} />
    )}

    <div className={showSplash ? "invisible" : "visible"}>
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter>
          <UserAuthProvider>
            <AdminAuthProvider>
              <CartProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  {/* /shop/:category route removed - categories feature removed */}
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  <Route path="/garage" element={<Garage />} />
                  <Route path="/build" element={<Build />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/warranty" element={<Warranty />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected User Dashboard Routes */}
                  <Route path="/profile" element={<ProfileLayout />}>
                    <Route index element={<ProfileDetails />} />
                    <Route path="orders" element={<ProfileOrders />} />
                    <Route path="addresses" element={<ProfileAddresses />} />
                    <Route path="settings" element={<ProfileSettings />} />
                  </Route>

                  <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    {/* top-offers route removed - using dynamic discount system */}
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/history" element={<AdminOrderHistory />} />
                    <Route path="low-stock" element={<AdminLowStock />} />
                    <Route path="requests" element={<AdminRequests />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="builds" element={<AdminBuilds />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </AdminAuthProvider>
          </UserAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
    </div>
  </>
);
};

export default App;

