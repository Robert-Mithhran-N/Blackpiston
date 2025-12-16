import { ReactNode, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  CalendarClock,
  Wrench,
  ShoppingBag,
  Factory,
  FileText,
  Users,
  MessagesSquare,
  Settings,
  CreditCard,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type AdminLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products / Gear", icon: ShoppingBag },
  { to: "/admin/builds", label: "Custom Builds", icon: Factory },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: MessagesSquare },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "AD";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-gradient-to-b from-background to-muted/20">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-md border border-border bg-background">
                <img
                  src={logo}
                  alt="BlackPiston Garage"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>
              <div className="leading-tight">
                <div className="text-xs uppercase tracking-[0.25em] text-metal-light">
                  BlackPiston
                </div>
                <div className="text-sm font-semibold text-foreground">
                  Garage Admin
                </div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.to === "/admin"}>
                      {({ isActive }) => (
                        <button
                          type="button"
                          className={[
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/40"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-border/60 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-muted text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <div className="text-xs font-medium">
                    {user?.name || "Garage Admin"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {user?.role === "super-admin" ? "Super Admin" : "Admin"}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar / header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted/40 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <div className="leading-tight">
              <div className="text-[11px] uppercase tracking-[0.25em] text-metal-light">
                Admin
              </div>
              <div className="text-sm font-semibold">
                BlackPiston Garage
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs hover:bg-muted"
                >
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarFallback className="bg-muted text-[11px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium">
                      {user?.name || "Garage Admin"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {user?.role === "super-admin" ? "Super Admin" : "Admin"}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-3 w-3" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="border-b border-border bg-background/95 px-3 py-3 md:hidden">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/admin"}
                    onClick={() => setMobileOpen(false)}
                  >
                    {({ isActive }) => (
                      <div
                        className={[
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/40"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


