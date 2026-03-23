import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    Dialog,
    DialogContent,
    DialogDescription,
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
    ArrowLeft,
    CheckCircle,
    Search,
    Calendar,
    Package,
    Eye,
    ArrowUpDown,
    XCircle,
    CreditCard,
    Banknote,
    Filter,
} from "lucide-react";
import { fetchAdminOrders } from "@/lib/api";
import { Order, PaymentStatus } from "@/types/admin";

// Status color helpers
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

// Get product summary from order items
const getProductSummary = (order: Order): string => {
    return order.items.map(item => `${item.productName.split(' ').slice(0, 2).join(' ')} ×${item.quantity}`).join(', ');
};

// Determine payment method from order (mock logic)
const getPaymentMethod = (order: Order): 'Online' | 'COD' => {
    // For demo: odd order IDs are COD, even are Online
    const orderNum = parseInt(order.id.split('-').pop() || '0');
    return orderNum % 2 === 0 ? 'Online' : 'COD';
};

const AdminOrderHistory = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"latest" | "amount">("latest");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filter for Delivered and Completed orders only
    useEffect(() => {
        setIsLoading(true);
        fetchAdminOrders()
            .then((data) => {
                const all = data.orders || [];
                const completedOrders = all.filter(
                    (o: Order) => ["DELIVERED", "COMPLETED", "CANCELLED", "RETURNED"].includes(o.orderStatus)
                );
                setOrders(completedOrders);
            })
            .catch((err) => console.error("Failed to load order history:", err))
            .finally(() => setIsLoading(false));
    }, []);

    // Filter and sort orders
    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (o) =>
                    o.id.toLowerCase().includes(query) ||
                    o.userName.toLowerCase().includes(query) ||
                    o.userEmail.toLowerCase().includes(query)
            );
        }

        // Date filter
        if (dateFrom) {
            filtered = filtered.filter((o) => new Date(o.updatedAt) >= new Date(dateFrom));
        }
        if (dateTo) {
            filtered = filtered.filter((o) => new Date(o.updatedAt) <= new Date(dateTo + "T23:59:59"));
        }

        // Payment method filter
        if (paymentMethodFilter !== "all") {
            filtered = filtered.filter((o) => getPaymentMethod(o) === paymentMethodFilter);
        }

        // Sort
        if (sortBy === "latest") {
            filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        } else if (sortBy === "amount") {
            filtered.sort((a, b) => b.totalAmount - a.totalAmount);
        }

        return filtered;
    }, [orders, searchQuery, dateFrom, dateTo, paymentMethodFilter, sortBy]);

    // Reset filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setDateFrom("");
        setDateTo("");
        setPaymentMethodFilter("all");
        setSortBy("latest");
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const deliveredCount = orders.filter((o) => ["DELIVERED", "COMPLETED"].includes(o.orderStatus)).length;
    const cancelledCount = orders.filter((o) => ["CANCELLED", "RETURNED"].includes(o.orderStatus)).length;
    const totalRevenue = orders
        .filter((o) => ["DELIVERED", "COMPLETED"].includes(o.orderStatus) && o.paymentStatus === "PAID")
        .reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/orders">
                            <Button variant="outline" size="icon" className="h-10 w-10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                            <p className="text-muted-foreground mt-1">
                                Completed orders successfully delivered to customers
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-green-500/30">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-12" />
                                ) : (
                                    <p className="text-2xl font-bold text-green-500">{deliveredCount}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Delivered</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/30">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-12" />
                                ) : (
                                    <p className="text-2xl font-bold text-red-500">{cancelledCount}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Cancelled</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/30">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <p className="text-2xl font-bold text-primary">
                                        ₹{(totalRevenue / 1000).toFixed(0)}K
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="h-5 w-5" />
                            Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Order ID or Customer..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Date From */}
                            <div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Date To */}
                            <div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Payment Method Filter */}
                            <div>
                                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Payment Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payments</SelectItem>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="COD">COD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort By */}
                            <div className="flex gap-2">
                                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "latest" | "amount")}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">Latest Delivered</SelectItem>
                                        <SelectItem value="amount">Highest Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" onClick={handleResetFilters} className="px-3">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Completed Orders</CardTitle>
                        <CardDescription>
                            Showing {filteredOrders.length} of {orders.length} completed orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-28" />
                                        <Skeleton className="h-12 w-32" />
                                        <Skeleton className="h-12 flex-1" />
                                        <Skeleton className="h-12 w-24" />
                                        <Skeleton className="h-12 w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Completed Orders Found</h3>
                                <p className="text-muted-foreground text-center max-w-sm">
                                    {searchQuery || dateFrom || dateTo || paymentMethodFilter !== "all"
                                        ? "No orders match your search criteria. Try adjusting your filters."
                                        : "Completed orders will appear here once delivered."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="max-w-[200px]">Product Summary</TableHead>
                                            <TableHead>Order Date</TableHead>
                                            <TableHead>Delivered</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="w-12">View</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => {
                                            const paymentMethod = getPaymentMethod(order);
                                            return (
                                                <TableRow key={order.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{order.userName}</p>
                                                            <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px]">
                                                        <p className="text-sm text-muted-foreground truncate" title={getProductSummary(order)}>
                                                            {getProductSummary(order)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
                                                    <TableCell className="text-sm">{formatDate(order.updatedAt)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            {paymentMethod === 'Online' ? (
                                                                <CreditCard className="h-3 w-3 text-blue-400" />
                                                            ) : (
                                                                <Banknote className="h-3 w-3 text-green-400" />
                                                            )}
                                                            <span className="text-xs">{paymentMethod}</span>
                                                        </div>
                                                        <Badge className={`mt-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                            {order.paymentStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                ["DELIVERED", "COMPLETED"].includes(order.orderStatus)
                                                                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                                                                    : "bg-red-500/20 text-red-400 border-red-500/50"
                                                            }
                                                        >
                                                            {order.orderStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-primary">
                                                        ₹{order.totalAmount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setIsDetailOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Detail Dialog - Read Only */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl">
                        {selectedOrder && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        Order {selectedOrder.id}
                                        <Badge
                                            className={
                                                ["DELIVERED", "COMPLETED"].includes(selectedOrder.orderStatus)
                                                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                                                    : "bg-red-500/20 text-red-400 border-red-500/50"
                                            }
                                        >
                                            {selectedOrder.orderStatus}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        {["DELIVERED", "COMPLETED"].includes(selectedOrder.orderStatus) ? "Delivered" : "Cancelled/Returned"} on{" "}
                                        {formatDate(selectedOrder.updatedAt)}
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
                                            <div className="flex items-center gap-2 mb-1">
                                                {getPaymentMethod(selectedOrder) === 'Online' ? (
                                                    <CreditCard className="h-4 w-4 text-blue-400" />
                                                ) : (
                                                    <Banknote className="h-4 w-4 text-green-400" />
                                                )}
                                                <span className="text-sm">{getPaymentMethod(selectedOrder)}</span>
                                            </div>
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
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                                            {selectedOrder.shippingAddress.postalCode}<br />
                                            {selectedOrder.shippingAddress.phone}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Items Ordered</h4>
                                        <div className="space-y-2">
                                            {selectedOrder.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">{item.productName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium">₹{item.total.toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-border">
                                        <span className="font-medium">Total Amount</span>
                                        <span className="text-xl font-bold text-primary">
                                            ₹{selectedOrder.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminOrderHistory;
