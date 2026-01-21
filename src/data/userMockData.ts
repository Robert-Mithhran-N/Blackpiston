// User Website Mock Data
// Demo data for products, categories, and services

import { Product, Category, Service, BuildKit } from '@/types/user';

// ============================================================
// Categories
// ============================================================
export const categories: Category[] = [
    {
        id: 'helmets',
        name: 'Helmets',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        description: 'Premium motorcycle helmets for maximum protection',
        productCount: 12,
    },
    {
        id: 'jackets',
        name: 'Riding Jackets',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
        description: 'Stylish and protective riding jackets',
        productCount: 8,
    },
    {
        id: 'boots',
        name: 'Riding Boots',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
        description: 'Durable boots built for the road',
        productCount: 6,
    },
    {
        id: 'accessories',
        name: 'Accessories',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        description: 'Gloves, bags, and essential riding gear',
        productCount: 15,
    },
];

// ============================================================
// Products
// ============================================================
export const products: Product[] = [
    // Helmets
    {
        id: 'PRD-001',
        name: 'AGV Pista GP RR - Rossi Misano',
        category: 'helmets',
        price: 125000,
        offerPrice: 99999,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        rating: 4.9,
        description: 'MotoGP-grade helmet with advanced aerodynamics',
        inStock: true,
        featured: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-002',
        name: 'Shoei X-Fourteen Marquez',
        category: 'helmets',
        price: 89999,
        offerPrice: 74999,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        rating: 4.8,
        description: 'Premium racing helmet with excellent ventilation',
        inStock: true,
        featured: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-003',
        name: 'Arai RX-7V Evo',
        category: 'helmets',
        price: 95000,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        rating: 4.7,
        description: 'Handcrafted Japanese helmet with superior protection',
        inStock: true,
        featured: false,
    },
    {
        id: 'PRD-004',
        name: 'AGV K6 S - Matte Black',
        category: 'helmets',
        price: 45999,
        offerPrice: 38999,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        rating: 4.6,
        description: 'Lightweight touring helmet with premium comfort',
        inStock: true,
        featured: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-005',
        name: 'HJC RPHA 11 Pro',
        category: 'helmets',
        price: 55999,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        rating: 4.5,
        description: 'Professional grade helmet for track and street',
        inStock: true,
    },

    // Jackets
    {
        id: 'PRD-006',
        name: 'Dainese Racing 4 Leather Jacket',
        category: 'jackets',
        price: 89999,
        offerPrice: 71999,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
        rating: 4.8,
        description: 'Premium leather racing jacket with D-air integration',
        inStock: true,
        featured: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-007',
        name: 'Alpinestars GP Plus R V4',
        category: 'jackets',
        price: 75999,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
        rating: 4.7,
        description: 'Race-ready leather jacket with maximum protection',
        inStock: true,
        featured: true,
    },
    {
        id: 'PRD-008',
        name: 'Rev\'It Quantum 2 Air',
        category: 'jackets',
        price: 52999,
        offerPrice: 44999,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
        rating: 4.6,
        description: 'Ventilated summer jacket for hot weather riding',
        inStock: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-009',
        name: 'Dainese Super Speed Tex',
        category: 'jackets',
        price: 45999,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
        rating: 4.5,
        description: 'Textile jacket with leather reinforcements',
        inStock: true,
    },

    // Boots
    {
        id: 'PRD-010',
        name: 'Alpinestars Supertech R',
        category: 'boots',
        price: 58999,
        offerPrice: 49999,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        rating: 4.9,
        description: 'MotoGP-spec racing boots with biomechanical protection',
        inStock: true,
        featured: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-011',
        name: 'TCX RT-Race Pro Air',
        category: 'boots',
        price: 42999,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        rating: 4.7,
        description: 'Ventilated racing boots for track and street',
        inStock: true,
        featured: true,
    },
    {
        id: 'PRD-012',
        name: 'Dainese Axial D1',
        category: 'boots',
        price: 65999,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        rating: 4.8,
        description: 'Professional racing boots with magnetic slider',
        inStock: true,
    },
    {
        id: 'PRD-013',
        name: 'Alpinestars SMX-6 V2',
        category: 'boots',
        price: 28999,
        offerPrice: 24999,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        rating: 4.5,
        description: 'Sport boots with excellent ankle support',
        inStock: true,
    },

    // Accessories
    {
        id: 'PRD-014',
        name: 'Alpinestars GP Pro R3 Gloves',
        category: 'accessories',
        price: 18999,
        offerPrice: 15999,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        rating: 4.8,
        description: 'Premium racing gloves with kangaroo leather palm',
        inStock: true,
        featured: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-015',
        name: 'Dainese Carbon D1 Long Gloves',
        category: 'accessories',
        price: 22999,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        rating: 4.7,
        description: 'Long gauntlet gloves with carbon fiber knuckle protection',
        inStock: true,
        featured: true,
    },
    {
        id: 'PRD-016',
        name: 'Ogio Mach 3 Backpack',
        category: 'accessories',
        price: 12999,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        rating: 4.6,
        description: 'Aerodynamic motorcycle backpack with laptop compartment',
        inStock: true,
    },
    {
        id: 'PRD-017',
        name: 'Cardo Packtalk Edge',
        category: 'accessories',
        price: 35999,
        offerPrice: 29999,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        rating: 4.9,
        description: 'Premium bluetooth intercom with JBL speakers',
        inStock: true,
        isTopOffer: true,
    },
    {
        id: 'PRD-018',
        name: 'Rev\'It Striker 3 Gloves',
        category: 'accessories',
        price: 15999,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        rating: 4.5,
        description: 'Short cuff sport gloves with touchscreen fingertips',
        inStock: true,
    },
];

