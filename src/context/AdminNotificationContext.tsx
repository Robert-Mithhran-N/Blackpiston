/**
 * AdminNotificationContext — Realtime Socket.IO notification system for admin dashboard.
 *
 * Connects to the backend socket, joins the "admin" room,
 * listens for "new-order" events, and manages notification state.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/lib/socket";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { AdminNotification } from "@/types/admin";
import { showOrderToast } from "@/components/admin/OrderToast";

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = "bp-admin-notifications";
const MAX_NOTIFICATIONS = 50;

// ============================================================
// Context Types
// ============================================================

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType>({
  notifications: [],
  unreadCount: 0,
  soundEnabled: true,
  toggleSound: () => {},
  markAsRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
});

export const useAdminNotifications = () => useContext(AdminNotificationContext);

// ============================================================
// Sound Utility — uses Web Audio API (no external file needed)
// ============================================================

let audioCtx: AudioContext | null = null;

function playNotificationSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtx;

    // Create a pleasant two-tone notification "ding"
    const now = ctx.currentTime;

    // Tone 1: higher frequency
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);        // A5
    osc1.frequency.setValueAtTime(1046.5, now + 0.08); // C6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2: softer harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.5, now + 0.05); // E6
    gain2.gain.setValueAtTime(0.08, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.45);
  } catch {
    // Silently fail — audio not critical
  }
}

// ============================================================
// LocalStorage helpers
// ============================================================

function loadNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminNotification[];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: AdminNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {
    // Silently fail
  }
}

// ============================================================
// Provider
// ============================================================

interface Props {
  children: ReactNode;
}

export const AdminNotificationProvider = ({ children }: Props) => {
  const { token, isAuthenticated } = useAdminAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>(loadNotifications);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const hasJoinedRef = useRef(false);

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Actions ──

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    processedIdsRef.current.clear();
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  // ── Socket Connection ──

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = getSocket();

    // Join admin room with JWT auth
    const joinAdmin = () => {
      if (!hasJoinedRef.current) {
        socket.emit("join-admin", token);
      }
    };

    // Handle join confirmation
    const onAdminJoined = (data: { success: boolean; error?: string }) => {
      if (data.success) {
        hasJoinedRef.current = true;
        console.log("🔔 Admin notification channel connected");
      } else {
        console.warn("⚠️ Failed to join admin room:", data.error);
      }
    };

    // Handle new order event
    const onNewOrder = (data: any) => {
      // Dedup by notification ID
      if (processedIdsRef.current.has(data.id)) return;
      processedIdsRef.current.add(data.id);

      // Keep the set from growing unbounded
      if (processedIdsRef.current.size > 200) {
        const arr = Array.from(processedIdsRef.current);
        processedIdsRef.current = new Set(arr.slice(arr.length - 100));
      }

      const notification: AdminNotification = {
        id: data.id,
        type: "NEW_ORDER",
        title: "New Order Received",
        message: `${data.customerName} placed an order for ₹${data.totalAmount?.toLocaleString()}`,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        amount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        products: data.products,
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      // Add to state (newest first)
      setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));

      // Show toast popup
      showOrderToast(notification, () => navigate("/admin/orders"));

      // Play sound
      if (soundEnabled) {
        playNotificationSound();
      }

      // Invalidate React Query caches so dashboard/orders refresh
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    // Register listeners
    socket.on("admin-joined", onAdminJoined);
    socket.on("new-order", onNewOrder);

    // Join on connect (and re-join on reconnect)
    if (socket.connected) {
      joinAdmin();
    }
    socket.on("connect", joinAdmin);

    return () => {
      socket.off("admin-joined", onAdminJoined);
      socket.off("new-order", onNewOrder);
      socket.off("connect", joinAdmin);
      hasJoinedRef.current = false;
    };
  }, [isAuthenticated, token, queryClient, soundEnabled, navigate]);

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAllRead,
        clearAll,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
};
