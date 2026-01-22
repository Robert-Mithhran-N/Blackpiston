import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, ChevronDown, HardHat, Shirt, Footprints, Sparkles, Home } from "lucide-react";
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
import logo from "@/assets/logo.png";
import { categories } from "@/data/userMockData";

// Import shop category images
import helmetImg from "@/assets/shop-btn-logos/shop-helmet.png";
import glovesImg from "@/assets/shop-btn-logos/shop-gloves.png";
import bootImg from "@/assets/shop-btn-logos/shop-boot.png";
import accessImg from "@/assets/shop-btn-logos/shop-access.png";

// Category icons mapping (fallback)
const categoryIcons: Record<string, React.ElementType> = {
  helmets: HardHat,
  jackets: Shirt,
  boots: Footprints,
  accessories: Sparkles,
};

// Category images mapping
const categoryImages: Record<string, string> = {
  helmets: helmetImg,
  jackets: glovesImg,
  boots: bootImg,
  accessories: accessImg,
};


const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // TODO: Fetch cart count from context/state
  const [cartCount] = useState(2);
  const { pathname } = useLocation();

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

          {/* Shop Mega Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`${navClass(navState.shop)} bg-transparent hover:bg-transparent data-[state=open]:bg-transparent px-0`}
                >
                  Shop
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4 bg-card border border-border">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                        Shop by Category
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Premium motorcycle gear & accessories
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const categoryImage = categoryImages[category.id];
                        return (
                          <NavigationMenuLink key={category.id} asChild>
                            <Link
                              to={`/shop/${category.id}`}
                              className="group flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-primary/10 transition-all duration-200 border border-zinc-700/50 hover:border-primary/40 cursor-pointer"
                            >
                              {/* Category Image */}
                              <div className="h-11 w-11 rounded-lg bg-zinc-900/80 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img
                                  src={categoryImage}
                                  alt={category.name}
                                  className="h-9 w-9 object-contain"
                                />
                              </div>
                              {/* Category Text */}
                              <div className="flex flex-col min-w-0">
                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {category.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {category.productCount} products
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Link
                        to="/shop"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
          <Link to="/login">
            <Button
              variant="ghost"
              size="icon"
              className="text-metal-light hover:text-primary hover:bg-transparent"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>

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
                  {categories.map((category) => {
                    const Icon = categoryIcons[category.id] || Sparkles;
                    return (
                      <Link
                        key={category.id}
                        to={`/shop/${category.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 text-metal-light hover:text-primary transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {category.name}
                      </Link>
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
