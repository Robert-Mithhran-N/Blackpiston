import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super-admin";
};

type AdminAuthContextValue = {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (opts?: { redirectTo?: string }) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "blackpiston_admin_auth";

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { user: AdminUser; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user || !token) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, token }),
    );
  }, [user, token]);

  const login = (opts?: { redirectTo?: string }) => {
    const fakeUser: AdminUser = {
      id: "admin-1",
      name: "Garage Admin",
      email: "admin@blackpiston.garage",
      role: "admin",
    };
    const fakeToken = "FAKE_ADMIN_JWT_TOKEN";
    setUser(fakeUser);
    setToken(fakeToken);

    const redirect =
      opts?.redirectTo ||
      (location.state as any)?.from?.pathname ||
      "/admin";
    navigate(redirect, { replace: true });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
    navigate("/login", { replace: true });
  };

  const value: AdminAuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && token && (user.role === "admin" || user.role === "super-admin")),
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
};


