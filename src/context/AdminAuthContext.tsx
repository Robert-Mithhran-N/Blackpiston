import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AdminAuthContextValue = {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithData: (token: string, userData: AdminUser, opts?: { redirectTo?: string }) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "blackpiston_admin_auth";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  // Eagerly read localStorage so auth is available on first render
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user && parsed?.token) return parsed.user;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user && parsed?.token) return parsed.token;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Use refs so callbacks always have the latest navigate/location
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const locationRef = useRef(location);
  locationRef.current = location;

  // Persist auth changes to localStorage
  useEffect(() => {
    if (user && token) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, token }),
      );
    }
  }, [user, token]);

  // Real admin login via backend API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      const userData: AdminUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      setUser(userData);
      setToken(data.token);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: data.token }));

      const redirect =
        (locationRef.current.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
        "/admin";
      navigateRef.current(redirect, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithData = (newToken: string, userData: AdminUser, opts?: { redirectTo?: string }) => {
    setUser(userData);
    setToken(newToken);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: newToken }));

    const redirect =
      opts?.redirectTo ||
      (locationRef.current.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
      "/admin";
    navigateRef.current(redirect, { replace: true });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
    navigateRef.current("/login", { replace: true });
  };

  const value: AdminAuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && token && ["admin", "super-admin", "ADMIN", "STAFF"].includes(user.role)),
    isLoading,
    login,
    loginWithData,
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
