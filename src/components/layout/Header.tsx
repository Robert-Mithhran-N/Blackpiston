import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

const Header = () => {
  // TODO: Fetch categories from API
  const categories: Array<{ name: string; href: string }> = [];
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // TODO: Fetch cart count from API
  const [cartCount] = useState(0);
  const { pathname } = useLocation();

  const navState = useMemo(
    () => ({
      shop: pathname.startsWith("/shop"),
      garage: pathname.startsWith("/garage"),
      build: pathname.startsWith("/build"),
      about: pathname.startsWith("/about"),
      blog: pathname.startsWith("/blog"),
    }),
    [pathname],
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
          <img src={logo} alt="BlackPiston Garage" className="h-12 w-auto pointer-events-none hover:opacity-90 transition-opacity" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center gap-1 ${navClass(navState.shop)}`}>
              Shop <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-card border-border">
              {categories.length === 0 ? (
                <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
              ) : (
                categories.map((category) => (
                  <DropdownMenuItem key={category.name} asChild>
                    <Link
                      to={category.href}
                      className="w-full cursor-pointer hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <NavLink to="/garage" className={({ isActive }) => navClass(isActive || navState.garage)}>
            Garage & Services
          </NavLink>

          <NavLink to="/build" className={({ isActive }) => navClass(isActive || navState.build)}>
            Build & Fit
          </NavLink>

          <NavLink to="/about" className={({ isActive }) => navClass(isActive || navState.about)}>
            About Us
          </NavLink>

          <NavLink to="/blog" className={({ isActive }) => navClass(isActive || navState.blog)}>
            Blog
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
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
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
                <div className="space-y-2">
                  <p className="text-sm font-ui font-semibold text-primary uppercase tracking-wider">
                    Shop
                  </p>
                  {categories.length === 0 ? (
                    <p className="py-2 text-metal-light text-sm">No categories available</p>
                  ) : (
                    categories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.href}
                        className="block py-2 text-metal-light hover:text-primary transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))
                  )}
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  <NavLink
                    to="/garage"
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
                    className={({ isActive }) =>
                      [
                        "block py-2 font-medium transition-colors",
                        isActive || navState.build ? "text-primary" : "text-metal-light hover:text-primary",
                      ].join(" ")
                    }
                  >
                    Build & Fit
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      [
                        "block py-2 font-medium transition-colors",
                        isActive || navState.about ? "text-primary" : "text-metal-light hover:text-primary",
                      ].join(" ")
                    }
                  >
                    About Us
                  </NavLink>
                  <NavLink
                    to="/blog"
                    className={({ isActive }) =>
                      [
                        "block py-2 font-medium transition-colors",
                        isActive || navState.blog ? "text-primary" : "text-metal-light hover:text-primary",
                      ].join(" ")
                    }
                  >
                    Blog
                  </NavLink>
                  <Link
                    to="/contact"
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
