import { toast } from "sonner";
import { AdminNotification } from "@/types/admin";
import { ShoppingBag, ArrowRight, X } from "lucide-react";

interface OrderToastProps {
  notification: AdminNotification;
  onClick?: () => void;
  toastId: string | number;
}

export const OrderToast = ({ notification, onClick, toastId }: OrderToastProps) => {
  const productsSummary = notification.products
    ? notification.products.map((p) => `${p.quantity}x ${p.name}`).join(", ")
    : "Products details";

  return (
    <div
      onClick={() => {
        if (onClick) onClick();
        toast.dismiss(toastId);
      }}
      className="relative flex w-full max-w-md cursor-pointer overflow-hidden rounded-xl border border-orange-500/20 bg-neutral-950 p-4 shadow-[0_4px_20px_rgba(249,115,22,0.15)] transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_4px_25px_rgba(249,115,22,0.25)] group"
    >
      {/* Accent fiery glow gradient line at the top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500" />

      {/* Icon section with metallic circle */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-orange-500 shadow-inner group-hover:scale-105 transition-transform duration-200">
        <ShoppingBag className="h-6 w-6 animate-pulse" />
      </div>

      {/* Content section */}
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
            New Order Received
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">
            {notification.orderNumber || `#${notification.orderId?.substring(0, 8)}`}
          </span>
        </div>

        <h4 className="mt-1 text-sm font-bold text-neutral-100">
          {notification.customerName || "Anonymous Guest"}
        </h4>

        <p className="mt-1 line-clamp-1 text-xs text-neutral-400">
          {productsSummary}
        </p>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xs text-neutral-500">Total:</span>
            <span className="text-sm font-black text-orange-500 font-mono">
              ₹{notification.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center text-[11px] font-medium text-orange-500/80 group-hover:text-orange-400 transition-colors">
            <span>View Order</span>
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toast.dismiss(toastId);
        }}
        className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300 transition-colors p-1 rounded-md hover:bg-neutral-900"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export function showOrderToast(notification: AdminNotification, onClick?: () => void) {
  toast.custom(
    (t) => (
      <OrderToast
        notification={notification}
        onClick={onClick}
        toastId={t}
      />
    ),
    {
      duration: 8000,
      position: "top-right",
    }
  );
}
