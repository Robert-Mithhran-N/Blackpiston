import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import ShopCategory from "./pages/ShopCategory";
import Garage from "./pages/Garage";
import Build from "./pages/Build";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Warranty from "./pages/Warranty";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import AdminRoute from "./routes/AdminRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderHistory from "./pages/admin/AdminOrderHistory";
import AdminLowStock from "./pages/admin/AdminLowStock";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminTopOffers from "./pages/admin/AdminTopOffers";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<ShopCategory />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/build" element={<Build />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/warranty" element={<Warranty />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} />
              <Route path="top-offers" element={<AdminTopOffers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/history" element={<AdminOrderHistory />} />
              <Route path="low-stock" element={<AdminLowStock />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
