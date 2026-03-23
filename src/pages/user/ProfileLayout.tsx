import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";
import { User, Package, MapPin, Settings, Home } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";

const ProfileLayout = () => {
  const { user, isAuthenticated, loading } = useUserAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { name: "Profile Details", path: "/profile", icon: User },
    { name: "My Orders", path: "/profile/orders", icon: Package },
    { name: "Addresses", path: "/profile/addresses", icon: MapPin },
    { name: "Settings", path: "/profile/settings", icon: Settings },
  ];

  const getLinkClass = (path: string) => {
    // Exact match for /profile, standard start logic for others
    const isActive = path === "/profile" ? pathname === "/profile" : pathname.startsWith(path);
    return `flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted/50"
    }`;
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm sticky top-24">
            
            {/* User Greeting Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/50"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Hello,</p>
                <p className="font-bold text-lg truncate text-foreground">{user?.name}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
              <NavLink
                to="/"
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent`
                }
              >
                <Home className="h-5 w-5" />
                Back to Shop
              </NavLink>
              
              <div className="h-px bg-border my-2 w-full"></div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.path === "/profile"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Content Area (Dynamic Outlet) */}
        <div className="flex-1 bg-card border border-border rounded-xl shadow-sm min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
