import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Search,
    Truck,
    Package,
    Phone,
    Mail,
    MapPin,
    Globe,
    MoreHorizontal,
    Plus,
    Eye,
    Edit,
    Trash2,
    FileText,
    Star,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import { allSuppliers, purchaseOrders } from "@/data/adminMockData";
import { Supplier } from "@/types/admin";

const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 3.5) return 'text-yellow-500';
    return 'text-red-500';
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        case 'On Hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

const AdminSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>(allSuppliers);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Stats
    const stats = useMemo(() => {
        const totalSuppliers = suppliers.length;
        const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;
        const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;
        const totalPOs = purchaseOrders.length;
        return { totalSuppliers, activeSuppliers, avgRating, totalPOs };
    }, [suppliers]);

    // Filter suppliers
    const filteredSuppliers = useMemo(() => {
        if (!searchQuery) return suppliers;
        const query = searchQuery.toLowerCase();
        return suppliers.filter(
            (supplier) =>
                supplier.name.toLowerCase().includes(query) ||
                supplier.contactPerson.toLowerCase().includes(query) ||
                supplier.email.toLowerCase().includes(query)
        );
    }, [suppliers, searchQuery]);

    // Get supplier's POs
    const getSupplierPOs = (supplierId: string) => {
        return purchaseOrders.filter(po => po.supplierId === supplierId);
    };

    // Handlers
    const handleViewSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDetailOpen(true);
    };

    const handleDeleteSupplier = (supplierId: string) => {
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
        toast.success("Supplier deleted");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                        <p className="text-muted-foreground">Manage your supplier network</p>
                    </div>
                    <Button className="bg-gradient-flame hover:opacity-90" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                            <Package className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{stats.activeSuppliers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                            <Star className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                <span className={getRatingColor(stats.avgRating)}>{stats.avgRating.toFixed(1)}</span>
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active POs</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPOs}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search suppliers by name, contact, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Suppliers Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Contact Person</TableHead>
                                        <TableHead>Contact Info</TableHead>
                                        <TableHead>Categories</TableHead>
                                        <TableHead className="text-center">Rating</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSuppliers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No suppliers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSuppliers.map((supplier) => (
                                            <TableRow
                                                key={supplier.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleViewSupplier(supplier)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <Truck className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{supplier.name}</p>
                                                            <p className="text-xs text-muted-foreground">{supplier.id}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{supplier.contactPerson}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="text-sm flex items-center gap-1">
                                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                                            {supplier.email}
                                                        </p>
                                                        <p className="text-sm flex items-center gap-1">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {supplier.phone}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {supplier.categories.slice(0, 2).map((cat) => (
                                                            <Badge key={cat} variant="secondary" className="text-xs">
                                                                {cat}
                                                            </Badge>
                                                        ))}
                                                        {supplier.categories.length > 2 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{supplier.categories.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className={`font-medium ${getRatingColor(supplier.rating)}`}>
                                                            {supplier.rating.toFixed(1)}
                                                        </span>
                                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(supplier.status)}>{supplier.status}</Badge>
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewSupplier(supplier)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Create PO
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDeleteSupplier(supplier.id)}
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

                {/* Supplier Detail Modal */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        {selectedSupplier && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        {selectedSupplier.name}
                                        <Badge className={getStatusColor(selectedSupplier.status)}>
                                            {selectedSupplier.status}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>Supplier ID: {selectedSupplier.id}</DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="info">
                                    <TabsList className="w-full grid grid-cols-3">
                                        <TabsTrigger value="info">Information</TabsTrigger>
                                        <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
                                        <TabsTrigger value="products">Products</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="info" className="space-y-6 mt-4">
                                        {/* Contact Info */}
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Contact Person</h4>
                                                <div className="p-4 rounded-lg border border-border">
                                                    <p className="font-medium">{selectedSupplier.contactPerson}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            {selectedSupplier.email}
                                                        </p>
                                                        <p className="text-sm flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                            {selectedSupplier.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Address</h4>
                                                <div className="p-4 rounded-lg border border-border">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <p className="text-sm">{selectedSupplier.address.line1}</p>
                                                            {selectedSupplier.address.line2 && (
                                                                <p className="text-sm">{selectedSupplier.address.line2}</p>
                                                            )}
                                                            <p className="text-sm">
                                                                {selectedSupplier.address.city}, {selectedSupplier.address.state} {selectedSupplier.address.postalCode}
                                                            </p>
                                                            <p className="text-sm">{selectedSupplier.address.country}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Categories & Rating */}
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Categories</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedSupplier.categories.map((cat) => (
                                                        <Badge key={cat} variant="secondary">{cat}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Performance</h4>
                                                <div className="p-4 rounded-lg border border-border flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Rating</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className={`text-2xl font-bold ${getRatingColor(selectedSupplier.rating)}`}>
                                                                {selectedSupplier.rating.toFixed(1)}
                                                            </span>
                                                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                        </div>
                                                    </div>
                                                    <Separator orientation="vertical" className="h-12" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Lead Time</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{selectedSupplier.leadTimeDays} days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Terms & Notes */}
                                        <div className="space-y-3">
                                            <h4 className="font-medium">Payment Terms</h4>
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="text-sm">{selectedSupplier.paymentTerms}</p>
                                            </div>
                                        </div>

                                        {selectedSupplier.notes && (
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Notes</h4>
                                                <div className="p-4 rounded-lg border border-border bg-muted/30">
                                                    <p className="text-sm">{selectedSupplier.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="orders" className="mt-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Purchase Orders</CardTitle>
                                                <CardDescription>Orders placed with this supplier</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                {getSupplierPOs(selectedSupplier.id).length === 0 ? (
                                                    <div className="p-8 text-center text-muted-foreground">
                                                        No purchase orders found
                                                    </div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>PO Number</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead className="text-right">Amount</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {getSupplierPOs(selectedSupplier.id).map((po) => (
                                                                <TableRow key={po.id}>
                                                                    <TableCell className="font-mono text-xs">{po.id}</TableCell>
                                                                    <TableCell>{po.createdAt}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="secondary">{po.status}</Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-medium">
                                                                        ₹{po.totalAmount.toLocaleString()}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="products" className="mt-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Supplied Products</CardTitle>
                                                <CardDescription>Products sourced from this supplier</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {selectedSupplier.products.map((product) => (
                                                        <div
                                                            key={product.productId}
                                                            className="flex items-center justify-between p-3 rounded-lg border border-border"
                                                        >
                                                            <div>
                                                                <p className="font-medium">{product.productName}</p>
                                                                <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                                                            </div>
                                                            <p className="font-medium">₹{product.costPrice.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                        Close
                                    </Button>
                                    <Button className="bg-gradient-flame hover:opacity-90">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Create PO
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Add Supplier Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Add New Supplier</DialogTitle>
                            <DialogDescription>Enter supplier details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input id="name" placeholder="Enter company name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact">Contact Person</Label>
                                    <Input id="contact" placeholder="Enter contact name" />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" placeholder="Enter phone number" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" placeholder="Enter full address" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="terms">Payment Terms</Label>
                                <Input id="terms" placeholder="e.g., Net 30" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-flame hover:opacity-90"
                                onClick={() => {
                                    toast.success("Supplier added successfully");
                                    setIsAddModalOpen(false);
                                }}
                            >
                                Add Supplier
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminSuppliers;