// ============================================================
// Services
// ============================================================
export const services: Service[] = [
    {
        id: 'SRV-001',
        name: 'Helmet Installation & Setup',
        price: 999,
        description: 'Professional helmet fitting with padding adjustment and visor setup',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        duration: '30 mins',
    },
    {
        id: 'SRV-002',
        name: 'General Bike Service',
        price: 2499,
        description: 'Oil change, brake check, chain lubrication, and overall inspection',
        image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=300&fit=crop',
        duration: '2-3 hours',
    },
    {
        id: 'SRV-003',
        name: 'LED Lighting Upgrade',
        price: 4999,
        description: 'Install premium LED headlights, indicators, and auxiliary lights',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop',
        duration: '1-2 hours',
    },
    {
        id: 'SRV-004',
        name: 'Exhaust System Installation',
        price: 3999,
        description: 'Professional slip-on or full-system exhaust installation',
        image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=300&fit=crop',
        duration: '1-2 hours',
    },
    {
        id: 'SRV-005',
        name: 'Suspension Setup',
        price: 5999,
        description: 'Custom suspension tuning for your riding style and weight',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=300&fit=crop',
        duration: '2-3 hours',
    },
    {
        id: 'SRV-006',
        name: 'Graphics & Wrap',
        price: 8999,
        description: 'Custom vinyl wraps and graphics installation',
        image: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=400&h=300&fit=crop',
        duration: '1-2 days',
    },
];

// ============================================================
// Build Kits
// ============================================================
export const buildKits: BuildKit[] = [
    {
        id: 'KIT-001',
        name: 'Racing Starter Kit',
        description: 'Complete racing setup with helmet, jacket, gloves, and boots',
        products: ['PRD-004', 'PRD-008', 'PRD-013', 'PRD-014'],
        totalPrice: 129996,
        discountedPrice: 109999,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    },
    {
        id: 'KIT-002',
        name: 'Pro Racer Bundle',
        description: 'Premium gear for serious track enthusiasts',
        products: ['PRD-001', 'PRD-006', 'PRD-010', 'PRD-015'],
        totalPrice: 296997,
        discountedPrice: 249999,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop',
    },
    {
        id: 'KIT-003',
        name: 'Touring Comfort Pack',
        description: 'Essential gear for long-distance touring',
        products: ['PRD-003', 'PRD-009', 'PRD-011', 'PRD-016'],
        totalPrice: 156996,
        discountedPrice: 134999,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
    },
];

// ============================================================
// Helper Functions
// ============================================================
export const getProductsByCategory = (category: string): Product[] => {
    return products.filter((p) => p.category === category);
};

export const getTopOffers = (): Product[] => {
    return products.filter((p) => p.isTopOffer);
};

export const getFeaturedProducts = (): Product[] => {
    return products.filter((p) => p.featured);
};

export const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
};

export const getCategoryById = (id: string): Category | undefined => {
    return categories.find((c) => c.id === id);
};
