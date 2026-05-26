import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  ShoppingBag,
  Circle,
  ExternalLink,
} from "lucide-react";
import { useAdminNotifications } from "@/context/AdminNotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return "just now"; // Clock skew
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllRead,
    clearAll,
  } = useAdminNotifications();

  const handleNotificationClick = (id: string, orderId?: string) => {
    markAsRead(id);
    setIsOpen(false);
    if (orderId) {
      navigate("/admin/orders");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 border border-orange-500/10 bg-neutral-950 p-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSound();
              }}
              title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-neutral-500" />
              )}
            </button>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllRead();
                }}
                title="Mark all as read"
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}

            {/* Clear All */}
            {notifications.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                title="Clear all"
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable list */}
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-neutral-900 p-4 text-neutral-600 border border-neutral-800/50 mb-3">
                <Bell className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-400">
                All caught up!
              </h4>
              <p className="mt-1 text-xs text-neutral-500 max-w-[200px]">
                Realtime order alerts will appear here as they come in.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-900">
              {notifications.map((n) => {
                const prodSummary = n.products
                  ? n.products.map((p) => `${p.quantity}x ${p.name}`).join(", ")
                  : "";

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, n.orderId)}
                    className={`relative flex cursor-pointer gap-3 p-4 transition-colors hover:bg-neutral-900/60 ${
                      !n.isRead ? "bg-orange-500/[0.02]" : ""
                    }`}
                  >
                    {/* Unread indicator */}
                    {!n.isRead && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                        <Circle className="h-1.5 w-1.5 fill-orange-500 stroke-none" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm ${
                      !n.isRead 
                        ? "border-orange-500/20 bg-orange-950/20 text-orange-400" 
                        : "border-neutral-800 bg-neutral-900 text-neutral-400"
                    }`}>
                      <ShoppingBag className="h-4 w-4" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-orange-500 tracking-wider uppercase">
                          New Order
                        </span>
                        <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-baseline justify-between gap-1">
                        <h4 className="text-xs font-bold text-neutral-200 truncate">
                          {n.customerName || "Customer"}
                        </h4>
                        <span className="text-xs font-black text-neutral-100 shrink-0 font-mono">
                          ₹{n.amount?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-neutral-400 truncate">
                        {prodSummary || "Order details"}
                      </p>

                      <div className="mt-1 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
                        <span>{n.orderNumber || `#${n.orderId?.substring(0, 8)}`}</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 text-[9px]">
                          {n.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-neutral-850 bg-neutral-950 p-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                navigate("/admin/orders");
              }}
              className="w-full text-xs text-neutral-400 hover:text-orange-400 hover:bg-neutral-900 flex items-center justify-center gap-1.5"
            >
              <span>Go to Orders Panel</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
