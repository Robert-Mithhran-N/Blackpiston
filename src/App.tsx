import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PWAProvider } from "@/context/PWAContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAReloadPrompt from "@/components/PWAReloadPrompt";
import StartupLoader from "@/components/StartupLoader";
import OfflineIndicator from "@/components/OfflineIndicator";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { lazy, Suspense, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Eagerly load the home page (most common entry point)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded public pages
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Garage = lazy(() => import("./pages/Garage"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Warranty = lazy(() => import("./pages/Warranty"));
const Privacy = lazy(() => import("./pages/Privacy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Login = lazy(() => import("./pages/Login"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Lazy-loaded user profile pages
const ProfileLayout = lazy(() => import("./pages/user/ProfileLayout"));
const ProfileDetails = lazy(() => import("./pages/user/ProfileDetails"));
const ProfileOrders = lazy(() => import("./pages/user/ProfileOrders"));
const ProfileAddresses = lazy(() => import("./pages/user/ProfileAddresses"));
const ProfileSettings = lazy(() => import("./pages/user/ProfileSettings"));

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderHistory = lazy(() => import("./pages/admin/AdminOrderHistory"));
const AdminLowStock = lazy(() => import("./pages/admin/AdminLowStock"));
const AdminRequests = lazy(() => import("./pages/admin/AdminRequests"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

import AdminRoute from "./routes/AdminRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import { CartProvider } from "./context/CartContext";
import { useAdminAuth } from "./context/AdminAuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Auto refetch when app is resumed
      refetchOnReconnect: true,   // Auto refetch when network restores
      staleTime: 1000 * 60 * 5,   // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 15,     // Keep unused data in cache for 15 minutes
    },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Route-level loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
  </div>
);

const AdminRedirectEnforcer = () => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !location.pathname.startsWith("/admin")) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return null;
};

const App = () => {
  return (
  <>
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PWAProvider>
          <Toaster />
          <StartupLoader>
            <OfflineIndicator />
            <Sonner />
            <PWAInstallPrompt />
            <PWAReloadPrompt />
            <BrowserRouter>
              <UserAuthProvider>
                <AdminAuthProvider>
                  <CartProvider>
                    <ScrollToTop />
                    <AdminRedirectEnforcer />
                    <MobileBottomNav />
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    <Route path="/garage" element={<Garage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/payment/failed/:orderId" element={<PaymentFailed />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/warranty" element={<Warranty />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
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
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="orders/history" element={<AdminOrderHistory />} />
                      <Route path="low-stock" element={<AdminLowStock />} />
                      <Route path="requests" element={<AdminRequests />} />
                      <Route path="blog" element={<AdminBlog />} />
                      <Route path="appointments" element={<AdminAppointments />} />
                      <Route path="services" element={<AdminServices />} />
                      <Route path="messages" element={<AdminMessages />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
                </CartProvider>
              </AdminAuthProvider>
            </UserAuthProvider>
          </BrowserRouter>
          </StartupLoader>
        </PWAProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
  </>
);
};

export default App;
