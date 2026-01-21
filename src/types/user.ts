// User Website TypeScript Types

// ============================================================
// Product Types
// ============================================================
export interface Product {
    id: string;
    name: string;
    category: ProductCategory;
    price: number;
    offerPrice?: number;
    image: string;
    rating: number;
    description?: string;
    inStock: boolean;
    featured?: boolean;
    isTopOffer?: boolean;
}

export type ProductCategory = 'helmets' | 'jackets' | 'boots' | 'accessories';

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
