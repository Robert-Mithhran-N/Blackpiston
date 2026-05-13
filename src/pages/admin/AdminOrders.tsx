import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ShoppingCart,
    Clock,
    ArrowLeft,
    MoreHorizontal,
    Eye,
    Truck,
    CheckCircle,
    Package,
    History,
    XCircle,
    Search,
    FileText,
    MapPin,
    CreditCard,
    User,
    ChevronRight,
    Download,
    PackageCheck,
    ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAdminOrders, updateOrderStatus as apiUpdateOrderStatus, markCODReceived } from "@/lib/api";
import { Order, OrderStatus, PaymentStatus } from "@/types/admin";
import jsPDF from "jspdf";

// ============================================================
// Status Helpers
// ============================================================

const ORDER_STATUS_FLOW: OrderStatus[] = [
    "NEW", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"
];

const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
        case "NEW":
        case "CONFIRMED": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
        case "PROCESSING":
        case "PACKED": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
        case "SHIPPED":
        case "OUT_FOR_DELIVERY": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
        case "DELIVERED":
        case "COMPLETED": return "bg-green-500/20 text-green-400 border-green-500/50";
        case "CANCELLED":
        case "RETURNED": return "bg-red-500/20 text-red-400 border-red-500/50";
        default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case "PAID": return "bg-green-500/20 text-green-400 border-green-500/50";
        case "PENDING":
        case "PROCESSING": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
        case "FAILED": return "bg-red-500/20 text-red-400 border-red-500/50";
        case "REFUNDED":
        case "PARTIALLY_REFUNDED": return "bg-gray-500/20 text-gray-400 border-gray-500/50";
        default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "NEW": return <ClipboardList className="h-4 w-4" />;
        case "CONFIRMED": return <CheckCircle className="h-4 w-4" />;
        case "PROCESSING": return <Package className="h-4 w-4" />;
        case "PACKED": return <PackageCheck className="h-4 w-4" />;
        case "SHIPPED": return <Truck className="h-4 w-4" />;
        case "OUT_FOR_DELIVERY": return <Truck className="h-4 w-4" />;
        case "DELIVERED": return <CheckCircle className="h-4 w-4" />;
        case "COMPLETED": return <CheckCircle className="h-4 w-4" />;
        case "CANCELLED": return <XCircle className="h-4 w-4" />;
        case "RETURNED": return <XCircle className="h-4 w-4" />;
        default: return <Clock className="h-4 w-4" />;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// PDF-safe price formatter — jsPDF's default fonts can't render ₹
const formatPricePDF = (n: number) =>
    "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// ============================================================
