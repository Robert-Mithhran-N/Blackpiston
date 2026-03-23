import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "@/lib/api";
import { Package, ExternalLink } from "lucide-react";

// The status colors must map to the Prisma 'OrderStatus' Enum we verified earlier
const getStatusBadge = (status: string) => {
  switch (status) {
    case "NEW":
    case "CONFIRMED":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    case "PROCESSING":
    case "PACKED":
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    case "DELIVERED":
    case "COMPLETED":
      return "bg-green-500/20 text-green-500 border-green-500/30";
    case "CANCELLED":
    case "RETURNED":
      return "bg-red-500/20 text-red-500 border-red-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-500 border-zinc-500/30";
  }
};

const ProfileOrders = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => fetchMyOrders(),
  });

  const orders = data?.orders || [];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
        <p className="text-muted-foreground mt-1">
          View and track your recent purchases.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive">
          Failed to load orders. Please try again later.
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-border rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            When you place orders, they will appear here so you can easily track their status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="border border-border rounded-xl overflow-hidden bg-background"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-muted/30 border-b border-border gap-4">
                <div className="grid grid-cols-2 sm:flex sm:gap-8 gap-y-2 text-sm justify-between w-full sm:w-auto">
                  <div>
                    <p className="text-muted-foreground mb-0.5 text-xs uppercase tracking-wider font-semibold">Order Placed</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5 text-xs uppercase tracking-wider font-semibold">Total</p>
                    <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-muted-foreground mb-0.5 text-xs uppercase tracking-wider font-semibold">Order ID</p>
                    <p className="font-medium text-xs break-all sm:text-sm font-mono">{order.orderNumber}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center sm:block border-t border-border sm:border-0 pt-3 sm:pt-0">
                   <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.orderStatus)} inline-flex items-center justify-center min-w-[100px]`}>
                      {order.orderStatus}
                   </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-4 sm:p-5">
                <div className="space-y-4">
                  {order.products.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      {/* Image Thumbnail */}
                      <div className="h-20 w-20 flex-shrink-0 rounded-md bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center p-2">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-zinc-600" />
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                           <span>Qty: {item.quantity}</span>
                           <span>₹{item.unitPrice.toLocaleString()} each</span>
                        </div>
                        {(item.variantSize || item.variantColor) && (
                          <div className="text-xs text-muted-foreground mt-1 bg-zinc-800/50 inline-block px-2 py-0.5 rounded border border-zinc-700/50">
                            {item.variantSize && `Size: ${item.variantSize}`}
                            {item.variantColor && ` • Color: ${item.variantColor}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileOrders;
