import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import {
    Search,
    Download,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    DollarSign,
    Car,
    Calendar,
    ArrowLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { allCustomers, allOrders, allPayments } from "@/data/adminMockData";
import { Customer } from "@/types/admin";

const AdminCustomers = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>(allCustomers);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // If we have an ID, show customer detail
    if (id) {
        const customer = customers.find((c) => c.id === id);

        if (!customer) {
            return (
                <AdminLayout>
                    <div className="flex flex-col items-center justify-center py-20">
                        <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
                        <p className="text-muted-foreground mb-4">The customer you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate("/admin/customers")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Customers
                        </Button>
                    </div>
                </AdminLayout>
            );
        }

        const customerOrders = allOrders.filter((o) => o.customerId === id);
        const customerPayments = allPayments.filter((p) => p.userId === id);

        return (
            <AdminLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/customers")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                            <p className="text-muted-foreground">Customer Profile</p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Customer Info Card */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-12 w-12 rounded-full bg-gradient-flame flex items-center justify-center">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p>{customer.name}</p>
                                        <p className="text-sm font-normal text-muted-foreground">{customer.id}</p>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Customer since {customer.createdAt}</span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 rounded-lg bg-muted">
                                        <p className="text-2xl font-bold text-primary">{customer.ordersCount}</p>
                                        <p className="text-xs text-muted-foreground">Orders</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-muted">
                                        <p className="text-2xl font-bold text-green-500">₹{(customer.lifetimeValue / 1000).toFixed(1)}K</p>
                                        <p className="text-xs text-muted-foreground">Lifetime Value</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" className="flex-1" size="sm">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <Tabs defaultValue="orders">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="orders">Orders</TabsTrigger>
                                    <TabsTrigger value="payments">Payments</TabsTrigger>
                                    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                                    <TabsTrigger value="addresses">Addresses</TabsTrigger>
                                </TabsList>

                                {/* Orders Tab */}
                                <TabsContent value="orders" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Order History</CardTitle>
                                            <CardDescription>{customerOrders.length} total orders</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {customerOrders.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    No orders found for this customer
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Order ID</TableHead>
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead className="text-right">Total</TableHead>
                                                            <TableHead></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {customerOrders.map((order) => (
                                                            <TableRow key={order.id}>
                                                                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                                                <TableCell>{order.date}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="secondary">{order.status}</Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    ₹{order.total.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Link to={`/admin/orders`}>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Payments Tab */}
                                <TabsContent value="payments" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment History</CardTitle>
                                            <CardDescription>{customerPayments.length} total payments</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {customerPayments.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    No payments found for this customer
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Payment ID</TableHead>
                                                            <TableHead>Order</TableHead>
                                                            <TableHead>Method</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead className="text-right">Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {customerPayments.map((payment) => (
                                                            <TableRow key={payment.id}>
                                                                <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                                                                <TableCell className="font-mono text-xs">{payment.orderId}</TableCell>
                                                                <TableCell>{payment.paymentMethod}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="secondary">{payment.paymentStatus}</Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    ₹{payment.amountReceived.toLocaleString()}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Vehicles Tab */}
                                <TabsContent value="vehicles" className="mt-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Saved Vehicles</CardTitle>
                                                <CardDescription>{customer.vehicles.length} vehicles registered</CardDescription>
                                            </div>
                                            <Button size="sm">
                                                <Car className="mr-2 h-4 w-4" />
                                                Add Vehicle
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {customer.vehicles.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    No vehicles saved
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {customer.vehicles.map((vehicle) => (
                                                        <div
                                                            key={vehicle.id}
                                                            className="flex items-center justify-between p-4 rounded-lg border border-border"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                    <Car className="h-6 w-6 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {vehicle.make} {vehicle.model}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {vehicle.year} • {vehicle.registrationNumber || "No registration"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Addresses Tab */}
                                <TabsContent value="addresses" className="mt-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Saved Addresses</CardTitle>
                                                <CardDescription>{customer.addresses.length} addresses saved</CardDescription>
                                            </div>
                                            <Button size="sm">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                Add Address
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {customer.addresses.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    No addresses saved
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {customer.addresses.map((address, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start justify-between p-4 rounded-lg border border-border"
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                    <MapPin className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{address.name}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {address.line1}
                                                                        {address.line2 && `, ${address.line2}`}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {address.city}, {address.state} {address.postalCode}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Customer List View
    const stats = useMemo(() => {
        const totalCustomers = customers.length;
        const totalValue = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
        const avgOrderValue = totalValue / customers.reduce((sum, c) => sum + c.ordersCount, 0);
        const newThisMonth = customers.filter(c => c.createdAt?.startsWith('2025-01')).length;
        return { totalCustomers, totalValue, avgOrderValue, newThisMonth };
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        const query = searchQuery.toLowerCase();
        return customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(query) ||
                customer.email.toLowerCase().includes(query) ||
                customer.phone.includes(query) ||
                customer.id.toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredCustomers.slice(start, end);
    }, [filteredCustomers, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredCustomers.length / pageSize);

    const handleDeleteCustomer = (customerId: string) => {
        setCustomers(customers.filter((c) => c.id !== customerId));
        toast.success("Customer deleted successfully");
    };

    const handleExport = () => {
        toast.success("Export functionality coming soon");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                        <p className="text-muted-foreground">Manage your customer database</p>
                    </div>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lifetime Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{(stats.totalValue / 100000).toFixed(1)}L</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{stats.newThisMonth}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Customers Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-center">Orders</TableHead>
                                        <TableHead className="text-right">Lifetime Value</TableHead>
                                        <TableHead>Last Order</TableHead>
                                        <TableHead className="w-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCustomers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No customers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedCustomers.map((customer) => (
                                            <TableRow
                                                key={customer.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{customer.id}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm">{customer.email}</p>
                                                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{customer.ordersCount}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ₹{customer.lifetimeValue.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {customer.lastOrderDate || "—"}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/customers/${customer.id}`)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Send Email
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDeleteCustomer(customer.id)}
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
                            Showing {paginatedCustomers.length} of {filteredCustomers.length} customers
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
            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;
