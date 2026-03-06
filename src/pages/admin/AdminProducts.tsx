import { useState, useEffect, useRef, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ImageUp,
  X,
  Star,
  Tag,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAdminProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  fetchProductTypes,
  createProductType as apiCreateProductType,
  fetchCategoriesByType,
  fetchTagSuggestions,
  createCategory as apiCreateCategory,
} from "@/lib/api";

// ============================================================
// Types
// ============================================================

interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ProductVariant {
  id?: string;
  size?: string;
  color?: string;
  model?: string;
  sku: string;
  price?: number | string;
  stockQuantity?: number | string;
  images?: ProductImage[];
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  productTypeId?: string | null;
}

interface ProductTypeT {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { categories: number; products: number };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  productTypeId?: string;
  productType?: { id: string; name: string; slug: string };
  categoryId?: string;
  categorySlug?: string;
  category?: ProductCategory;
  brand?: string;
  price: number;
  offerPrice?: number;
  costPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  stockQuantity: number;
  sku: string;
  tags: string[];
  tagStrings?: string[];
  isFeatured: boolean;
  isActive: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  shortDescription: string;
  brand: string;
  sku: string;
  productTypeId: string;
  categoryId: string;
  categorySlug: string;
  tagChips: string[];
  tagInput: string;
  price: string;
  offerPrice: string;
  costPrice: string;
  stockQuantity: string;
  isFeatured: boolean;
  isActive: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}

const emptyForm: FormData = {
  name: "",
  description: "",
  shortDescription: "",
  brand: "",
  sku: "",
  productTypeId: "",
  categoryId: "",
  categorySlug: "",
  tagChips: [],
  tagInput: "",
  price: "",
  offerPrice: "",
  costPrice: "",
  stockQuantity: "0",
  isFeatured: false,
  isActive: true,
  images: [],
  variants: [],
};

// ============================================================
// Component
// ============================================================

