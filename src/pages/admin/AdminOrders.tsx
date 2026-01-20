import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Search,
    Download,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    FileText,
    Package,
    Truck,
    Printer,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { allOrders, orderStatusOptions, paymentStatusOptions } from "@/data/adminMockData";
import { Order, OrderStatus } from "@/types/admin";

// Order Status Stepper Steps
const orderSteps: OrderStatus[] = ['New', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Closed'];

// Status colors
const getOrderStatusColor = (status: string) => {
    switch (status) {
        case 'New': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'Confirmed': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50';
        case 'Packed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
        case 'Delivered': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case 'Paid': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Partial': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
        case 'Refunded': return 'bg-red-500/20 text-red-400 border-red-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

// Order Workflow Stepper Component
const OrderStepper = ({ currentStatus }: { currentStatus: OrderStatus }) => {
    const currentIndex = orderSteps.indexOf(currentStatus);
    const isCancelled = currentStatus === 'Cancelled';

    if (isCancelled) {
        return (
            <div className="flex items-center gap-2 text-red-500">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Order Cancelled</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {orderSteps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                  h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${!isCompleted && !isCurrent ? 'border-border text-muted-foreground' : ''}
                `}
                            >
                                {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <span className={`text-xs mt-1 whitespace-nowrap ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                {step}
                            </span>
                        </div>
                        {index < orderSteps.length - 1 && (
                            <div
                                className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-border'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>(allOrders);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Calculate stats
    const stats = useMemo(() => {
        const total = orders.length;
        const newOrders = orders.filter(o => o.status === 'New').length;
        const pendingPayment = orders.filter(o => o.paymentStatus === 'Pending').length;
        const shipped = orders.filter(o => o.status === 'Shipped').length;
        return { total, newOrders, pendingPayment, shipped };
    }, [orders]);

    // Filter orders
    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (order) =>
                    order.id.toLowerCase().includes(query) ||
                    order.customerName.toLowerCase().includes(query) ||
                    order.customerEmail.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        if (paymentFilter !== "all") {
            filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
        }

        return filtered;
    }, [orders, searchQuery, statusFilter, paymentFilter]);

    // Pagination
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredOrders.slice(start, end);
    }, [filteredOrders, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredOrders.length / pageSize);

    // Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOrders(paginatedOrders.map((o) => o.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleSelectOrder = (orderId: string, checked: boolean) => {
        if (checked) {
            setSelectedOrders([...selectedOrders, orderId]);
        } else {
            setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
        }
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        toast.success(`Order ${orderId} status updated to ${newStatus}`);
    };

    const handleDeleteOrder = (orderId: string) => {
        setOrders(orders.filter((o) => o.id !== orderId));
        toast.success(`Order ${orderId} deleted`);
    };

    const handleExport = () => {
        toast.success("Export functionality coming soon");
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setPaymentFilter("all");
        setCurrentPage(1);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                        <p className="text-muted-foreground">Manage and fulfill customer orders</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.newOrders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{stats.pendingPayment}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                            <Truck className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-500">{stats.shipped}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search orders by ID, customer name, or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {orderStatusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Payment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payments</SelectItem>
                                        {paymentStatusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(searchQuery || statusFilter !== "all" || paymentFilter !== "all") && (
                                    <Button variant="ghost" onClick={clearFilters} className="gap-1">
                                        <X className="h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedOrders.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg bg-muted flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {selectedOrders.length} order(s) selected
                                </span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print Labels
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Invoices
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Selected
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={
                                                    paginatedOrders.length > 0 &&
                                                    selectedOrders.length === paginatedOrders.length
                                                }
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedOrders.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedOrders.includes(order.id)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectOrder(order.id, checked as boolean)
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="font-mono text-xs font-medium">
                                                    {order.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{order.customerName}</p>
                                                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{order.date}</TableCell>
                                                <TableCell>
                                                    <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                        {order.paymentStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ₹{order.total.toLocaleString()}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Order
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Invoice
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Printer className="mr-2 h-4 w-4" />
                                                                Pack Slip
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDeleteOrder(order.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Showing {paginatedOrders.length} of {filteredOrders.length} orders
                        </span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* Order Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        {selectedOrder && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        Order {selectedOrder.id}
                                        <Badge className={getOrderStatusColor(selectedOrder.status)}>
                                            {selectedOrder.status}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Placed on {selectedOrder.date} by {selectedOrder.customerName}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Order Workflow Stepper */}
                                    <div className="p-4 rounded-lg border border-border bg-muted/30">
                                        <h4 className="text-sm font-medium mb-4">Order Status</h4>
                                        <OrderStepper currentStatus={selectedOrder.status} />
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {/* Customer Info */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Customer Information</h4>
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="font-medium">{selectedOrder.customerName}</p>
                                                <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                                                <Link
                                                    to={`/admin/customers/${selectedOrder.customerId}`}
                                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                                                >
                                                    View Profile <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Shipping Address</h4>
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedOrder.shippingAddress.line1}
                                                    {selectedOrder.shippingAddress.line2 && `, ${selectedOrder.shippingAddress.line2}`}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                                                    {selectedOrder.shippingAddress.postalCode}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedOrder.shippingAddress.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Order Items</h4>
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead>SKU</TableHead>
                                                        <TableHead className="text-right">Price</TableHead>
                                                        <TableHead className="text-right">Qty</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedOrder.items.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                                            <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                                                            <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                ₹{item.total.toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Billing Summary */}
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Shipping</h4>
                                            <div className="p-4 rounded-lg border border-border space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Carrier</span>
                                                    <span>{selectedOrder.carrier || "Not selected"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tracking</span>
                                                    <span className="font-mono text-xs">
                                                        {selectedOrder.trackingNumber || "—"}
                                                    </span>
                                                </div>
                                                <Separator />
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Truck className="mr-2 h-4 w-4" />
                                                        Update Shipping
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Print Label
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Billing Summary</h4>
                                            <div className="p-4 rounded-lg border border-border space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tax</span>
                                                    <span>₹{selectedOrder.tax.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span>{selectedOrder.shipping > 0 ? `₹${selectedOrder.shipping.toLocaleString()}` : "Free"}</span>
                                                </div>
                                                {selectedOrder.discount > 0 && (
                                                    <div className="flex justify-between text-green-500">
                                                        <span>Discount</span>
                                                        <span>-₹{selectedOrder.discount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <Separator />
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span>₹{selectedOrder.total.toLocaleString()}</span>
                                                </div>
                                                <Badge className={`w-full justify-center ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                                                    Payment: {selectedOrder.paymentStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {selectedOrder.notes && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Order Notes</h4>
                                            <div className="p-4 rounded-lg border border-border bg-muted/30">
                                                <p className="text-sm">{selectedOrder.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-between pt-4 border-t">
                                        <div className="flex gap-2">
                                            <Button variant="outline">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Invoice
                                            </Button>
                                            <Button variant="outline">
                                                <Printer className="mr-2 h-4 w-4" />
                                                Pack Slip
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Select
                                                value={selectedOrder.status}
                                                onValueChange={(value) => {
                                                    handleUpdateStatus(selectedOrder.id, value as OrderStatus);
                                                    setSelectedOrder({ ...selectedOrder, status: value as OrderStatus });
                                                }}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orderStatusOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button className="bg-gradient-flame hover:opacity-90">
                                                Save Changes
                                            </Button>
                                        </div>
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

export default AdminOrders;
