import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Garage from "./pages/Garage";
import Build from "./pages/Build";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Warranty from "./pages/Warranty";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
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

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/customers/:id" element={<AdminCustomers />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/suppliers" element={<AdminSuppliers />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/returns" element={<AdminReturns />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
