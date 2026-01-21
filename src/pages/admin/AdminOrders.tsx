import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { toast } from "sonner";
import { orders as allOrders } from "@/data/adminMockData";
import { Order, OrderStatus, PaymentStatus } from "@/types/admin";

// Status color helpers
const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
        case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
        case "Processing": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
        case "Shipped": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
        case "Delivered": return "bg-green-500/20 text-green-400 border-green-500/50";
        case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/50";
        default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case "Paid": return "bg-green-500/20 text-green-400 border-green-500/50";
        case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
        case "Failed": return "bg-red-500/20 text-red-400 border-red-500/50";
        case "Refunded": return "bg-gray-500/20 text-gray-400 border-gray-500/50";
        default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
};

const AdminOrders = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filter for Pending and Processing orders only (active orders)
    useEffect(() => {
        const timer = setTimeout(() => {
            const activeOrders = allOrders.filter(
                (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing" || o.orderStatus === "Shipped"
            );
            setOrders(activeOrders);
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const pendingCount = orders.filter((o) => o.orderStatus === "Pending").length;
    const processingCount = orders.filter((o) => o.orderStatus === "Processing").length;
    const shippedCount = orders.filter((o) => o.orderStatus === "Shipped").length;

    // Update order status
    const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId ? { ...o, orderStatus: newStatus, updatedAt: new Date().toISOString() } : o
            )
        );
        if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }
        toast.success(`Order status updated to ${newStatus}`);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

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
                            <p className="text-muted-foreground mt-1">Manage pending and new orders</p>
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

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Showing only pending, processing, and shipped orders</CardDescription>
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
                        ) : orders.length === 0 ? (
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
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Order Date</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="w-16">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-muted/50">
                                                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{order.userName}</p>
                                                        <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                        {order.paymentStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getOrderStatusColor(order.orderStatus)}>
                                                        {order.orderStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    ₹{order.totalAmount.toLocaleString()}
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
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Processing")}>
                                                                <Package className="mr-2 h-4 w-4" />
                                                                Mark Processing
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Shipped")}>
                                                                <Truck className="mr-2 h-4 w-4" />
                                                                Mark Shipped
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Delivered")}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                Mark Delivered
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleUpdateStatus(order.id, "Cancelled")}
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

                {/* Order Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl">
                        {selectedOrder && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        Order {selectedOrder.id}
                                        <Badge className={getOrderStatusColor(selectedOrder.orderStatus)}>
                                            {selectedOrder.orderStatus}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Placed on {formatDate(selectedOrder.createdAt)}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Customer</h4>
                                            <p className="text-sm">{selectedOrder.userName}</p>
                                            <p className="text-xs text-muted-foreground">{selectedOrder.userEmail}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Payment</h4>
                                            <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                                                {selectedOrder.paymentStatus}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedOrder.shippingAddress.name}<br />
                                            {selectedOrder.shippingAddress.line1}<br />
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                                            {selectedOrder.shippingAddress.phone}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Items</h4>
                                        <div className="space-y-2">
                                            {selectedOrder.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                                    <div>
                                                        <p className="text-sm font-medium">{item.productName}</p>
                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium">₹{item.total.toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-border">
                                        <span className="font-medium">Total Amount</span>
                                        <span className="text-xl font-bold">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                        Close
                                    </Button>
                                    <Select
                                        value={selectedOrder.orderStatus}
                                        onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value as OrderStatus)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Update Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Processing">Processing</SelectItem>
                                            <SelectItem value="Shipped">Shipped</SelectItem>
                                            <SelectItem value="Delivered">Delivered</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
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
