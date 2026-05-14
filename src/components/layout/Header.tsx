import { useMemo, useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, Home, LogOut, Settings, MapPin, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserAuth } from "@/context/UserAuthContext";
import { useCart } from "@/context/CartContext";
// import logo from "@/assets/logo.png";
const logo = "https://res.cloudinary.com/dp890nvg2/image/upload/f_auto,q_auto/v1/blackpiston/assets/logo";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useUserAuth();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { pathname } = useLocation();

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Categories feature removed - using simple shop link instead
  const categories: { id: string; name: string; slug: string; children?: any[] }[] = [];

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

          {/* Shop Link - Categories removed */}
          <NavLink to="/shop" className={({ isActive }) => navClass(isActive)}>
            Shop
          </NavLink>

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

                {/* Shop Link - Categories removed */}
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-foreground hover:text-primary transition-colors font-medium"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Shop
                </Link>

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