const AdminProducts = () => {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [allCategories, setAllCategories] = useState<ProductCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeT[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Tag suggestions
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Add new type/category inline
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Form state
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --------------------------------
  // Fetch products
  // --------------------------------
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 15,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.productTypeId = typeFilter;

      const data = await fetchAdminProducts(params as any);
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Load products error:", err);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter, statusFilter, typeFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Fetch categories + product types once
  useEffect(() => {
    fetchCategories()
      .then((data) => {
        const cats = data.categories || data || [];
        const catArr = Array.isArray(cats) ? cats : [];
        setCategories(catArr);
        setAllCategories(catArr);
      })
      .catch(() => { });

    fetchProductTypes()
      .then((data) => setProductTypes(data.productTypes || []))
      .catch(() => { });
  }, []);

  // Reload categories when form type changes
  const loadFormCategories = useCallback(async (typeId: string) => {
    try {
      const data = typeId
        ? await fetchCategoriesByType(typeId)
        : await fetchCategories();
      const cats = data.categories || data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      setCategories(allCategories);
    }
  }, [allCategories]);

  // --------------------------------
  // Search debounce
  // --------------------------------
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // --------------------------------
  // Open form
  // --------------------------------
  const openAddForm = () => {
    setEditingProduct(null);
    setFormData({ ...emptyForm });
    setCategories(allCategories);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    const typeId = product.productTypeId || "";
    setFormData({
      name: product.name,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      brand: product.brand || "",
      sku: product.sku || "",
      productTypeId: typeId,
      categoryId: product.categoryId || "",
      categorySlug: product.categorySlug || "",
      tagChips: product.tags || [],
      tagInput: "",
      price: String(product.price),
      offerPrice: product.offerPrice ? String(product.offerPrice) : "",
      costPrice: product.costPrice ? String(product.costPrice) : "",
      stockQuantity: String(product.stockQuantity),
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      images: product.images || [],
      variants: product.variants || [],
    });
    if (typeId) loadFormCategories(typeId);
    else setCategories(allCategories);
    setIsFormOpen(true);
  };

  // --------------------------------
  // Save product
  // --------------------------------
  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    const stock = parseInt(formData.stockQuantity) || 0;
    if (stock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }
    if (formData.images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    const offerPrice = formData.offerPrice ? parseFloat(formData.offerPrice) : null;
    if (offerPrice !== null && offerPrice >= price) {
      toast.error("Offer price must be less than the original price");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        shortDescription: formData.shortDescription.trim() || null,
        brand: formData.brand.trim() || null,
        sku: formData.sku.trim() || undefined,
        productTypeId: formData.productTypeId || null,
        categoryId: formData.categoryId || null,
        categorySlug: formData.categorySlug || null,
        price,
        offerPrice,
        stockQuantity: stock,
        tags: formData.tagChips,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        images: formData.images,
        variants: formData.variants,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload);
        toast.success("Product created successfully");
      }

      setIsFormOpen(false);
      setEditingProduct(null);
      loadProducts();
      // Refresh product types counts
      fetchProductTypes()
        .then((data) => setProductTypes(data.productTypes || []))
        .catch(() => { });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------
  // Delete product
  // --------------------------------
  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      toast.success(`"${productToDelete.name}" deleted`);
      setIsDeleteOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  // --------------------------------
  // Image upload
  // --------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadImages(Array.from(files));
      const newImages: ProductImage[] = uploaded.map((f, i) => ({
        url: f.url,
        alt: formData.name || "Product image",
        isPrimary: formData.images.length === 0 && i === 0,
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const images = prev.images.filter((_, i) => i !== index);
      // If removed image was primary, make first remaining primary
      if (images.length > 0 && !images.some((img) => img.isPrimary)) {
        images[0].isPrimary = true;
      }
      return { ...prev, images };
    });
  };

  const setPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  // --------------------------------
  // Variant management
  // --------------------------------
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size: "", color: "", model: "", sku: "", price: "", stockQuantity: "0", images: [] },
      ],
    }));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // --------------------------------
  // Helpers
  // --------------------------------
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const getProductImage = (product: Product) => {
    const primary = product.images?.find((i) => i.isPrimary);
    return primary?.url || product.images?.[0]?.url || "";
  };

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      categorySlug: cat?.slug || "",
    }));
  };

  const handleProductTypeChange = (typeId: string) => {
    setFormData((prev) => ({
      ...prev,
      productTypeId: typeId,
      categoryId: "",
      categorySlug: "",
    }));
    loadFormCategories(typeId);
  };

  // ---- Tag chip helpers ----
  const normalizeTagForChip = (raw: string) => raw.replace(/^#/, "").trim();

  const addTagChip = (raw: string) => {
    const tag = normalizeTagForChip(raw);
    if (!tag) return;
    setFormData((prev) => {
      if (prev.tagChips.includes(tag)) return prev;
      return { ...prev, tagChips: [...prev.tagChips, tag], tagInput: "" };
    });
    setShowTagSuggestions(false);
  };

  const removeTagChip = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tagChips: prev.tagChips.filter((t) => t !== tag),
    }));
  };

  const handleTagInputChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, tagInput: value }));
    const normalized = normalizeTagForChip(value);
    if (normalized.length >= 2) {
      try {
        const data = await fetchTagSuggestions(normalized);
        setTagSuggestions((data.tags || []).map((s: any) => s.tag));
        setShowTagSuggestions(true);
      } catch {
        setTagSuggestions([]);
      }
    } else {
      setTagSuggestions([]);
      setShowTagSuggestions(false);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      addTagChip(formData.tagInput);
    }
    if (e.key === "Backspace" && !formData.tagInput && formData.tagChips.length > 0) {
      removeTagChip(formData.tagChips[formData.tagChips.length - 1]);
    }
  };

  // ---- Inline create helpers ----
  const handleCreateTypeInline = async () => {
    if (!newTypeName.trim()) return;
    try {
      const data = await apiCreateProductType({ name: newTypeName.trim() });
      const newType = data.productType;
      setProductTypes((prev) => [...prev, newType]);
      setFormData((prev) => ({ ...prev, productTypeId: newType.id, categoryId: "", categorySlug: "" }));
      loadFormCategories(newType.id);
      setNewTypeName("");
      setShowNewTypeInput(false);
      toast.success(`Type "${newType.name}" created`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create type");
    }
  };

  const handleCreateCategoryInline = async () => {
    if (!newCatName.trim()) return;
    try {
      const data = await apiCreateCategory({
        name: newCatName.trim(),
        productTypeId: formData.productTypeId || undefined,
      });
      const newCat = data.category;
      setCategories((prev) => [...prev, newCat]);
      setAllCategories((prev) => [...prev, newCat]);
      setFormData((prev) => ({ ...prev, categoryId: newCat.id, categorySlug: newCat.slug }));
      setNewCatName("");
      setShowNewCatInput(false);
      toast.success(`Category "${newCat.name}" created`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category");
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
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog — {pagination.total} products total
            </p>
          </div>
          <Button className="bg-gradient-flame hover:opacity-90" onClick={openAddForm}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {productTypes.map((pt) => (
                    <SelectItem key={pt.id} value={pt.id}>
                      {pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Product Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Product Catalog
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your filters or add a new product.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Offer</TableHead>
                        <TableHead className="text-center">Variants</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Flags</TableHead>
                        <TableHead className="w-24 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {getProductImage(p) ? (
                              <img
                                src={getProductImage(p)}
                                alt={p.name}
                                className="h-10 w-10 rounded-md object-cover border border-border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm max-w-[200px] truncate">
                              {p.name}
                            </div>
                            {p.brand && (
                              <div className="text-xs text-muted-foreground">{p.brand}</div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {p.sku}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.productType?.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {p.category?.name || "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            {formatPrice(p.price)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {p.offerPrice ? (
                              <span className="text-green-400">{formatPrice(p.offerPrice)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(p.variants?.length || 0) > 0 ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/40">
                                {p.variants.length}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                (() => {
                                  const totalStock = (p.variants?.length || 0) > 0
                                    ? p.variants.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0)
                                    : p.stockQuantity;
                                  return totalStock === 0
                                    ? "bg-red-500/10 text-red-400 border-red-500/40"
                                    : totalStock <= 10
                                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/40"
                                      : "bg-green-500/10 text-green-400 border-green-500/40";
                                })()
                              }
                            >
                              {(p.variants?.length || 0) > 0
                                ? p.variants.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0)
                                : p.stockQuantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                p.isActive
                                  ? "bg-green-500/10 text-green-400 border-green-500/40"
                                  : "bg-muted/60 text-muted-foreground border-border/60"
                              }
                            >
                              {p.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {p.isFeatured && (
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" title="Featured" />
                              )}
                              {p.offerPrice && (
                                <Tag className="h-3.5 w-3.5 text-green-400" title="Has Offer" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => openEditForm(p)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setProductToDelete(p);
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage >= pagination.totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* ADD / EDIT PRODUCT DIALOG                    */}
      {/* ============================================ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product details below."
                : "Fill in the details to create a new product."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 overflow-y-auto">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="flags">Flags</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. AGV K6 S Helmet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Full product description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief summary for product cards"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. AGV, Dainese"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">
                      SKU <span className="text-muted-foreground text-xs">(auto if blank)</span>
                    </Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>
                {/* Product Type */}
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  {showNewTypeInput ? (
                    <div className="flex gap-2">
                      <Input
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="New type name…"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateTypeInline()}
                      />
                      <Button size="sm" onClick={handleCreateTypeInline} className="shrink-0">Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewTypeInput(false)} className="shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={formData.productTypeId || "__none__"}
                        onValueChange={(v) => handleProductTypeChange(v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— No type —</SelectItem>
                          {productTypes.map((pt) => (
                            <SelectItem key={pt.id} value={pt.id}>
                              {pt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="outline"
                        className="shrink-0"
                        title="Add new type"
                        onClick={() => setShowNewTypeInput(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {/* Category (optional, filtered by type) */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  {showNewCatInput ? (
                    <div className="flex gap-2">
                      <Input
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="New category name…"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateCategoryInline()}
                      />
                      <Button size="sm" onClick={handleCreateCategoryInline} className="shrink-0">Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewCatInput(false)} className="shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={formData.categoryId || "__none__"}
                        onValueChange={(v) => handleCategoryChange(v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— No category —</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="outline"
                        className="shrink-0"
                        title="Add new category"
                        onClick={() => setShowNewCatInput(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {/* Tags — chip editor */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-md bg-background min-h-[42px] cursor-text"
                    onClick={() => tagInputRef.current?.focus()}
                  >
                    {formData.tagChips.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-0.5 text-xs">
                        #{tag}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeTagChip(tag); }}
                          className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      ref={tagInputRef}
                      value={formData.tagInput}
                      onChange={(e) => handleTagInputChange(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      onBlur={() => { addTagChip(formData.tagInput); setTimeout(() => setShowTagSuggestions(false), 200); }}
                      placeholder={formData.tagChips.length === 0 ? "Type a tag and press comma or enter…" : ""}
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  {/* Suggestions dropdown */}
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="border border-border rounded-md bg-popover shadow-md p-1 max-h-32 overflow-y-auto">
                      {tagSuggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent"
                          onMouseDown={(e) => { e.preventDefault(); addTagChip(s); }}
                        >
                          #{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Pricing & Stock Tab */}
              <TabsContent value="pricing" className="space-y-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                    <Input
                      id="offerPrice"
                      type="number"
                      min="0"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                      placeholder="Leave blank if no offer"
                    />
                  </div>
                </div>
                {formData.price && formData.offerPrice && (
                  <div className="rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm">
                    <span className="text-green-400 font-medium">
                      {Math.round(
                        ((parseFloat(formData.price) - parseFloat(formData.offerPrice)) /
                          parseFloat(formData.price)) *
                        100
                      )}
                      % discount
                    </span>{" "}
                    — Customer saves{" "}
                    {formatPrice(
                      parseFloat(formData.price) - parseFloat(formData.offerPrice)
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price (₹)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label>Product Images *</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload up to 5 images. Click the star to set the primary image.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isUploading || formData.images.length >= 5}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageUp className="mr-2 h-4 w-4" />
                      Upload Images ({formData.images.length}/5)
                    </>
                  )}
                </Button>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {formData.images.map((img, i) => (
                      <div
                        key={i}
                        className={`relative group rounded-lg overflow-hidden border-2 ${img.isPrimary
                          ? "border-yellow-400"
                          : "border-border hover:border-muted-foreground/40"
                          }`}
                      >
                        <img
                          src={img.url}
                          alt={img.alt || "Product"}
                          className="aspect-square w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            className="rounded-full p-1.5 bg-black/60 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors"
                            title="Set as primary"
                            onClick={() => setPrimaryImage(i)}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded-full p-1.5 bg-black/60 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="Remove"
                            onClick={() => removeImage(i)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {img.isPrimary && (
                          <div className="absolute top-1 left-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-black">
                            PRIMARY
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Variants Tab */}
              <TabsContent value="variants" className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Product Variants</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add size, color, model, price &amp; stock variations.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addVariant}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Variant
                  </Button>
                </div>
                {formData.variants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                    No variants added yet. Click &quot;Add Variant&quot; to create one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.variants.map((variant, i) => (
                      <div
                        key={i}
                        className="border border-border rounded-lg p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Variant #{i + 1}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeVariant(i)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <Input
                            placeholder="Size (e.g. M, L)"
                            value={variant.size || ""}
                            onChange={(e) => updateVariant(i, "size", e.target.value)}
                          />
                          <Input
                            placeholder="Color"
                            value={variant.color || ""}
                            onChange={(e) => updateVariant(i, "color", e.target.value)}
                          />
                          <Input
                            placeholder="Model"
                            value={variant.model || ""}
                            onChange={(e) => updateVariant(i, "model", e.target.value)}
                          />
                          <Input
                            placeholder="SKU (auto)"
                            value={variant.sku}
                            onChange={(e) => updateVariant(i, "sku", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Variant Price (₹)</Label>
                            <Input
                              type="number"
                              placeholder="Leave blank to use product price"
                              value={variant.price ?? ""}
                              onChange={(e) => updateVariant(i, "price", e.target.value ? Number(e.target.value) : "")}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Stock Quantity</Label>
                            <Input
                              type="number"
                              min={0}
                              value={variant.stockQuantity ?? 0}
                              onChange={(e) => updateVariant(i, "stockQuantity", Number(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Flags Tab */}
              <TabsContent value="flags" className="space-y-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Product is visible on the shop
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isFeatured">Featured</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Show on homepage featured section
                    </p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(v) => setFormData({ ...formData, isFeatured: v })}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t border-border">
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
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* DELETE CONFIRMATION                          */}
      {/* ============================================ */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{productToDelete?.name}"
              </span>
              ? This action cannot be undone.
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

export default AdminProducts;
