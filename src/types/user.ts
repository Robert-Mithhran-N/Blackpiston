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
    deliveryCharge?: number;
}
export interface ProductSection {
    id?: string;
    title: string;
    content: string;
    order?: number;
}

export interface Product {
    id: string;
    slug?: string;
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
    sections?: ProductSection[];
    deliveryCharge?: number;
    shippingBadgeTitle?: string;
    shippingBadgeDesc?: string;
    warrantyBadgeTitle?: string;
    warrantyBadgeDesc?: string;
    returnBadgeTitle?: string;
    returnBadgeDesc?: string;
    totalReviews?: number;
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
    slug?: string;
    price: number;
    description: string;
    image?: string;
    duration: string;
    category?: string;
    isActive: boolean;
    
    // Management Toggles
    status?: 'AVAILABLE' | 'UNAVAILABLE' | 'COMING_SOON' | 'SEASONAL' | 'ARCHIVED';
    visible?: boolean;
    featured?: boolean;
    displayOrder?: number;
    
    // Detailed Lists
    highlights?: string[];
    included?: string[];
    benefits?: string[];
    process?: string[];
    supportedBikes?: string;

    // Engagement Metrics
    views?: number;
    clicks?: number;
    inquiries?: number;
    
    createdAt?: string;
    updatedAt?: string;
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
