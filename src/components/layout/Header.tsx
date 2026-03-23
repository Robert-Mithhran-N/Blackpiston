import { useMemo, useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, ChevronDown, HardHat, Shirt, Footprints, Sparkles, Home, LogOut, Settings, MapPin, Package as PackageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserAuth } from "@/context/UserAuthContext";
import { fetchCategoryTree } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/logo.png";

// Import shop category images
import helmetImg from "@/assets/shop-btn-logos/shop-helmet.png";
import glovesImg from "@/assets/shop-btn-logos/shop-gloves.png";
import bootImg from "@/assets/shop-btn-logos/shop-boot.png";
import accessImg from "@/assets/shop-btn-logos/shop-access.png";

// Category icons mapping (fallback)
const categoryIcons: Record<string, React.ElementType> = {
  helmets: HardHat,
  gloves: Shirt,
  jackets: Shirt,
  boots: Footprints,
  accessories: Sparkles,
};

// Category images mapping
const categoryImages: Record<string, string> = {
  helmets: helmetImg,
  gloves: glovesImg,
  jackets: glovesImg,
  boots: bootImg,
  accessories: accessImg,
  pants: glovesImg,
  'rain-gear': bootImg,
  luggage: accessImg,
};

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useUserAuth();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { pathname } = useLocation();

  // Close user menu and shop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch categories as tree from API
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; children?: any[] }[]>([]);
  useEffect(() => {
    fetchCategoryTree()
      .then((data) => setCategories(data.tree || []))
      .catch((err) => console.error("Failed to load category tree:", err));
  }, []);

  const navState = useMemo(
    () => ({
      home: pathname === "/",
      shop: pathname.startsWith("/shop"),
      garage: pathname.startsWith("/garage"),
      build: pathname.startsWith("/build"),
      about: pathname.startsWith("/about"),
      blog: pathname.startsWith("/blog"),
    }),
    [pathname]
  );

  const navClass = (isActive: boolean) =>
    [
      "text-sm font-ui font-medium transition-colors",
      isActive ? "text-primary" : "text-metal-light hover:text-primary",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <img
            src={logo}
            alt="BlackPiston Garage"
            className="h-12 w-auto pointer-events-none hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {/* Home */}
          <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
            Home
          </NavLink>

          {/* Shop Dropdown — click only */}
          <div className="relative" ref={shopRef}>
            <button
              onClick={() => setShopOpen((prev) => !prev)}
              className={`${navClass(navState.shop)} flex items-center gap-1 bg-transparent border-none cursor-pointer`}
            >
              Shop
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
            </button>

            {shopOpen && (
              <div className="absolute left-0 top-full mt-2 w-[800px] max-w-[90vw] p-6 bg-card border border-border rounded-xl shadow-2xl z-50 hidden lg:block">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Shop by Category
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Premium motorcycle gear & accessories
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                  {categories.map((type) => (
                    <div key={type.id} className="space-y-3">
                      <Link
                        to={`/shop/${type.slug}`}
                        onClick={() => setShopOpen(false)}
                        className="text-sm font-semibold text-primary uppercase tracking-wider hover:underline flex items-center gap-2 group w-fit"
                      >
                        {type.name}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex flex-col space-y-2">
                        {type.children?.map((child) => (
                          <Link
                            key={child.id}
                            to={`/shop/${child.slug}`}
                            onClick={() => setShopOpen(false)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2 flex-shrink-0"></span>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    to="/shop"
                    onClick={() => setShopOpen(false)}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    View All Products →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/garage"
            className={({ isActive }) => navClass(isActive || navState.garage)}
          >
            Garage & Services
          </NavLink>

          <NavLink
            to="/build"
            className={({ isActive }) => navClass(isActive || navState.build)}
          >
            Build & Fit
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => navClass(isActive || navState.about)}
          >
            About Us
          </NavLink>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search gear, parts, services..."
              className="w-full pl-10 bg-secondary border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-metal-light hover:text-primary hover:bg-transparent"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Account */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-metal-light hover:text-primary hover:bg-transparent"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/50"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="py-2 flex flex-col gap-1 px-2">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/profile/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <PackageIcon className="h-4 w-4" />
                      My Orders
                    </Link>
                    <Link
                      to="/profile/addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      Addresses
                    </Link>
                    <Link
                      to="/profile/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="pt-2 border-t border-border px-2">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate("/login", { replace: true });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button
                variant="ghost"
                size="icon"
                className="text-metal-light hover:text-primary hover:bg-transparent"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-metal-light hover:text-primary hover:bg-transparent"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-metal-light hover:text-primary hover:bg-transparent"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-card border-border">
              <nav className="flex flex-col gap-4 mt-8">
                {/* Home */}
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-foreground hover:text-primary transition-colors font-medium"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>

                {/* Shop Categories */}
                <div className="space-y-2">
                  <p className="text-sm font-ui font-semibold text-primary uppercase tracking-wider">
                    Shop
                  </p>
                  {categories.map((type) => {
                    const Icon = categoryIcons[type.slug] || Sparkles;
                    return (
                      <div key={type.id} className="flex flex-col mb-4 bg-zinc-900/40 p-3 rounded-lg border border-border">
                        <Link
                          to={`/shop/${type.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2 text-foreground font-semibold hover:text-primary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-primary" />
                            {type.name}
                          </div>
                        </Link>
                        {type.children && type.children.length > 0 && (
                          <div className="pl-7 mt-2 space-y-2 border-l border-zinc-700/50">
                            {type.children.map((child) => (
                              <Link
                                key={child.id}
                                to={`/shop/${child.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                - {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <NavLink
                    to="/garage"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "block py-2 font-medium transition-colors",
                        isActive || navState.garage
                          ? "text-primary"
                          : "text-metal-light hover:text-primary",
                      ].join(" ")
                    }
                  >
                    Garage & Services
                  </NavLink>
                  <NavLink
                    to="/build"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "block py-2 font-medium transition-colors",
                        isActive || navState.build
                          ? "text-primary"
                          : "text-metal-light hover:text-primary",
                      ].join(" ")
                    }
                  >
                    Build & Fit
                  </NavLink>
                  <NavLink
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "block py-2 font-medium transition-colors",
                        isActive || navState.about
                          ? "text-primary"
                          : "text-metal-light hover:text-primary",
                      ].join(" ")
                    }
                  >
                    About Us
                  </NavLink>
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-metal-light hover:text-primary transition-colors font-medium"
                  >
                    Contact
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search gear, parts, services..."
              className="w-full pl-10 bg-secondary border-border focus:border-primary"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