// Helper: Normalize order from API (handles field name mismatches)
// ============================================================
function normalizeOrder(raw: any): Order {
    return {
        id: raw.id,
        orderNumber: raw.orderNumber || raw.id?.slice(-8) || "—",
        userId: raw.userId,
        user: raw.user,
        userName: raw.userName || raw.user?.name || "Unknown",
        userEmail: raw.userEmail || raw.user?.email || "",
        products: raw.products || raw.items?.map((item: any) => ({
            productId: item.productId || item.id,
            name: item.name || item.productName,
            sku: item.sku || "",
            image: item.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.price,
            totalPrice: item.totalPrice || item.total || (item.unitPrice || item.price) * item.quantity,
            variantSize: item.variantSize,
            variantColor: item.variantColor,
        })) || [],
        subtotal: raw.subtotal || raw.totalAmount || 0,
        shippingCost: raw.shippingCost || 0,
        taxAmount: raw.taxAmount || 0,
        discountAmount: raw.discountAmount || 0,
        totalAmount: raw.totalAmount || 0,
        couponCode: raw.couponCode,
        paymentMethod: raw.paymentMethod || "COD",
        paymentStatus: raw.paymentStatus || "PENDING",
        orderStatus: raw.orderStatus || "NEW",
        shippingAddress: raw.shippingAddress ? {
            name: raw.shippingAddress.name,
            phone: raw.shippingAddress.phone,
            street: raw.shippingAddress.street || raw.shippingAddress.line1,
            city: raw.shippingAddress.city,
            state: raw.shippingAddress.state,
            pincode: raw.shippingAddress.pincode || raw.shippingAddress.postalCode,
            country: raw.shippingAddress.country,
        } : undefined,
        billingAddress: raw.billingAddress,
        tracking: raw.tracking,
        statusHistory: raw.statusHistory || [],
        notes: raw.notes,
        orderedAt: raw.orderedAt || raw.createdAt,
        confirmedAt: raw.confirmedAt,
        shippedAt: raw.shippedAt,
        deliveredAt: raw.deliveredAt,
        completedAt: raw.completedAt,
        cancelledAt: raw.cancelledAt,
        cancellationReason: raw.cancellationReason,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

// ============================================================
// Invoice PDF Generator
// ============================================================
function generateInvoicePDF(order: Order) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BLACKPISTON GARAGE", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Premium Motorcycle Gear & Accessories", 14, y);
    y += 6;
    doc.text("www.blackpistongarage.com", 14, y);

    // Invoice title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`#${order.orderNumber}`, pageWidth - 14, 28, { align: "right" });
    doc.text(`Date: ${formatDate(order.orderedAt || order.createdAt)}`, pageWidth - 14, 35, { align: "right" });

    y += 12;
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;

    // Customer Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(order.userName || "—", 14, y);
    y += 5;
    doc.text(order.userEmail || "", 14, y);
    if (order.shippingAddress) {
        y += 5;
        const addr = order.shippingAddress;
        if (addr.street) { doc.text(addr.street, 14, y); y += 5; }
        const cityLine = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
        if (cityLine) { doc.text(cityLine, 14, y); y += 5; }
        if (addr.phone) { doc.text(`Phone: ${addr.phone}`, 14, y); y += 5; }
    }

    // Payment Info
    doc.setFont("helvetica", "bold");
    doc.text("Payment:", pageWidth / 2 + 10, y - 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Method: ${order.paymentMethod}`, pageWidth / 2 + 10, y - 14);
    doc.text(`Status: ${order.paymentStatus}`, pageWidth / 2 + 10, y - 8);

    y += 10;
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Products Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Product", 14, y);
    doc.text("Variant", 90, y);
    doc.text("Qty", 130, y, { align: "center" });
    doc.text("Price", 155, y, { align: "right" });
    doc.text("Total", pageWidth - 14, y, { align: "right" });
    y += 3;
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    // Products
    doc.setFont("helvetica", "normal");
    (order.products || []).forEach((item) => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }
        doc.text(item.name.substring(0, 35), 14, y);
        const variant = [item.variantColor, item.variantSize].filter(Boolean).join(" / ");
        doc.text(variant || "—", 90, y);
        doc.text(String(item.quantity), 130, y, { align: "center" });
        doc.text(formatPricePDF(item.unitPrice), 155, y, { align: "right" });
        doc.text(formatPricePDF(item.totalPrice), pageWidth - 14, y, { align: "right" });
        y += 7;
    });

    y += 5;
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Totals
    const totalsX = pageWidth - 14;
    doc.text("Subtotal:", totalsX - 50, y);
    doc.text(formatPricePDF(order.subtotal), totalsX, y, { align: "right" });
    y += 6;
    if (order.shippingCost > 0) {
        doc.text("Shipping:", totalsX - 50, y);
        doc.text(formatPricePDF(order.shippingCost), totalsX, y, { align: "right" });
        y += 6;
    }
    if (order.taxAmount > 0) {
        doc.text("Tax:", totalsX - 50, y);
        doc.text(formatPricePDF(order.taxAmount), totalsX, y, { align: "right" });
        y += 6;
    }
    if (order.discountAmount > 0) {
        doc.text("Discount:", totalsX - 50, y);
        doc.setTextColor(0, 150, 0);
        doc.text(`-${formatPricePDF(order.discountAmount)}`, totalsX, y, { align: "right" });
        doc.setTextColor(0);
        y += 6;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", totalsX - 50, y);
    doc.text(formatPricePDF(order.totalAmount), totalsX, y, { align: "right" });

    // Footer
    y += 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("Thank you for shopping with BlackPiston Garage!", pageWidth / 2, y, { align: "center" });

    doc.save(`Invoice-${order.orderNumber}.pdf`);
}

// ============================================================
// Order Timeline Component
// ============================================================
function OrderTimeline({ order }: { order: Order }) {
    // Build timeline from statusHistory or from order timestamps
    const timelineEntries: { status: string; timestamp: string; note?: string }[] = [];

    if (order.statusHistory && order.statusHistory.length > 0) {
        order.statusHistory.forEach(entry => {
            timelineEntries.push({
                status: entry.status,
                timestamp: entry.timestamp,
                note: entry.note,
            });
        });
    } else {
        // Fallback: reconstruct from order timestamps
        timelineEntries.push({ status: "NEW", timestamp: order.orderedAt || order.createdAt });
        if (order.confirmedAt) timelineEntries.push({ status: "CONFIRMED", timestamp: order.confirmedAt });
        if (order.shippedAt) timelineEntries.push({ status: "SHIPPED", timestamp: order.shippedAt });
        if (order.deliveredAt) timelineEntries.push({ status: "DELIVERED", timestamp: order.deliveredAt });
        if (order.completedAt) timelineEntries.push({ status: "COMPLETED", timestamp: order.completedAt });
        if (order.cancelledAt) timelineEntries.push({ status: "CANCELLED", timestamp: order.cancelledAt });
    }

    // Sort by timestamp
    timelineEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.orderStatus);

    return (
        <div className="space-y-0">
            {timelineEntries.map((entry, i) => {
                const isActive = ORDER_STATUS_FLOW.indexOf(entry.status as OrderStatus) <= currentIndex;
                const isCurrent = entry.status === order.orderStatus;
                const isCancelled = entry.status === "CANCELLED" || entry.status === "RETURNED";

                return (
                    <div key={i} className="flex gap-3 relative">
                        {/* Vertical line */}
                        {i < timelineEntries.length - 1 && (
                            <div className={`absolute left-[11px] top-[24px] w-0.5 h-[calc(100%-8px)] ${
                                isActive ? "bg-primary/50" : "bg-border"
                            }`} />
                        )}
                        {/* Dot */}
                        <div className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                            isCancelled ? "bg-red-500/20 text-red-400" :
                            isCurrent ? "bg-primary/20 text-primary ring-2 ring-primary/30" :
                            isActive ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                        }`}>
                            {getStatusIcon(entry.status)}
                        </div>
                        {/* Content */}
                        <div className="pb-4 flex-1">
                            <p className={`text-sm font-medium ${
                                isCurrent ? "text-primary" : isCancelled ? "text-red-400" : isActive ? "text-foreground" : "text-muted-foreground"
                            }`}>
                                {entry.status.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                            {entry.note && <p className="text-xs text-muted-foreground mt-1 italic">{entry.note}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const AdminOrders = () => {
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(searchInput), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Load orders with React Query
    const { data: rawOrders, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: fetchAdminOrders,
    });

    const orders = (rawOrders?.orders || [])
        .map(normalizeOrder)
        .filter((o: Order) => !["DELIVERED", "COMPLETED", "CANCELLED", "RETURNED"].includes(o.orderStatus));

    // Filtered orders
    const filteredOrders = orders.filter(o => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (o.orderNumber || "").toLowerCase().includes(q) ||
            (o.userName || "").toLowerCase().includes(q) ||
            (o.userEmail || "").toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q)
        );
    });

    const pendingCount = orders.filter((o) => ["NEW", "CONFIRMED"].includes(o.orderStatus)).length;
    const processingCount = orders.filter((o) => ["PROCESSING", "PACKED"].includes(o.orderStatus)).length;
    const shippedCount = orders.filter((o) => ["SHIPPED", "OUT_FOR_DELIVERY"].includes(o.orderStatus)).length;

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
            apiUpdateOrderStatus(orderId, { status }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            if (selectedOrder?.id === variables.orderId) {
                if (["DELIVERED", "COMPLETED", "CANCELLED", "RETURNED"].includes(variables.status)) {
                    setIsDetailOpen(false);
                } else {
                    setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: variables.status } : null));
                }
            }
            toast.success(`Order status updated to ${variables.status.replace(/_/g, " ")}`);
        },
        onError: () => toast.error("Failed to update order status"),
    });

    const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    // Mark COD Received mutation
    const markCODMutation = useMutation({
        mutationFn: (orderId: string) => markCODReceived(orderId),
        onSuccess: (data, orderId) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: "PAID" } : null));
            }
            toast.success("COD marked as received");
        },
        onError: (err: any) => toast.error(err.message || "Failed to mark COD as received"),
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin">
                            <Button variant="outline" size="icon" className="h-10 w-10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Active Orders</h1>
                            <p className="text-muted-foreground mt-1">Manage pending, processing, and shipped orders</p>
                        </div>
                    </div>
                    <Link to="/admin/orders/history">
                        <Button variant="outline" className="gap-2">
                            <History className="h-4 w-4" />
                            Order History
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-yellow-500/30">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-12" />
                                ) : (
                                    <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-500/30">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-12" />
                                ) : (
                                    <p className="text-2xl font-bold text-blue-500">{processingCount}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Processing</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-500/30">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Truck className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-12" />
                                ) : (
                                    <p className="text-2xl font-bold text-purple-500">{shippedCount}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Shipped</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by order #, customer..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Showing {filteredOrders.length} active order(s)</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-24" />
                                        <Skeleton className="h-12 w-32" />
                                        <Skeleton className="h-12 flex-1" />
                                        <Skeleton className="h-12 w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Active Orders</h3>
                                <p className="text-muted-foreground text-center">
                                    All orders have been processed. Check Order History for completed orders.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="w-16">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-muted/50">
                                                <TableCell className="font-mono text-xs font-medium">
                                                    #{order.orderNumber}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">{order.userName}</p>
                                                        <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {order.products?.length || 0} item(s)
                                                </TableCell>
                                                <TableCell className="text-sm">{formatDate(order.orderedAt || order.createdAt)}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                            {order.paymentStatus}
                                                        </Badge>
                                                        <p className="text-[10px] text-muted-foreground">{order.paymentMethod}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getOrderStatusColor(order.orderStatus)}>
                                                        {order.orderStatus.replace(/_/g, " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {formatPrice(order.totalAmount)}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setIsDetailOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => generateInvoicePDF(order)}>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download Invoice
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {order.paymentMethod === "COD" && order.paymentStatus !== "PAID" && (
                                                                <DropdownMenuItem
                                                                    onClick={() => markCODMutation.mutate(order.id)}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                    Mark COD Received
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Confirm
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "PROCESSING")}>
                                                                <Package className="mr-2 h-4 w-4" />
                                                                Processing
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "SHIPPED")}>
                                                                <Truck className="mr-2 h-4 w-4" />
                                                                Shipped
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "DELIVERED")}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                Delivered
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                                                className="text-red-500"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Cancel Order
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ============================================ */}
                {/* ORDER DETAIL DIALOG                          */}
                {/* ============================================ */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        {selectedOrder && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                        <span>Order #{selectedOrder.orderNumber}</span>
                                        <Badge className={getOrderStatusColor(selectedOrder.orderStatus)}>
                                            {selectedOrder.orderStatus.replace(/_/g, " ")}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Placed on {formatDateTime(selectedOrder.orderedAt || selectedOrder.createdAt)}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 py-4">
                                    {/* Grid: Customer + Payment */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Customer Info */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" /> Customer
                                            </h4>
                                            <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-1">
                                                <p className="text-sm font-medium">{selectedOrder.userName}</p>
                                                <p className="text-xs text-muted-foreground">{selectedOrder.userEmail}</p>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-primary" /> Payment
                                            </h4>
                                            <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">Method</span>
                                                    <span className="text-sm font-medium">{selectedOrder.paymentMethod}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">Status</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                                                            {selectedOrder.paymentStatus}
                                                        </Badge>
                                                        {selectedOrder.paymentMethod === "COD" && selectedOrder.paymentStatus !== "PAID" && (
                                                            <Button
                                                                size="sm"
                                                                className="h-6 text-[10px] px-2 bg-green-600 hover:bg-green-700"
                                                                onClick={() => markCODMutation.mutate(selectedOrder.id)}
                                                                disabled={markCODMutation.isPending}
                                                            >
                                                                Mark Received
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    {selectedOrder.shippingAddress && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" /> Shipping Address
                                            </h4>
                                            <div className="rounded-lg bg-muted/30 border border-border p-3">
                                                <p className="text-sm">
                                                    {selectedOrder.shippingAddress.name && <span className="font-medium">{selectedOrder.shippingAddress.name}<br /></span>}
                                                    {selectedOrder.shippingAddress.street && <>{selectedOrder.shippingAddress.street}<br /></>}
                                                    {[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state, selectedOrder.shippingAddress.pincode]
                                                        .filter(Boolean).join(", ")}
                                                    {selectedOrder.shippingAddress.phone && (
                                                        <><br />📱 {selectedOrder.shippingAddress.phone}</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Products */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <Package className="h-4 w-4 text-primary" /> Products Ordered
                                        </h4>
                                        <div className="space-y-2">
                                            {(selectedOrder.products || []).map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                                                    {item.image && (
                                                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover border border-border" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            {item.variantColor && <span>{item.variantColor}</span>}
                                                            {item.variantSize && <><ChevronRight className="h-3 w-3" /><span>{item.variantSize}</span></>}
                                                            <span>Qty: {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{formatPrice(item.totalPrice)}</p>
                                                        <p className="text-[10px] text-muted-foreground">@ {formatPrice(item.unitPrice)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" /> Order Summary
                                        </h4>
                                        <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>{formatPrice(selectedOrder.subtotal)}</span>
                                            </div>
                                            {selectedOrder.shippingCost > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span>{formatPrice(selectedOrder.shippingCost)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.taxAmount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Tax</span>
                                                    <span>{formatPrice(selectedOrder.taxAmount)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.discountAmount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}
                                                    </span>
                                                    <span className="text-green-400">-{formatPrice(selectedOrder.discountAmount)}</span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Total</span>
                                                <span className="text-xl font-bold">{formatPrice(selectedOrder.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Timeline */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" /> Order Timeline
                                        </h4>
                                        <div className="rounded-lg bg-muted/30 border border-border p-4">
                                            <OrderTimeline order={selectedOrder} />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="flex-col sm:flex-row gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => generateInvoicePDF(selectedOrder)}
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Invoice PDF
                                    </Button>
                                    <div className="flex-1" />
                                    <Select
                                        value={selectedOrder.orderStatus}
                                        onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value as OrderStatus)}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Update Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NEW">New</SelectItem>
                                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                            <SelectItem value="PROCESSING">Processing</SelectItem>
                                            <SelectItem value="PACKED">Packed</SelectItem>
                                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                                            <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            <SelectItem value="RETURNED">Returned</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
