import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    fetchProductTypes,
    createProductType,
    updateProductType,
    deleteProductType,
} from "@/lib/api";

// ============================================================
// Types
// ============================================================

interface ProductType {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { categories: number; products: number };
}

// ============================================================
// Component
// ============================================================

const AdminProductTypes = () => {
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editing, setEditing] = useState<ProductType | null>(null);
    const [toDelete, setToDelete] = useState<ProductType | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formName, setFormName] = useState("");
    const [formDescription, setFormDescription] = useState("");

    // --------------------------------
    // Load
    // --------------------------------
    const load = async () => {
        setIsLoading(true);
        try {
            const data = await fetchProductTypes();
            setProductTypes(data.productTypes || []);
        } catch {
            toast.error("Failed to load product types");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // --------------------------------
    // Open form
    // --------------------------------
    const openAdd = () => {
        setEditing(null);
        setFormName("");
        setFormDescription("");
        setIsFormOpen(true);
    };

    const openEdit = (pt: ProductType) => {
        setEditing(pt);
        setFormName(pt.name);
        setFormDescription(pt.description || "");
        setIsFormOpen(true);
    };

    // --------------------------------
    // Save
    // --------------------------------
    const handleSave = async () => {
        if (!formName.trim()) {
            toast.error("Name is required");
            return;
        }
        setIsSaving(true);
        try {
            if (editing) {
                await updateProductType(editing.id, {
                    name: formName.trim(),
                    description: formDescription.trim() || undefined,
                });
                toast.success("Product type updated");
            } else {
                await createProductType({
                    name: formName.trim(),
                    description: formDescription.trim() || undefined,
                });
                toast.success("Product type created");
            }
            setIsFormOpen(false);
            load();
        } catch (err: any) {
            toast.error(err?.message || "Failed to save product type");
        } finally {
            setIsSaving(false);
        }
    };

    // --------------------------------
    // Delete
    // --------------------------------
    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteProductType(toDelete.id);
            toast.success(`"${toDelete.name}" deleted`);
            setIsDeleteOpen(false);
            setToDelete(null);
            load();
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete product type");
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Product Types</h1>
                        <p className="text-muted-foreground">
                            Manage product types — e.g. Helmets, Riding Jackets, Accessories
                        </p>
                    </div>
                    <Button className="bg-gradient-flame hover:opacity-90" onClick={openAdd}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Product Type
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            Product Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-6 space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : productTypes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Layers className="h-12 w-12 mb-3 opacity-40" />
                                <p className="text-lg font-medium">No product types yet</p>
                                <p className="text-sm">Create your first product type to organize categories.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-center">Categories</TableHead>
                                            <TableHead className="text-center">Products</TableHead>
                                            <TableHead className="w-24 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productTypes.map((pt) => (
                                            <TableRow key={pt.id}>
                                                <TableCell className="font-medium">{pt.name}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {pt.slug}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                    {pt.description || "—"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">{pt._count?.categories ?? 0}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">{pt._count?.products ?? 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => openEdit(pt)}
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => {
                                                                setToDelete(pt);
                                                                setIsDeleteOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ============================================ */}
            {/* ADD / EDIT DIALOG                            */}
            {/* ============================================ */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit Product Type" : "Add Product Type"}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? "Update the product type details."
                                : "Create a new product type to group categories under."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="pt-name">Name *</Label>
                            <Input
                                id="pt-name"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="e.g. Helmets"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pt-desc">Description</Label>
                            <Textarea
                                id="pt-desc"
                                rows={3}
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="Optional description..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-flame hover:opacity-90"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : editing ? (
                                "Update"
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ============================================ */}
            {/* DELETE DIALOG                                */}
            {/* ============================================ */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product Type</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                "{toDelete?.name}"
                            </span>
                            ? This cannot be undone. Categories and products must be reassigned first.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminProductTypes;
