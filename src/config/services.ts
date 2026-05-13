// Static business configuration data
// Services offered by BlackPiston Garage and curated build kits
// These are managed by the business and not user-generated content

import { Service, BuildKit } from '@/types/user';

// ============================================================
// Garage Services
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
// Curated Build Kits (reference product IDs from the database)
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
