import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

const API_BASE = "http://localhost:3001/api";
const TOKEN_KEY = "blackpiston_user_token";
const USER_KEY = "blackpiston_user";

type UserData = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
};

type UserAuthContextValue = {
    user: UserData | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string, user: UserData) => void;
    logout: () => void;
};

const UserAuthContext = createContext<UserAuthContextValue | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount: check localStorage for existing token and validate it
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (!storedToken) {
            setLoading(false);
            return;
        }

        // Optimistically set user from localStorage for instant UI
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch {
                // ignore parse errors
            }
        }

        // Validate token with backend
        fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Invalid token");
                return res.json();
            })
            .then((data) => {
                setUser(data.user);
                setToken(storedToken);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            })
            .catch(() => {
                // Token is invalid — clear everything
                setUser(null);
                setToken(null);
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = useCallback((newToken: string, userData: UserData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }, []);

    const value: UserAuthContextValue = {
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        logout,
    };

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = () => {
    const ctx = useContext(UserAuthContext);
    if (!ctx) {
        throw new Error("useUserAuth must be used within UserAuthProvider");
    }
    return ctx;
};
