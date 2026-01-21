import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tag,
    Plus,
    ArrowLeft,
    MoreHorizontal,
    Pencil,
    Trash2,
    ArrowUpDown,
    Percent,
    Package,
} from "lucide-react";
import { toast } from "sonner";
import { TopOffer } from "@/types/admin";

// ============================================================
// Mock Data - Initial Top Offers
// ============================================================
const initialTopOffers: TopOffer[] = [
    {
        id: "OFFER-001",
        productName: "AGV K6 S Helmet - Matte Black",
        productImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
        originalPrice: 45999,
        offerPrice: 38999,
        discountPercent: 15,
        status: "Active",
        createdAt: "2025-01-15T10:00:00",
        updatedAt: "2025-01-20T14:30:00",
    },
    {
        id: "OFFER-002",
        productName: "Dainese Racing 4 Leather Jacket",
        productImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop",
        originalPrice: 89999,
        offerPrice: 71999,
        discountPercent: 20,
        status: "Active",
        createdAt: "2025-01-14T09:00:00",
        updatedAt: "2025-01-19T11:00:00",
    },
    {
        id: "OFFER-003",
        productName: "Alpinestars SMX-6 V2 Boots",
        productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
        originalPrice: 28999,
        offerPrice: 23199,
        discountPercent: 20,
        status: "Active",
        createdAt: "2025-01-13T14:00:00",
        updatedAt: "2025-01-18T16:00:00",
    },
    {
        id: "OFFER-004",
        productName: "Shoei RF-1400 Helmet - White",
        productImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
        originalPrice: 67999,
        offerPrice: 54399,
        discountPercent: 20,
        status: "Inactive",
        createdAt: "2025-01-10T08:00:00",
        updatedAt: "2025-01-15T10:00:00",
    },
    {
        id: "OFFER-005",
        productName: "Rev'It Striker 3 Gloves",
        productImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
        originalPrice: 15999,
        offerPrice: 11999,
        discountPercent: 25,
        status: "Active",
        createdAt: "2025-01-12T12:00:00",
        updatedAt: "2025-01-20T09:00:00",
    },
];

