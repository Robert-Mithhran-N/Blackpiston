export interface ProductVariantImage {
    url: string;
    alt?: string;
    isPrimary?: boolean;
}

export interface ProductVariant {
    id?: string;
    size?: string;
    color?: string;
    model?: string;
    sku: string;
    stockQuantity: number;
    price?: number;
    priceModifier?: number;
    images?: ProductVariantImage[];
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    offerPrice?: number;
    image: string;
    images?: string[];
    rating: number;
    description?: string;
    shortDescription?: string;
    inStock: boolean;
    featured?: boolean;
    isTopOffer?: boolean;
    specifications?: { label: string; value: string }[];
    variants?: ProductVariant[];
    stockQuantity?: number;
}

export type ProductCategory = string;

// ============================================================
// Category Types
// ============================================================
export interface Category {
    id: ProductCategory;
    name: string;
    image: string;
    description: string;
    productCount: number;
}

// ============================================================
// Service Types
// ============================================================
export interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    duration: string;
}

// ============================================================
// Build Kit Types
// ============================================================
export interface BuildKit {
    id: string;
    name: string;
    description: string;
    products: string[];
    totalPrice: number;
    discountedPrice: number;
    image: string;
}

// ============================================================
// Cart Item Types
// ============================================================
export interface CartItem {
    product: Product;
    variantId?: string;
    variantLabel?: string;
    quantity: number;
}

// ============================================================
// Brand Logo Types
// ============================================================
export interface BrandLogo {
    id: string;
    name: string;
    image: string;
    altText: string;
}
