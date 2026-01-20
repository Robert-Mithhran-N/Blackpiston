import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
    Search,
    Package,
    AlertTriangle,
    TrendingUp,
    MoreHorizontal,
    Plus,
    Edit,
    Truck,
    RefreshCw,
    FileText,
    Download,
} from "lucide-react";
import { toast } from "sonner";
import { inventoryItems, purchaseOrders, allSuppliers } from "@/data/adminMockData";

// Stock level colors
const getStockLevelColor = (current: number, reorder: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current <= 0) return 'text-red-500';
    if (current <= reorder) return 'text-yellow-500';
    if (percentage >= 70) return 'text-green-500';
    return 'text-blue-500';
};

const getStockProgressColor = (current: number, reorder: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current <= 0) return 'bg-red-500';
    if (current <= reorder) return 'bg-yellow-500';
    if (percentage >= 70) return 'bg-green-500';
    return 'bg-blue-500';
};

const AdminInventory = () => {
    const [inventory, setInventory] = useState(inventoryItems);
    const [orders, setOrders] = useState(purchaseOrders);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [stockFilter, setStockFilter] = useState<string>("all");
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<typeof inventoryItems[0] | null>(null);
    const [restockQuantity, setRestockQuantity] = useState("");

    // Stats
    const stats = useMemo(() => {
        const totalItems = inventory.length;
        const lowStock = inventory.filter(i => i.currentStock <= i.reorderPoint && i.currentStock > 0).length;
        const outOfStock = inventory.filter(i => i.currentStock === 0).length;
        const totalValue = inventory.reduce((sum, i) => sum + (i.currentStock * 1000), 0); // Mock value
        return { totalItems, lowStock, outOfStock, totalValue };
    }, [inventory]);

    // Categories
    const categories = useMemo(() => {
        return [...new Set(inventory.map(i => i.category))];
    }, [inventory]);

    // Filter inventory
    const filteredInventory = useMemo(() => {
        let filtered = [...inventory];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.productName.toLowerCase().includes(query) ||
                    item.sku.toLowerCase().includes(query) ||
                    item.productId.toLowerCase().includes(query)
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter((item) => item.category === categoryFilter);
        }

        if (stockFilter === "low") {
            filtered = filtered.filter((item) => item.currentStock <= item.reorderPoint && item.currentStock > 0);
        } else if (stockFilter === "out") {
            filtered = filtered.filter((item) => item.currentStock === 0);
        } else if (stockFilter === "healthy") {
            filtered = filtered.filter((item) => item.currentStock > item.reorderPoint);
        }

        return filtered;
    }, [inventory, searchQuery, categoryFilter, stockFilter]);

    // Handlers
    const handleRestock = (item: typeof inventoryItems[0]) => {
        setSelectedItem(item);
        setRestockQuantity("");
        setIsRestockModalOpen(true);
    };

    const confirmRestock = () => {
        if (!selectedItem || !restockQuantity) return;

        setInventory(inventory.map(i =>
            i.id === selectedItem.id
                ? { ...i, currentStock: i.currentStock + parseInt(restockQuantity) }
                : i
        ));

        toast.success(`Restocked ${selectedItem.productName} with ${restockQuantity} units`);
        setIsRestockModalOpen(false);
        setSelectedItem(null);
    };

    const handleCreatePO = () => {
        setIsPOModalOpen(true);
    };

    const handleExport = () => {
        toast.success("Export functionality coming soon");
    };

    // PO Status Badge
    const getPOStatusColor = (status: string) => {
        switch (status) {
            case 'Draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
            case 'Sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'Confirmed': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'Received': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                        <p className="text-muted-foreground">Track stock levels and manage purchase orders</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button className="bg-gradient-flame hover:opacity-90" onClick={handleCreatePO}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create PO
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalItems}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{stats.lowStock}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{stats.outOfStock}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{(stats.totalValue / 100000).toFixed(1)}L</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="inventory">
                    <TabsList>
                        <TabsTrigger value="inventory">Stock Levels</TabsTrigger>
                        <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
                    </TabsList>

                    {/* Stock Levels Tab */}
                    <TabsContent value="inventory" className="space-y-4 mt-4">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by product name or SKU..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={stockFilter} onValueChange={setStockFilter}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Stock Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Levels</SelectItem>
                                                <SelectItem value="healthy">Healthy</SelectItem>
                                                <SelectItem value="low">Low Stock</SelectItem>
                                                <SelectItem value="out">Out of Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory Table */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Stock Level</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead className="w-12">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredInventory.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        No inventory items found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredInventory.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{item.productName}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.productId}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{item.category}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="w-40 space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className={getStockLevelColor(item.currentStock, item.reorderPoint, item.maxStock)}>
                                                                        {item.currentStock} units
                                                                    </span>
                                                                    <span className="text-muted-foreground">/ {item.maxStock}</span>
                                                                </div>
                                                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${getStockProgressColor(item.currentStock, item.reorderPoint, item.maxStock)}`}
                                                                        style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                                                                    />
                                                                </div>
                                                                {item.currentStock <= item.reorderPoint && (
                                                                    <p className="text-xs text-yellow-500">
                                                                        Reorder at {item.reorderPoint} units
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="text-sm">{item.supplierName || "—"}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleRestock(item)}>
                                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                                        Restock
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit Levels
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Truck className="mr-2 h-4 w-4" />
                                                                        Create PO
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
                    </TabsContent>

                    {/* Purchase Orders Tab */}
                    <TabsContent value="orders" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Purchase Orders</CardTitle>
                                <CardDescription>Manage supplier purchase orders</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>PO Number</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Expected Delivery</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead className="w-12">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        No purchase orders found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                orders.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-mono text-xs font-medium">{order.id}</TableCell>
                                                        <TableCell>{order.supplierName}</TableCell>
                                                        <TableCell>{order.items.length} items</TableCell>
                                                        <TableCell>
                                                            <Badge className={getPOStatusColor(order.status)}>{order.status}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">{order.expectedDelivery || "—"}</TableCell>
                                                        <TableCell className="text-right font-medium">
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
                                                                    <DropdownMenuItem>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit PO
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Package className="mr-2 h-4 w-4" />
                                                                        Receive Items
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
                    </TabsContent>
                </Tabs>

                {/* Restock Modal */}
                <Dialog open={isRestockModalOpen} onOpenChange={setIsRestockModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Restock Inventory</DialogTitle>
                            <DialogDescription>
                                Add stock for {selectedItem?.productName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-4">
                                <div>
                                    <Label>Current Stock</Label>
                                    <p className="text-2xl font-bold">{selectedItem?.currentStock} units</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity to Add</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="Enter quantity"
                                        value={restockQuantity}
                                        onChange={(e) => setRestockQuantity(e.target.value)}
                                    />
                                </div>
                                {restockQuantity && (
                                    <div className="p-3 rounded-lg bg-muted">
                                        <p className="text-sm text-muted-foreground">New stock level:</p>
                                        <p className="text-xl font-bold">
                                            {(selectedItem?.currentStock || 0) + parseInt(restockQuantity || "0")} units
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRestockModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-flame hover:opacity-90"
                                onClick={confirmRestock}
                                disabled={!restockQuantity}
                            >
                                Confirm Restock
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create PO Modal */}
                <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Purchase Order</DialogTitle>
                            <DialogDescription>
                                Create a new purchase order for a supplier
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Supplier</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allSuppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="p-4 rounded-lg border border-dashed border-border text-center">
                                    <p className="text-muted-foreground">Add items to this purchase order</p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Items
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPOModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button className="bg-gradient-flame hover:opacity-90">
                                Create PO
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminInventory;