// ============================================================
// Component
// ============================================================
const AdminTopOffers = () => {
    const [offers, setOffers] = useState<TopOffer[]>(initialTopOffers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<TopOffer | null>(null);
    const [sortField, setSortField] = useState<"offerPrice" | "discountPercent" | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Form state
    const [formData, setFormData] = useState({
        productName: "",
        productImage: "",
        originalPrice: "",
        offerPrice: "",
        status: "Active" as "Active" | "Inactive",
    });

    // Calculate discount percentage
    const calculateDiscount = (original: number, offer: number): number => {
        if (original <= 0) return 0;
        return Math.round(((original - offer) / original) * 100);
    };

    // Sort offers
    const sortedOffers = [...offers].sort((a, b) => {
        if (!sortField) return 0;
        const aValue = a[sortField];
        const bValue = b[sortField];
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    // Handle sort toggle
    const handleSort = (field: "offerPrice" | "discountPercent") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Open modal for add
    const handleAddNew = () => {
        setSelectedOffer(null);
        setFormData({
            productName: "",
            productImage: "",
            originalPrice: "",
            offerPrice: "",
            status: "Active",
        });
        setIsModalOpen(true);
    };

    // Open modal for edit
    const handleEdit = (offer: TopOffer) => {
        setSelectedOffer(offer);
        setFormData({
            productName: offer.productName,
            productImage: offer.productImage,
            originalPrice: offer.originalPrice.toString(),
            offerPrice: offer.offerPrice.toString(),
            status: offer.status,
        });
        setIsModalOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (offer: TopOffer) => {
        setSelectedOffer(offer);
        setIsDeleteDialogOpen(true);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (selectedOffer) {
            setOffers(offers.filter((o) => o.id !== selectedOffer.id));
            toast.success(`"${selectedOffer.productName}" removed from Top Offers`);
        }
        setIsDeleteDialogOpen(false);
        setSelectedOffer(null);
    };

    // Save offer (add or edit)
    const handleSave = () => {
        const originalPrice = parseFloat(formData.originalPrice);
        const offerPrice = parseFloat(formData.offerPrice);

        if (!formData.productName || isNaN(originalPrice) || isNaN(offerPrice)) {
            toast.error("Please fill all required fields");
            return;
        }

        if (offerPrice >= originalPrice) {
            toast.error("Offer price must be less than original price");
            return;
        }

        const discountPercent = calculateDiscount(originalPrice, offerPrice);
        const now = new Date().toISOString();

        if (selectedOffer) {
            // Edit existing
            setOffers(
                offers.map((o) =>
                    o.id === selectedOffer.id
                        ? {
                            ...o,
                            productName: formData.productName,
                            productImage: formData.productImage || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
                            originalPrice,
                            offerPrice,
                            discountPercent,
                            status: formData.status,
                            updatedAt: now,
                        }
                        : o
                )
            );
            toast.success("Offer updated successfully");
        } else {
            // Add new
            const newOffer: TopOffer = {
                id: `OFFER-${String(offers.length + 1).padStart(3, "0")}`,
                productName: formData.productName,
                productImage: formData.productImage || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
                originalPrice,
                offerPrice,
                discountPercent,
                status: formData.status,
                createdAt: now,
                updatedAt: now,
            };
            setOffers([...offers, newOffer]);
            toast.success("New offer added successfully");
        }

        setIsModalOpen(false);
        setSelectedOffer(null);
    };

    // Calculate discount for form preview
    const formOriginal = parseFloat(formData.originalPrice) || 0;
    const formOffer = parseFloat(formData.offerPrice) || 0;
    const formDiscount = formOriginal > 0 && formOffer > 0 && formOffer < formOriginal
        ? calculateDiscount(formOriginal, formOffer)
        : 0;

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
                            <h1 className="text-3xl font-bold tracking-tight">Top Offers</h1>
                            <p className="text-muted-foreground mt-1">
                                Products highlighted as special offers on the homepage
                            </p>
                        </div>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-orange-600 hover:opacity-90" onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Top Offer
                    </Button>
                </div>

                {/* Stats Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Tag className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{offers.length}</p>
                                <p className="text-sm text-muted-foreground">Total Offers</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{offers.filter((o) => o.status === "Active").length}</p>
                                <p className="text-sm text-muted-foreground">Active Offers</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Percent className="h-6 w-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {offers.length > 0 ? Math.round(offers.reduce((acc, o) => acc + o.discountPercent, 0) / offers.length) : 0}%
                                </p>
                                <p className="text-sm text-muted-foreground">Avg. Discount</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Offers Table */}
                <Card>
                    <CardContent className="p-0">
                        {offers.length === 0 ? (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Tag className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No Top Offers added yet</h3>
                                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                                    Start by adding products you want to highlight as special offers on your homepage.
                                </p>
                                <Button className="bg-gradient-to-r from-primary to-orange-600 hover:opacity-90" onClick={handleAddNew}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Offer
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-20">Image</TableHead>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead className="text-right">Original Price</TableHead>
                                            <TableHead className="text-right cursor-pointer hover:text-primary" onClick={() => handleSort("offerPrice")}>
                                                <div className="flex items-center justify-end gap-1">
                                                    Offer Price
                                                    <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center cursor-pointer hover:text-primary" onClick={() => handleSort("discountPercent")}>
                                                <div className="flex items-center justify-center gap-1">
                                                    Discount
                                                    <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="w-16">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedOffers.map((offer) => (
                                            <TableRow key={offer.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                                                        <img
                                                            src={offer.productImage}
                                                            alt={offer.productName}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop";
                                                            }}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="font-medium">{offer.productName}</p>
                                                    <p className="text-xs text-muted-foreground">{offer.id}</p>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground line-through">
                                                    ₹{offer.originalPrice.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-primary">
                                                    ₹{offer.offerPrice.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                                                        {offer.discountPercent}% OFF
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        className={
                                                            offer.status === "Active"
                                                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                                                : "bg-gray-500/20 text-gray-400 border-gray-500/50"
                                                        }
                                                    >
                                                        {offer.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(offer)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(offer)}
                                                                className="text-red-500 focus:text-red-500"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
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

                {/* Add/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{selectedOffer ? "Edit Top Offer" : "Add New Top Offer"}</DialogTitle>
                            <DialogDescription>
                                {selectedOffer
                                    ? "Update the offer details below"
                                    : "Add a product as a highlighted offer on homepage"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Product Name */}
                            <div className="space-y-2">
                                <Label htmlFor="productName">Product Name *</Label>
                                <Input
                                    id="productName"
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    placeholder="Enter product name"
                                />
                            </div>

                            {/* Product Image URL */}
                            <div className="space-y-2">
                                <Label htmlFor="productImage">Product Image URL</Label>
                                <Input
                                    id="productImage"
                                    value={formData.productImage}
                                    onChange={(e) => setFormData({ ...formData, productImage: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.productImage && (
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted">
                                            <img
                                                src={formData.productImage}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop";
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Prices */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                                    <Input
                                        id="originalPrice"
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                        placeholder="45999"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="offerPrice">Offer Price (₹) *</Label>
                                    <Input
                                        id="offerPrice"
                                        type="number"
                                        value={formData.offerPrice}
                                        onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                                        placeholder="38999"
                                    />
                                </div>
                            </div>

                            {/* Auto-calculated Discount */}
                            {formDiscount > 0 && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                                    <Percent className="h-5 w-5 text-orange-500" />
                                    <span className="text-sm">
                                        Discount: <span className="font-bold text-orange-400">{formDiscount}% OFF</span>
                                    </span>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <p className="text-xs text-muted-foreground">Show this offer on homepage</p>
                                </div>
                                <Switch
                                    id="status"
                                    checked={formData.status === "Active"}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, status: checked ? "Active" : "Inactive" })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button className="bg-gradient-to-r from-primary to-orange-600 hover:opacity-90" onClick={handleSave}>
                                {selectedOffer ? "Update Offer" : "Add Offer"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Top Offer?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove "{selectedOffer?.productName}" from Top Offers?
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
};

export default AdminTopOffers;
