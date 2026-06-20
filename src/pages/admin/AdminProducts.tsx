import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Percent,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  fetchTagSuggestions,
  generateProductContentAI,
  regenerateProductSection,
} from "@/lib/api";

// ============================================================
// Types
// ============================================================

interface ProductImage {
  url: string;
  public_id?: string;
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
  deliveryCharge?: number | string;
}

interface ProductSection {
  id?: string;
  title: string;
  content: string;
  order?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  sections?: ProductSection[];
  brand?: string;
  price: number;
  offerPrice?: number;
  costPrice?: number;
  thumbnailUrl?: string | null;
  thumbnailPublicId?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  stockQuantity: number;
  sku: string;
  tags: string[];
  tagStrings?: string[];
  isFeatured: boolean;
  isActive: boolean;
  inStock: boolean;
  deliveryCharge: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  highlights?: string[];
  shippingBadgeTitle?: string;
  shippingBadgeDesc?: string;
  warrantyBadgeTitle?: string;
  warrantyBadgeDesc?: string;
  returnBadgeTitle?: string;
  returnBadgeDesc?: string;
  createdAt: string;
  updatedAt: string;
}

// Product type options for the dropdown
const PRODUCT_TYPES = [
  { id: "helmet", label: "Helmets" },
  { id: "jacket", label: "Jackets" },
  { id: "gloves", label: "Gloves" },
  { id: "boots", label: "Boots" },
  { id: "riding-pants", label: "Riding Pants" },
  { id: "guards", label: "Guards & Armor" },
  { id: "rain-gear", label: "Rain Gear" },
  { id: "accessories", label: "Accessories" },
  { id: "parts", label: "Parts" },
  { id: "lubricants", label: "Lubricants & Chemicals" },
  { id: "tools", label: "Tools" },
  { id: "other", label: "Other" },
];

interface FormData {
  name: string;
  shortDescription: string;
  sections: ProductSection[];
  brand: string;
  sku: string;
  productType: string;
  tagChips: string[];
  tagInput: string;
  price: string;
  offerPrice: string;
  discountPercent: string;
  costPrice: string;
  deliveryCharge: string;
  stockQuantity: string;
  hasVariants: boolean;
  isFeatured: boolean;
  isActive: boolean;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  highlights: string[];
  shippingBadgeTitle: string;
  shippingBadgeDesc: string;
  warrantyBadgeTitle: string;
  warrantyBadgeDesc: string;
  returnBadgeTitle: string;
  returnBadgeDesc: string;
}

const emptyForm: FormData = {
  name: "",
  shortDescription: "",
  sections: [],
  brand: "",
  sku: "",
  productType: "",
  tagChips: [],
  tagInput: "",
  price: "",
  offerPrice: "",
  discountPercent: "",
  costPrice: "",
  deliveryCharge: "0",
  stockQuantity: "0",
  hasVariants: false,
  isFeatured: false,
  isActive: true,
  thumbnailUrl: null,
  thumbnailPublicId: null,
  images: [],
  variants: [],
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
  highlights: [],
  shippingBadgeTitle: "",
  shippingBadgeDesc: "",
  warrantyBadgeTitle: "",
  warrantyBadgeDesc: "",
  returnBadgeTitle: "",
  returnBadgeDesc: "",
};

// ============================================================
// Component
// ============================================================

