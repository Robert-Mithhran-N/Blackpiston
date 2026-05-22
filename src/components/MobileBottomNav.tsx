import { NavLink, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, User, Package } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";

const MobileBottomNav = () => {
  const { user } = useUserAuth();
  const location = useLocation();

  // Don't show bottom nav on admin routes, login/register, or checkout
  const hideRoutes = ["/admin", "/login", "/checkout", "/onboarding", "/forgot-password", "/reset-password"];
  if (hideRoutes.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Shop", path: "/shop", icon: ShoppingBag },
    { name: "Cart", path: "/cart", icon: ShoppingCart },
    { name: "Orders", path: user ? "/profile/orders" : "/login", icon: Package },
    { name: "Profile", path: user ? "/profile" : "/login", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[50] flex h-16 items-center justify-around border-t border-white/10 bg-zinc-950 pb-safe pt-1 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || 
                         (item.path !== "/" && location.pathname.startsWith(item.path));

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] gap-1 transition-colors ${
              isActive ? "text-amber-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
