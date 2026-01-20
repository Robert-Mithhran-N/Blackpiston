// Hardcoded product data for UI development only
// No backend, APIs, or database connections

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  stockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock';
  badge?: 'New' | 'Best Seller' | 'Track Rated' | 'Limited Edition';
  category: string;
  subcategory?: string;
  type?: string;
  sizes?: string[];
  sizeRange?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

// Placeholder image URLs (consistent aspect ratios)
const PLACEHOLDER_IMAGES = {
  helmet: '/placeholder-helmet.jpg',
  jacket: '/placeholder-jacket.jpg',
  gloves: '/placeholder-gloves.jpg',
  boots: '/placeholder-boots.jpg',
  accessory: '/placeholder-accessory.jpg',
};

// Category icons
const CATEGORY_ICONS = {
  helmets: '/icons/helmet-icon.svg',
  jackets: '/icons/jacket-icon.svg',
  gloves: '/icons/gloves-icon.svg',
  boots: '/icons/boots-icon.svg',
  accessories: '/icons/accessories-icon.svg',
};

// Helmet Products
const helmetProducts: Product[] = [
  // AGV Helmets
  {
    id: 'AGV-001',
    name: 'Pista GP RR',
    brand: 'AGV',
    price: 89999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'AGV-002',
    name: 'K6 S',
    brand: 'AGV',
    price: 45999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'AGV-003',
    name: 'K3 SV',
    brand: 'AGV',
    price: 32999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'Low Stock',
    category: 'Helmets',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  // Shoei Helmets
  {
    id: 'SHOEI-001',
    name: 'X-Fourteen',
    brand: 'Shoei',
    price: 95999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'SHOEI-002',
    name: 'RF-1400',
    brand: 'Shoei',
    price: 67999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'SHOEI-003',
    name: 'GT-Air III',
    brand: 'Shoei',
    price: 78999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'New',
    category: 'Helmets',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  // Arai Helmets
  {
    id: 'ARAI-001',
    name: 'RX-7V',
    brand: 'Arai',
    price: 85999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'ARAI-002',
    name: 'Corsair-X',
    brand: 'Arai',
    price: 72999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    category: 'Helmets',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'ARAI-003',
    name: 'Quantum-X',
    brand: 'Arai',
    price: 58999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'Out of Stock',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  // Bell Helmets
  {
    id: 'BELL-001',
    name: 'Race Star Flex DLX',
    brand: 'Bell',
    price: 65999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Helmets',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'BELL-002',
    name: 'Star DLX MIPS',
    brand: 'Bell',
    price: 42999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'BELL-003',
    name: 'Qualifier DLX',
    brand: 'Bell',
    price: 28999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    category: 'Helmets',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  // HJC Helmets
  {
    id: 'HJC-001',
    name: 'RPHA 11 Pro',
    brand: 'HJC',
    price: 38999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'HJC-002',
    name: 'F70',
    brand: 'HJC',
    price: 25999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'Low Stock',
    badge: 'New',
    category: 'Helmets',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'HJC-003',
    name: 'i10',
    brand: 'HJC',
    price: 18999,
    image: PLACEHOLDER_IMAGES.helmet,
    stockStatus: 'In Stock',
    category: 'Helmets',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
];

// Riding Jacket Products
const jacketProducts: Product[] = [
  // Alpinestars Jackets
  {
    id: 'ALP-001',
    name: 'GP Plus R v3',
    brand: 'Alpinestars',
    price: 89999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Jackets',
    type: 'Leather',
    sizes: ['46', '48', '50', '52', '54', '56', '58'],
  },
  {
    id: 'ALP-002',
    name: 'T-Jaws v4',
    brand: 'Alpinestars',
    price: 65999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Riding Jackets',
    type: 'Textile',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'ALP-003',
    name: 'Wake Air',
    brand: 'Alpinestars',
    price: 42999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'New',
    category: 'Riding Jackets',
    type: 'Mesh',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  // Dainese Jackets
  {
    id: 'DAI-001',
    name: 'Racing 4',
    brand: 'Dainese',
    price: 125999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Jackets',
    type: 'Leather',
    sizes: ['46', '48', '50', '52', '54', '56'],
  },
  {
    id: 'DAI-002',
    name: 'Super Speed Tex',
    brand: 'Dainese',
    price: 78999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'Low Stock',
    badge: 'Best Seller',
    category: 'Riding Jackets',
    type: 'Textile',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'DAI-003',
    name: 'Air Master Tex',
    brand: 'Dainese',
    price: 58999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    category: 'Riding Jackets',
    type: 'Mesh',
    sizes: ['M', 'L', 'XL'],
  },
  // Rev'It Jackets
  {
    id: 'REV-001',
    name: 'Quantum 2',
    brand: "Rev'It",
    price: 95999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Jackets',
    type: 'Leather',
    sizes: ['46', '48', '50', '52', '54'],
  },
  {
    id: 'REV-002',
    name: 'Defender Pro GTX',
    brand: "Rev'It",
    price: 72999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Riding Jackets',
    type: 'Textile',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'REV-003',
    name: 'Airwave 3',
    brand: "Rev'It",
    price: 48999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'New',
    category: 'Riding Jackets',
    type: 'Mesh',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  // RST Jackets
  {
    id: 'RST-001',
    name: 'Race Dept V4.1',
    brand: 'RST',
    price: 68999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Jackets',
    type: 'Leather',
    sizes: ['46', '48', '50', '52', '54', '56'],
  },
  {
    id: 'RST-002',
    name: 'Pro Series Ventilator X',
    brand: 'RST',
    price: 45999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'In Stock',
    category: 'Riding Jackets',
    type: 'Textile',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'RST-003',
    name: 'Blade Sport II',
    brand: 'RST',
    price: 32999,
    image: PLACEHOLDER_IMAGES.jacket,
    stockStatus: 'Out of Stock',
    category: 'Riding Jackets',
    type: 'Mesh',
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
];

// Riding Gloves Products
const glovesProducts: Product[] = [
  // Full Gauntlet Gloves
  {
    id: 'GLV-001',
    name: 'GP Pro R3',
    brand: 'Alpinestars',
    price: 28999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Gloves',
    type: 'Full Gauntlet',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'GLV-002',
    name: 'Full Metal 6',
    brand: 'Dainese',
    price: 32999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Gloves',
    type: 'Full Gauntlet',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'GLV-003',
    name: 'Jerez 3',
    brand: "Rev'It",
    price: 24999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'Low Stock',
    badge: 'Best Seller',
    category: 'Riding Gloves',
    type: 'Full Gauntlet',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  // Short Cuff Gloves
  {
    id: 'GLV-004',
    name: 'SMX-1 Air v2',
    brand: 'Alpinestars',
    price: 18999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Riding Gloves',
    type: 'Short Cuff',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'GLV-005',
    name: 'Mig C2',
    brand: 'Dainese',
    price: 22999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    category: 'Riding Gloves',
    type: 'Short Cuff',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'GLV-006',
    name: 'Striker 3',
    brand: "Rev'It",
    price: 16999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    badge: 'New',
    category: 'Riding Gloves',
    type: 'Short Cuff',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  // Summer Gloves
  {
    id: 'GLV-007',
    name: 'Reef',
    brand: 'Alpinestars',
    price: 12999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    category: 'Riding Gloves',
    type: 'Summer',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'GLV-008',
    name: 'Air Hero Unisex',
    brand: 'Dainese',
    price: 14999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'Low Stock',
    badge: 'Best Seller',
    category: 'Riding Gloves',
    type: 'Summer',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'GLV-009',
    name: 'Velocity',
    brand: "Rev'It",
    price: 11999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    category: 'Riding Gloves',
    type: 'Summer',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  // Track Gloves
  {
    id: 'GLV-010',
    name: 'GP Tech v2',
    brand: 'Alpinestars',
    price: 35999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Gloves',
    type: 'Track',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'GLV-011',
    name: 'Druid 3',
    brand: 'Dainese',
    price: 38999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'Out of Stock',
    badge: 'Track Rated',
    category: 'Riding Gloves',
    type: 'Track',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'GLV-012',
    name: 'Metis',
    brand: "Rev'It",
    price: 29999,
    image: PLACEHOLDER_IMAGES.gloves,
    stockStatus: 'In Stock',
    badge: 'Limited Edition',
    category: 'Riding Gloves',
    type: 'Track',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

// Riding Boots Products
const bootsProducts: Product[] = [
  // Track Boots
  {
    id: 'BOOT-001',
    name: 'Supertech R',
    brand: 'Alpinestars',
    price: 68999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Boots',
    type: 'Track Boots',
    sizeRange: '39-47',
  },
  {
    id: 'BOOT-002',
    name: 'Torque 3 Out',
    brand: 'Dainese',
    price: 72999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Riding Boots',
    type: 'Track Boots',
    sizeRange: '39-48',
  },
  {
    id: 'BOOT-003',
    name: 'Jerez Pro',
    brand: "Rev'It",
    price: 58999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'Low Stock',
    badge: 'Best Seller',
    category: 'Riding Boots',
    type: 'Track Boots',
    sizeRange: '40-47',
  },
  // Touring Boots
  {
    id: 'BOOT-004',
    name: 'Corozal Adventure',
    brand: 'Alpinestars',
    price: 45999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Riding Boots',
    type: 'Touring Boots',
    sizeRange: '39-48',
  },
  {
    id: 'BOOT-005',
    name: 'Fulcrum GT Gore-Tex',
    brand: 'Dainese',
    price: 52999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'In Stock',
    badge: 'New',
    category: 'Riding Boots',
    type: 'Touring Boots',
    sizeRange: '40-47',
  },
  {
    id: 'BOOT-006',
    name: 'Discovery OutDry',
    brand: "Rev'It",
    price: 38999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'In Stock',
    category: 'Riding Boots',
    type: 'Touring Boots',
    sizeRange: '39-47',
  },
  // Riding Shoes
  {
    id: 'BOOT-007',
    name: 'Sektor',
    brand: 'Alpinestars',
    price: 28999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Riding Boots',
    type: 'Riding Shoes',
    sizeRange: '39-47',
  },
  {
    id: 'BOOT-008',
    name: 'Street Darker Gore-Tex',
    brand: 'Dainese',
    price: 32999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'In Stock',
    category: 'Riding Boots',
    type: 'Riding Shoes',
    sizeRange: '40-48',
  },
  {
    id: 'BOOT-009',
    name: 'Jefferson',
    brand: "Rev'It",
    price: 24999,
    image: PLACEHOLDER_IMAGES.boots,
    stockStatus: 'Out of Stock',
    badge: 'New',
    category: 'Riding Boots',
    type: 'Riding Shoes',
    sizeRange: '39-46',
  },
];

// Accessories Products
const accessoryProducts: Product[] = [
  // Lighting & Electrical
  {
    id: 'ACC-001',
    name: 'LED Headlight Kit H4',
    brand: 'Philips',
    price: 8999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Accessories',
    subcategory: 'Lighting & Electrical',
  },
  {
    id: 'ACC-002',
    name: 'Sequential LED Blinkers',
    brand: 'Motodynamic',
    price: 5999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    badge: 'New',
    category: 'Accessories',
    subcategory: 'Lighting & Electrical',
  },
  {
    id: 'ACC-003',
    name: 'Integrated Tail Light',
    brand: 'TST Industries',
    price: 12999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'Low Stock',
    category: 'Accessories',
    subcategory: 'Lighting & Electrical',
  },
  // Controls & Hardware
  {
    id: 'ACC-004',
    name: 'Clip-On Handlebars',
    brand: 'Woodcraft',
    price: 18999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Accessories',
    subcategory: 'Controls & Hardware',
  },
  {
    id: 'ACC-005',
    name: 'Adjustable Levers Set',
    brand: 'ASV',
    price: 24999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Accessories',
    subcategory: 'Controls & Hardware',
  },
  {
    id: 'ACC-006',
    name: 'Bar End Mirrors',
    brand: 'CRG',
    price: 15999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    category: 'Accessories',
    subcategory: 'Controls & Hardware',
  },
  // Maintenance & Care
  {
    id: 'ACC-007',
    name: 'Synthetic Engine Oil 10W-40',
    brand: 'Motul',
    price: 2999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    badge: 'Best Seller',
    category: 'Accessories',
    subcategory: 'Maintenance & Care',
  },
  {
    id: 'ACC-008',
    name: 'Chain Lube Spray',
    brand: 'DID',
    price: 899,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    category: 'Accessories',
    subcategory: 'Maintenance & Care',
  },
  {
    id: 'ACC-009',
    name: 'Cleaning Brush Set',
    brand: 'Chemical Guys',
    price: 1599,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    badge: 'New',
    category: 'Accessories',
    subcategory: 'Maintenance & Care',
  },
  {
    id: 'ACC-010',
    name: 'Floating Brake Disc 320mm',
    brand: 'Brembo',
    price: 35999,
    image: PLACEHOLDER_IMAGES.accessory,
    stockStatus: 'In Stock',
    badge: 'Track Rated',
    category: 'Accessories',
    subcategory: 'Brake Components',
  },
];

// Combine all products
export const allProducts: Product[] = [
  ...helmetProducts,
  ...jacketProducts,
  ...glovesProducts,
  ...bootsProducts,
  ...accessoryProducts,
];

// Main shop categories (simplified for category selection)
export const shopCategories: Category[] = [
  {
    id: 'helmets',
    name: 'Helmets',
    icon: CATEGORY_ICONS.helmets,
    products: helmetProducts,
  },
  {
    id: 'gloves-jackets',
    name: 'Gloves & Jackets',
    icon: CATEGORY_ICONS.jackets,
    products: [...glovesProducts, ...jacketProducts],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    icon: CATEGORY_ICONS.boots,
    products: bootsProducts,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: CATEGORY_ICONS.accessories,
    products: accessoryProducts,
  },
];

// Keep original categories for detailed browsing
export const categories: Category[] = [
  {
    id: 'helmets',
    name: 'Helmets',
    icon: CATEGORY_ICONS.helmets,
    products: helmetProducts,
  },
  {
    id: 'jackets',
    name: 'Riding Jackets',
    icon: CATEGORY_ICONS.jackets,
    products: jacketProducts,
  },
  {
    id: 'gloves',
    name: 'Riding Gloves',
    icon: CATEGORY_ICONS.gloves,
    products: glovesProducts,
  },
  {
    id: 'boots',
    name: 'Riding Boots',
    icon: CATEGORY_ICONS.boots,
    products: bootsProducts,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: CATEGORY_ICONS.accessories,
    products: accessoryProducts,
  },
];

// Helper functions for filtering
export const getBrandsByCategory = (categoryId: string): string[] => {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return [];
  
  const brands = [...new Set(category.products.map(product => product.brand))];
  return brands.sort();
};

export const getProductsByBrand = (brand: string): Product[] => {
  return allProducts.filter(product => product.brand === brand);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return allProducts.filter(product => 
    product.category.toLowerCase().replace(/\s+/g, '') === categoryId.toLowerCase()
  );
};

export const getFeaturedProducts = (): Product[] => {
  return allProducts.filter(product => 
    product.badge === 'Best Seller' || product.badge === 'Track Rated'
  ).slice(0, 8);
};

export const getNewProducts = (): Product[] => {
  return allProducts.filter(product => product.badge === 'New').slice(0, 6);
};