const AdminProducts = () => {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [variantUploadingIndex, setVariantUploadingIndex] = useState<number | null>(null);

  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingSectionIdx, setIsRegeneratingSectionIdx] = useState<number | null>(null);

  // AI & SEO tab inputs
  const [newHighlight, setNewHighlight] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  // Tag suggestions
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

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
      if (statusFilter !== "all") params.status = statusFilter;

      const data = await fetchAdminProducts(params as any);
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Load products error:", err);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
    setNewHighlight("");
    setNewKeyword("");
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    const hasVariants = (product.variants?.length || 0) > 0;
    const price = product.price;
    const offerPrice = product.offerPrice;
    let discountPercent = "";
    if (offerPrice && price > 0 && offerPrice < price) {
      discountPercent = String(Math.round(((price - offerPrice) / price) * 100));
    }
    const productType = PRODUCT_TYPES.find(pt => product.tags?.includes(pt.id))?.id || "";
    const tagChips = (product.tags || []).filter(t => t !== productType);
    
    setFormData({
      name: product.name,
      shortDescription: product.shortDescription || "",
      sections: product.sections || [],
      brand: product.brand || "",
      sku: product.sku || "",
      productType,
      tagChips,
      tagInput: "",
      price: String(product.price),
      offerPrice: product.offerPrice ? String(product.offerPrice) : "",
      discountPercent,
      costPrice: product.costPrice ? String(product.costPrice) : "",
      deliveryCharge: String(product.deliveryCharge ?? 0),
      stockQuantity: String(product.stockQuantity),
      hasVariants,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      thumbnailUrl: product.thumbnailUrl || null,
      thumbnailPublicId: product.thumbnailPublicId || null,
      images: product.images || [],
      variants: product.variants || [],
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      seoKeywords: product.seoKeywords || [],
      highlights: product.highlights || [],
      shippingBadgeTitle: product.shippingBadgeTitle || "",
      shippingBadgeDesc: product.shippingBadgeDesc || "",
      warrantyBadgeTitle: product.warrantyBadgeTitle || "",
      warrantyBadgeDesc: product.warrantyBadgeDesc || "",
      returnBadgeTitle: product.returnBadgeTitle || "",
      returnBadgeDesc: product.returnBadgeDesc || "",
    });
    setNewHighlight("");
    setNewKeyword("");
    setIsFormOpen(true);
  };

  // --------------------------------
  // Discount auto-calculation
  // --------------------------------
  const handlePriceChange = (value: string) => {
    const price = parseFloat(value);
    const pct = parseFloat(formData.discountPercent);
    let offerPrice = formData.offerPrice;
    if (!isNaN(price) && !isNaN(pct) && pct > 0 && pct < 100) {
      offerPrice = String(Math.round(price * (1 - pct / 100)));
    }
    setFormData({ ...formData, price: value, offerPrice });
  };

  const handleOfferPriceChange = (value: string) => {
    const price = parseFloat(formData.price);
    const offer = parseFloat(value);
    let discountPercent = "";
    if (!isNaN(price) && !isNaN(offer) && price > 0 && offer < price) {
      discountPercent = String(Math.round(((price - offer) / price) * 100));
    }
    setFormData({ ...formData, offerPrice: value, discountPercent });
  };

  const handleDiscountPercentChange = (value: string) => {
    const price = parseFloat(formData.price);
    const pct = parseFloat(value);
    let offerPrice = formData.offerPrice;
    if (!isNaN(price) && !isNaN(pct) && pct > 0 && pct < 100) {
      offerPrice = String(Math.round(price * (1 - pct / 100)));
    } else {
      offerPrice = "";
    }
    setFormData({ ...formData, discountPercent: value, offerPrice });
  };

  // --------------------------------
  // AI Content Generation
  // --------------------------------
  const handleGenerateContent = async () => {
    if (!formData.name.trim()) {
      toast.error("Enter a product name first");
      return;
    }

    setIsGenerating(true);
    try {
      const productTypeLabel = PRODUCT_TYPES.find(pt => pt.id === formData.productType)?.label || formData.productType;
      const result = await generateProductContentAI({
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        productType: productTypeLabel || undefined,
      });

      const content = result.content;
      if (!content) {
        toast.error("AI returned empty content");
        return;
      }

      // Merge generated tags with existing ones (deduplicate)
      const existingTags = new Set(formData.tagChips.map(t => t.toLowerCase()));
      const newTags = (content.tags || []).filter((t: string) => !existingTags.has(t.toLowerCase()));

      setFormData(prev => ({
        ...prev,
        shortDescription: content.shortDescription || prev.shortDescription,
        sections: content.sections || prev.sections,
        tagChips: [...prev.tagChips, ...newTags],
        seoTitle: content.seo?.title || prev.seoTitle,
        seoDescription: content.seo?.description || prev.seoDescription,
        seoKeywords: content.seo?.keywords || prev.seoKeywords,
        highlights: content.highlights || prev.highlights,
      }));

      toast.success("✨ Product content generated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (sectionIdx: number) => {
    const section = formData.sections[sectionIdx];
    if (!section?.title || !formData.name.trim()) return;

    setIsRegeneratingSectionIdx(sectionIdx);
    try {
      const productTypeLabel = PRODUCT_TYPES.find(pt => pt.id === formData.productType)?.label || formData.productType;
      const result = await regenerateProductSection({
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        productType: productTypeLabel || undefined,
        sectionTitle: section.title,
      });

      if (result.section?.content) {
        const newSections = [...formData.sections];
        newSections[sectionIdx] = {
          ...newSections[sectionIdx],
          content: result.section.content,
        };
        setFormData({ ...formData, sections: newSections });
        toast.success(`"${section.title}" regenerated`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to regenerate section");
    } finally {
      setIsRegeneratingSectionIdx(null);
    }
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

    if (formData.sections.some(s => !s.title.trim() || !s.content.trim())) {
      toast.error("All product sections must have a title and content");
      return;
    }

    if (!formData.hasVariants) {
      const stock = parseInt(formData.stockQuantity) || 0;
      if (stock < 0) {
        toast.error("Stock cannot be negative");
        return;
      }
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

    // Variant validation
    if (formData.hasVariants && formData.variants.length === 0) {
      toast.error("Add at least one variant or disable variants");
      return;
    }

    setIsSaving(true);
    try {
      // Calculate total stock from variants
      const variantTotalStock = formData.hasVariants
        ? formData.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
        : parseInt(formData.stockQuantity) || 0;

      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        sections: formData.sections.map((s, idx) => ({ title: s.title.trim(), content: s.content.trim(), order: idx })),
        brand: formData.brand.trim() || null,
        sku: formData.sku.trim() || undefined,
        price,
        offerPrice,
        deliveryCharge: parseFloat(formData.deliveryCharge) || 0,
        stockQuantity: variantTotalStock,
        tags: formData.productType ? [...formData.tagChips.filter(t => t !== formData.productType), formData.productType] : formData.tagChips,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        thumbnailUrl: formData.thumbnailUrl,
        thumbnailPublicId: formData.thumbnailPublicId,
        images: formData.images,
        variants: formData.hasVariants
          ? formData.variants.map(v => ({
              ...v,
              price: v.price !== "" && v.price != null ? Number(v.price) : null,
              stockQuantity: v.stockQuantity !== "" && v.stockQuantity != null ? Number(v.stockQuantity) : 0,
              deliveryCharge: v.deliveryCharge !== "" && v.deliveryCharge != null ? Number(v.deliveryCharge) : null,
            }))
          : [],
        seoTitle: formData.seoTitle.trim() || null,
        seoDescription: formData.seoDescription.trim() || null,
        seoKeywords: formData.seoKeywords.filter(k => k.trim()),
        highlights: formData.highlights.filter(h => h.trim()),
        shippingBadgeTitle: formData.shippingBadgeTitle.trim() || null,
        shippingBadgeDesc: formData.shippingBadgeDesc.trim() || null,
        warrantyBadgeTitle: formData.warrantyBadgeTitle.trim() || null,
        warrantyBadgeDesc: formData.warrantyBadgeDesc.trim() || null,
        returnBadgeTitle: formData.returnBadgeTitle.trim() || null,
        returnBadgeDesc: formData.returnBadgeDesc.trim() || null,
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
      const newImages: ProductImage[] = uploaded.map((f: any, i: number) => ({
        url: f.url,
        public_id: f.public_id,
        alt: formData.name || "Product image",
        isPrimary: formData.images.length === 0 && i === 0,
      }));
      setFormData((prev) => {
        const updatedImages = [...prev.images, ...newImages];
        let newThumbUrl = prev.thumbnailUrl;
        let newThumbId = prev.thumbnailPublicId;
        
        if (prev.images.length === 0 && newImages.length > 0) {
          newThumbUrl = newImages[0].url;
          newThumbId = newImages[0].public_id || null;
        }
        
        return {
          ...prev,
          images: updatedImages,
          thumbnailUrl: newThumbUrl,
          thumbnailPublicId: newThumbId,
        };
      });
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
      let newThumbUrl = prev.thumbnailUrl;
      let newThumbId = prev.thumbnailPublicId;
      
      const removedImage = prev.images[index];
      
      // If removed image was primary, make first remaining primary
      if (removedImage.url === prev.thumbnailUrl || removedImage.isPrimary) {
        if (images.length > 0) {
          images[0].isPrimary = true;
          newThumbUrl = images[0].url;
          newThumbId = images[0].public_id || null;
        } else {
          newThumbUrl = null;
          newThumbId = null;
        }
      }
      return { 
        ...prev, 
        images,
        thumbnailUrl: newThumbUrl,
        thumbnailPublicId: newThumbId
      };
    });
  };

  const setPrimaryImage = (index: number) => {
    setFormData((prev) => {
      const selectedImg = prev.images[index];
      return {
        ...prev,
        thumbnailUrl: selectedImg.url,
        thumbnailPublicId: selectedImg.public_id || null,
        images: prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        })),
      };
    });
  };

  // --------------------------------
  // Variant management
  // --------------------------------
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size: "", color: "", model: "", sku: "", price: "", stockQuantity: "0", images: [], deliveryCharge: "" },
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

  // Per-variant image upload
  const handleVariantImageUpload = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const inputEl = e.target; // save ref before async
    if (!files || files.length === 0) return;
    setVariantUploadingIndex(variantIndex);
    try {
      const uploaded = await uploadImages(Array.from(files));
      const newImages: ProductImage[] = uploaded.map((f) => ({
        url: f.url,
        alt: formData.variants[variantIndex]?.color || "Variant image",
        isPrimary: false,
      }));
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === variantIndex ? { ...v, images: [...(v.images || []), ...newImages] } : v
        ),
      }));
      toast.success(`${uploaded.length} image(s) uploaded for variant`);
    } catch (err: any) {
      console.error("Variant image upload error:", err);
      toast.error(err?.message || "Failed to upload variant images");
    } finally {
      setVariantUploadingIndex(null);
      if (inputEl) inputEl.value = "";
    }
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIndex ? { ...v, images: (v.images || []).filter((_, j) => j !== imageIndex) } : v
      ),
    }));
  };

  // --------------------------------
  // Tag chip helpers
  // --------------------------------
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

  // --------------------------------
  // Computed values
  // --------------------------------
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const getProductImage = (product: Product) => {
    return product.thumbnailUrl || product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || "";
  };

  const variantTotalStock = useMemo(() => {
    if (!formData.hasVariants) return 0;
    return formData.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
  }, [formData.hasVariants, formData.variants]);

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
                  placeholder="Search by name, SKU, or tag..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
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
                          <TableCell className="text-right font-medium text-sm">
                            {formatPrice(p.price)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {p.offerPrice ? (
                              <div>
                                <span className="text-green-400">{formatPrice(p.offerPrice)}</span>
                                <div className="text-[10px] text-green-400/70">
                                  {Math.round(((p.price - p.offerPrice) / p.price) * 100)}% off
                                </div>
                              </div>
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
                                <span title="Featured">
                                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                </span>
                              )}
                              {p.offerPrice && (
                                <span title="Has Offer">
                                  <Tag className="h-3.5 w-3.5 text-green-400" />
                                </span>
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
              <TabsList className="w-full grid grid-cols-6 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
                <TabsTrigger value="images">Media</TabsTrigger>
                <TabsTrigger value="variants">
                  Variants
                  {formData.hasVariants && formData.variants.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                      {formData.variants.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="ai-seo">AI & SEO</TabsTrigger>
              </TabsList>

              {/* ── BASIC INFO TAB ── */}
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
                  <Select
                    value={formData.productType || "__none__"}
                    onValueChange={(v) => setFormData({ ...formData, productType: v === "__none__" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Select Type —</SelectItem>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.name.trim() && (
                  <div className="pt-1">
                    <Button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleGenerateContent}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium shadow-md transition-all duration-300 hover:scale-[1.01]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                          <span>Generating E-commerce Content...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 text-yellow-300 fill-yellow-300" />
                          <span>Generate Product Content with Gemini</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

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

                {/* Flags (Active/Featured) */}
                <Separator />
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

              {/* ── SECTIONS TAB ── */}
              <TabsContent value="sections" className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Layers className="h-4 w-4" /> Dynamic Sections
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add multiple informational sections (e.g. Material Used, Manufacturer Details).
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        sections: [...formData.sections, { title: "", content: "" }]
                      });
                    }}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Section
                  </Button>
                </div>

                {formData.sections.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg bg-card/20">
                    <p className="text-sm">No sections added yet.</p>
                    <p className="text-xs mt-1">Click &quot;Add Section&quot; to create dynamic product content.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.sections.map((section, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4 space-y-4 bg-card/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Section #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={() => {
                                  const newSections = [...formData.sections];
                                  const temp = newSections[idx - 1];
                                  newSections[idx - 1] = newSections[idx];
                                  newSections[idx] = temp;
                                  setFormData({ ...formData, sections: newSections });
                                }}
                              >
                                ↑
                              </Button>
                            )}
                            {idx < formData.sections.length - 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={() => {
                                  const newSections = [...formData.sections];
                                  const temp = newSections[idx + 1];
                                  newSections[idx + 1] = newSections[idx];
                                  newSections[idx] = temp;
                                  setFormData({ ...formData, sections: newSections });
                                }}
                              >
                                ↓
                              </Button>
                            )}
                            {formData.name.trim() && section.title.trim() && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-violet-400 hover:text-violet-300"
                                title="Regenerate section with Gemini"
                                disabled={isRegeneratingSectionIdx === idx}
                                onClick={() => handleRegenerateSection(idx)}
                              >
                                {isRegeneratingSectionIdx === idx ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                const newSections = [...formData.sections];
                                newSections.splice(idx, 1);
                                setFormData({ ...formData, sections: newSections });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Topic / Heading *</Label>
                          <Input
                            placeholder="e.g. Product Description, Dimensions"
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...formData.sections];
                              newSections[idx].title = e.target.value;
                              setFormData({ ...formData, sections: newSections });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Passage / Content *</Label>
                          <Textarea
                            rows={5}
                            placeholder="Section content (supports multiple lines)..."
                            value={section.content}
                            onChange={(e) => {
                              const newSections = [...formData.sections];
                              newSections[idx].content = e.target.value;
                              setFormData({ ...formData, sections: newSections });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── PRICING & STOCK TAB ── */}
              <TabsContent value="pricing" className="space-y-5 pb-4">
                {/* Price Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Percent className="h-4 w-4" /> Pricing
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPercent">Discount %</Label>
                      <Input
                        id="discountPercent"
                        type="number"
                        min="0"
                        max="99"
                        value={formData.discountPercent}
                        onChange={(e) => handleDiscountPercentChange(e.target.value)}
                        placeholder="e.g. 15"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                      <Input
                        id="offerPrice"
                        type="number"
                        min="0"
                        value={formData.offerPrice}
                        onChange={(e) => handleOfferPriceChange(e.target.value)}
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>
                  {/* Discount preview */}
                  {formData.price && formData.offerPrice && parseFloat(formData.offerPrice) < parseFloat(formData.price) && (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-sm flex items-center gap-3">
                      <Tag className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <div>
                        <span className="text-green-400 font-semibold">
                          {Math.round(
                            ((parseFloat(formData.price) - parseFloat(formData.offerPrice)) /
                              parseFloat(formData.price)) *
                            100
                          )}% discount
                        </span>
                        <span className="text-green-400/70">
                          {" "}— Customer pays {formatPrice(parseFloat(formData.offerPrice))}{" "}
                          (saves {formatPrice(parseFloat(formData.price) - parseFloat(formData.offerPrice))})
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price (₹) <span className="text-muted-foreground text-xs">(internal only)</span></Label>
                      <Input
                        id="costPrice"
                        type="number"
                        min="0"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        placeholder="Optional — your purchase cost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCharge">Delivery Charge (₹) *</Label>
                      <Input
                        id="deliveryCharge"
                        type="number"
                        min="0"
                        value={formData.deliveryCharge}
                        onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stock Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4" /> Inventory
                  </h3>

                  {formData.hasVariants ? (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3 text-sm flex items-center gap-3">
                      <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-blue-400">
                        Stock is managed per variant. Total across variants:{" "}
                        <span className="font-bold">{variantTotalStock} units</span>
                      </span>
                    </div>
                  ) : (
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
                  )}
                </div>
              </TabsContent>

              {/* ── MEDIA TAB ── */}
              <TabsContent value="images" className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label>Product Images *</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload up to 5 images. Click the star to set the primary/thumbnail image.
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
                            title="Set as thumbnail"
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
                            THUMBNAIL
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── VARIANTS TAB ── */}
              <TabsContent value="variants" className="space-y-4 pb-4">
                {/* Has Variants Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="hasVariants" className="text-sm font-medium">
                        This product has variants
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enable for products with different sizes, colors, or models
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="hasVariants"
                    checked={formData.hasVariants}
                    onCheckedChange={(v) => {
                      setFormData({ ...formData, hasVariants: v });
                      if (!v) {
                        // When disabling variants, optionally keep them in case user re-enables
                      }
                    }}
                  />
                </div>

                {formData.hasVariants ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Each variant = one combination (e.g. Black/M, Black/L, Red/M).
                          Set price override per variant or leave blank to use base price.
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
                                {variant.color && <span className="ml-1 text-primary"> — {variant.color}</span>}
                                {variant.size && <span className="ml-1 text-blue-400"> / {variant.size}</span>}
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
                                placeholder="Color (e.g. Black)"
                                value={variant.color || ""}
                                onChange={(e) => updateVariant(i, "color", e.target.value)}
                              />
                              <Input
                                placeholder="Size (e.g. M, L)"
                                value={variant.size || ""}
                                onChange={(e) => updateVariant(i, "size", e.target.value)}
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
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Price Override (₹)</Label>
                                <Input
                                  type="number"
                                  placeholder={`Base: ${formData.price || "—"}`}
                                  value={variant.price ?? ""}
                                  onChange={(e) => updateVariant(i, "price", e.target.value ? Number(e.target.value) : "")}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Delivery Override (₹)</Label>
                                <Input
                                  type="number"
                                  placeholder={`Base: ${formData.deliveryCharge || "0"}`}
                                  value={variant.deliveryCharge ?? ""}
                                  onChange={(e) => updateVariant(i, "deliveryCharge", e.target.value ? Number(e.target.value) : "")}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Stock Quantity *</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={variant.stockQuantity ?? 0}
                                  onChange={(e) => updateVariant(i, "stockQuantity", Number(e.target.value) || 0)}
                                />
                              </div>
                            </div>

                            {/* Per-Variant Image Upload */}
                            <div className="space-y-2 pt-2 border-t border-border/60">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">
                                  Variant Images
                                  {variant.color && <span className="text-primary"> ({variant.color})</span>}
                                </Label>
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleVariantImageUpload(i, e)}
                                    disabled={variantUploadingIndex === i}
                                  />
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors">
                                    {variantUploadingIndex === i ? (
                                      <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
                                    ) : (
                                      <><ImageUp className="h-3 w-3" /> Upload</>
                                    )}
                                  </span>
                                </label>
                              </div>
                              {(variant.images && variant.images.length > 0) && (
                                <div className="flex flex-wrap gap-2">
                                  {variant.images.map((img, j) => (
                                    <div key={j} className="relative group h-16 w-16 rounded-md overflow-hidden border border-border">
                                      <img src={img.url} alt={img.alt || "variant"} className="h-full w-full object-cover" />
                                      <button
                                        type="button"
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        onClick={() => removeVariantImage(i, j)}
                                      >
                                        <X className="h-3.5 w-3.5 text-red-400" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {(!variant.images || variant.images.length === 0) && (
                                <p className="text-xs text-muted-foreground italic">No images — will use product default images</p>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Variant stock summary */}
                        <div className="rounded-lg bg-muted/50 border border-border p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Stock (all variants)</span>
                            <span className="font-bold text-foreground">{variantTotalStock} units</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Variants are disabled for this product.</p>
                    <p className="text-xs mt-1">Enable the toggle above to add size, color, or model variations.</p>
                  </div>
                )}
              </TabsContent>

              {/* ── AI & SEO TAB ── */}
              <TabsContent value="ai-seo" className="space-y-6 pb-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-400" /> AI & Search Engine Optimization
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage product highlights (feature badges) and search meta parameters.
                    </p>
                  </div>
                  {formData.name.trim() && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-violet-500/30 hover:bg-violet-500/10 text-violet-400"
                      disabled={isGenerating}
                      onClick={handleGenerateContent}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          Regenerate SEO
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Highlights */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Product Highlights / Badges</Label>
                    <p className="text-xs text-muted-foreground">
                      Key features displayed prominently as badge tags (e.g. "Dual Visor", "Pinlock Pin Included").
                    </p>
                    <div className="flex flex-wrap gap-1.5 p-3 border border-border rounded-md bg-background min-h-[50px]">
                      {formData.highlights.map((hl, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {hl}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.highlights.filter((_, i) => i !== idx);
                              setFormData({ ...formData, highlights: updated });
                            }}
                            className="ml-0.5 rounded-full hover:bg-emerald-500/20 p-0.5 text-emerald-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <input
                        placeholder={formData.highlights.length === 0 ? "Type a highlight and press enter..." : "Add highlight..."}
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const val = newHighlight.trim();
                            if (val && !formData.highlights.includes(val)) {
                              setFormData({ ...formData, highlights: [...formData.highlights, val] });
                              setNewHighlight("");
                            }
                          }
                        }}
                        className="flex-1 min-w-[150px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Trust Badges */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trust Badges / Policies</h4>
                    <p className="text-xs text-muted-foreground">
                      Customize the titles and descriptions displayed on the product page. Leave blank to use default values.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 border border-border p-4 rounded-lg bg-card/20">
                      <div className="space-y-2">
                        <Label htmlFor="shippingBadgeTitle">Shipping Badge Title</Label>
                        <Input
                          id="shippingBadgeTitle"
                          value={formData.shippingBadgeTitle}
                          onChange={(e) => setFormData({ ...formData, shippingBadgeTitle: e.target.value })}
                          placeholder="Default: Free Shipping"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingBadgeDesc">Shipping Badge Subtext</Label>
                        <Input
                          id="shippingBadgeDesc"
                          value={formData.shippingBadgeDesc}
                          onChange={(e) => setFormData({ ...formData, shippingBadgeDesc: e.target.value })}
                          placeholder="Default: Orders ₹5000+"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border border-border p-4 rounded-lg bg-card/20">
                      <div className="space-y-2">
                        <Label htmlFor="warrantyBadgeTitle">Warranty Badge Title</Label>
                        <Input
                          id="warrantyBadgeTitle"
                          value={formData.warrantyBadgeTitle}
                          onChange={(e) => setFormData({ ...formData, warrantyBadgeTitle: e.target.value })}
                          placeholder="Default: Warranty"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warrantyBadgeDesc">Warranty Badge Subtext</Label>
                        <Input
                          id="warrantyBadgeDesc"
                          value={formData.warrantyBadgeDesc}
                          onChange={(e) => setFormData({ ...formData, warrantyBadgeDesc: e.target.value })}
                          placeholder="Default: 1 Year"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border border-border p-4 rounded-lg bg-card/20">
                      <div className="space-y-2">
                        <Label htmlFor="returnBadgeTitle">Returns Badge Title</Label>
                        <Input
                          id="returnBadgeTitle"
                          value={formData.returnBadgeTitle}
                          onChange={(e) => setFormData({ ...formData, returnBadgeTitle: e.target.value })}
                          placeholder="Default: Easy Returns"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="returnBadgeDesc">Returns Badge Subtext</Label>
                        <Input
                          id="returnBadgeDesc"
                          value={formData.returnBadgeDesc}
                          onChange={(e) => setFormData({ ...formData, returnBadgeDesc: e.target.value })}
                          placeholder="Default: 30 Days"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* SEO Meta */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search Engine Settings</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="seoTitle">Meta Title</Label>
                        <span className={`text-xs ${formData.seoTitle.length > 60 ? 'text-yellow-500 font-semibold' : 'text-muted-foreground'}`}>
                          {formData.seoTitle.length}/60 chars
                        </span>
                      </div>
                      <Input
                        id="seoTitle"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="Google Search title (recommended < 60 chars)"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="seoDescription">Meta Description</Label>
                        <span className={`text-xs ${formData.seoDescription.length > 160 ? 'text-yellow-500 font-semibold' : 'text-muted-foreground'}`}>
                          {formData.seoDescription.length}/160 chars
                        </span>
                      </div>
                      <Textarea
                        id="seoDescription"
                        rows={3}
                        value={formData.seoDescription}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                        placeholder="Search snippet description (recommended < 160 chars)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <div className="flex flex-wrap gap-1.5 p-3 border border-border rounded-md bg-background min-h-[50px]">
                        {formData.seoKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {kw}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.seoKeywords.filter((_, i) => i !== idx);
                                setFormData({ ...formData, seoKeywords: updated });
                              }}
                              className="ml-0.5 rounded-full hover:bg-indigo-500/20 p-0.5 text-indigo-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        <input
                          placeholder={formData.seoKeywords.length === 0 ? "Type a keyword and press enter..." : "Add keyword..."}
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              const val = newKeyword.trim();
                              if (val && !formData.seoKeywords.includes(val)) {
                                setFormData({ ...formData, seoKeywords: [...formData.seoKeywords, val] });
                                setNewKeyword("");
                              }
                            }
                          }}
                          className="flex-1 min-w-[150px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
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
