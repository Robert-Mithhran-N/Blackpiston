// ============================================================
// BlackPiston Garage - MongoDB Initialization Script
// ============================================================
// Database: blackpiston
// Run this script: mongosh < init-database.js
// Or in MongoDB Compass: Copy sections and execute
// ============================================================

// Switch to database (creates if not exists)
use("blackpiston");

print("🏍️ Initializing BlackPiston Garage Database...");
print("================================================");

// ============================================================
// DROP EXISTING COLLECTIONS (CAUTION: Removes all data!)
// Uncomment below lines only if you want to reset the database
// ============================================================
// db.users.drop();
// db.products.drop();
// db.product_categories.drop();
// db.orders.drop();
// db.payments.drop();
// db.top_offers.drop();
// db.inventory.drop();
// db.suppliers.drop();
// db.purchase_orders.drop();
// db.requests.drop();
// db.reviews.drop();
// db.service_bookings.drop();
// db.notifications.drop();
// db.settings.drop();

// ============================================================
// CREATE COLLECTIONS
// ============================================================
print("📁 Creating collections...");

const collections = [
    "users",
    "products",
    "product_categories",
    "orders",
    "payments",
    "top_offers",
    "inventory",
    "suppliers",
    "purchase_orders",
    "requests",
    "reviews",
    "service_bookings",
    "notifications",
    "settings"
];

collections.forEach(collName => {
    if (!db.getCollectionNames().includes(collName)) {
        db.createCollection(collName);
        print(`  ✓ Created: ${collName}`);
    } else {
        print(`  ○ Exists: ${collName}`);
    }
});

// ============================================================
// CREATE INDEXES
// ============================================================
print("\n📊 Creating indexes...");

// Users Indexes
db.users.createIndex({ "email": 1 }, { unique: true, name: "idx_users_email" });
db.users.createIndex({ "phone": 1 }, { name: "idx_users_phone" });
db.users.createIndex({ "role": 1 }, { name: "idx_users_role" });
print("  ✓ Users indexes created");

// Products Indexes
db.products.createIndex({ "slug": 1 }, { unique: true, name: "idx_products_slug" });
db.products.createIndex({ "sku": 1 }, { unique: true, sparse: true, name: "idx_products_sku" });
db.products.createIndex({ "category": 1 }, { name: "idx_products_category" });
db.products.createIndex({ "categoryId": 1 }, { name: "idx_products_categoryId" });
db.products.createIndex({ "brand": 1 }, { name: "idx_products_brand" });
db.products.createIndex({ "price": 1 }, { name: "idx_products_price" });
db.products.createIndex({ "isActive": 1, "isFeatured": 1 }, { name: "idx_products_active_featured" });
db.products.createIndex({ "name": "text", "description": "text", "tags": "text" }, { name: "idx_products_text_search" });
print("  ✓ Products indexes created");

// Product Categories Indexes
db.product_categories.createIndex({ "slug": 1 }, { unique: true, name: "idx_categories_slug" });
db.product_categories.createIndex({ "parentId": 1 }, { name: "idx_categories_parent" });
db.product_categories.createIndex({ "sortOrder": 1 }, { name: "idx_categories_sort" });
print("  ✓ Product Categories indexes created");

// Orders Indexes
db.orders.createIndex({ "orderNumber": 1 }, { unique: true, name: "idx_orders_number" });
db.orders.createIndex({ "userId": 1 }, { name: "idx_orders_user" });
db.orders.createIndex({ "orderStatus": 1 }, { name: "idx_orders_status" });
db.orders.createIndex({ "paymentStatus": 1 }, { name: "idx_orders_payment_status" });
db.orders.createIndex({ "orderedAt": -1 }, { name: "idx_orders_date" });
db.orders.createIndex({ "products.productId": 1 }, { name: "idx_orders_products" });
print("  ✓ Orders indexes created");

// Payments Indexes
db.payments.createIndex({ "paymentId": 1 }, { unique: true, name: "idx_payments_id" });
db.payments.createIndex({ "orderId": 1 }, { name: "idx_payments_order" });
db.payments.createIndex({ "userId": 1 }, { name: "idx_payments_user" });
db.payments.createIndex({ "transactionId": 1 }, { sparse: true, name: "idx_payments_transaction" });
db.payments.createIndex({ "paymentStatus": 1 }, { name: "idx_payments_status" });
db.payments.createIndex({ "receivedDate": -1 }, { name: "idx_payments_date" });
print("  ✓ Payments indexes created");

// Top Offers Indexes
db.top_offers.createIndex({ "productId": 1 }, { name: "idx_offers_product" });
db.top_offers.createIndex({ "isActive": 1, "priority": 1 }, { name: "idx_offers_active_priority" });
db.top_offers.createIndex({ "validFrom": 1, "validUntil": 1 }, { name: "idx_offers_validity" });
print("  ✓ Top Offers indexes created");

// Inventory Indexes
db.inventory.createIndex({ "productId": 1 }, { unique: true, name: "idx_inventory_product" });
db.inventory.createIndex({ "sku": 1 }, { name: "idx_inventory_sku" });
db.inventory.createIndex({ "supplierId": 1 }, { name: "idx_inventory_supplier" });
db.inventory.createIndex({ "isLowStock": 1 }, { name: "idx_inventory_low_stock" });
db.inventory.createIndex({ "availableStock": 1 }, { name: "idx_inventory_stock" });
print("  ✓ Inventory indexes created");

// Suppliers Indexes
db.suppliers.createIndex({ "supplierCode": 1 }, { unique: true, name: "idx_suppliers_code" });
db.suppliers.createIndex({ "email": 1 }, { name: "idx_suppliers_email" });
db.suppliers.createIndex({ "brandsSupplied": 1 }, { name: "idx_suppliers_brands" });
db.suppliers.createIndex({ "isActive": 1 }, { name: "idx_suppliers_active" });
print("  ✓ Suppliers indexes created");

// Purchase Orders Indexes
db.purchase_orders.createIndex({ "poNumber": 1 }, { unique: true, name: "idx_po_number" });
db.purchase_orders.createIndex({ "supplierId": 1 }, { name: "idx_po_supplier" });
db.purchase_orders.createIndex({ "status": 1 }, { name: "idx_po_status" });
db.purchase_orders.createIndex({ "orderDate": -1 }, { name: "idx_po_date" });
print("  ✓ Purchase Orders indexes created");

// Requests Indexes
db.requests.createIndex({ "requestNumber": 1 }, { unique: true, name: "idx_requests_number" });
db.requests.createIndex({ "userId": 1 }, { name: "idx_requests_user" });
db.requests.createIndex({ "requestStatus": 1 }, { name: "idx_requests_status" });
db.requests.createIndex({ "requestType": 1 }, { name: "idx_requests_type" });
db.requests.createIndex({ "createdAt": -1 }, { name: "idx_requests_date" });
print("  ✓ Requests indexes created");

// Reviews Indexes
db.reviews.createIndex({ "productId": 1 }, { name: "idx_reviews_product" });
db.reviews.createIndex({ "userId": 1 }, { name: "idx_reviews_user" });
db.reviews.createIndex({ "productId": 1, "userId": 1 }, { unique: true, name: "idx_reviews_product_user" });
db.reviews.createIndex({ "rating": 1 }, { name: "idx_reviews_rating" });
db.reviews.createIndex({ "isApproved": 1, "createdAt": -1 }, { name: "idx_reviews_approved_date" });
print("  ✓ Reviews indexes created");

// Service Bookings Indexes
db.service_bookings.createIndex({ "bookingNumber": 1 }, { unique: true, name: "idx_bookings_number" });
db.service_bookings.createIndex({ "userId": 1 }, { name: "idx_bookings_user" });
db.service_bookings.createIndex({ "status": 1 }, { name: "idx_bookings_status" });
db.service_bookings.createIndex({ "appointmentDate": 1 }, { name: "idx_bookings_date" });
db.service_bookings.createIndex({ "serviceType": 1 }, { name: "idx_bookings_type" });
print("  ✓ Service Bookings indexes created");

// Notifications Indexes
db.notifications.createIndex({ "recipientType": 1, "recipientId": 1 }, { name: "idx_notifications_recipient" });
db.notifications.createIndex({ "type": 1 }, { name: "idx_notifications_type" });
db.notifications.createIndex({ "isRead": 1 }, { name: "idx_notifications_read" });
db.notifications.createIndex({ "createdAt": -1 }, { name: "idx_notifications_date" });
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0, name: "idx_notifications_ttl" });
print("  ✓ Notifications indexes created");

// Settings Indexes
db.settings.createIndex({ "key": 1 }, { unique: true, name: "idx_settings_key" });
print("  ✓ Settings indexes created");

// ============================================================
// INSERT DEFAULT DATA
// ============================================================
print("\n📦 Inserting default data...");

// Default Categories
const defaultCategories = [
    {
        name: "Helmets",
        slug: "helmets",
        description: "Premium motorcycle helmets for safety and style",
        image: "/images/categories/helmets.jpg",
        icon: "HardHat",
        parentId: null,
        level: 0,
        totalProducts: 0,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Jackets",
        slug: "jackets",
        description: "Riding jackets with protection and comfort",
        image: "/images/categories/jackets.jpg",
        icon: "Shirt",
        parentId: null,
        level: 0,
        totalProducts: 0,
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Boots",
        slug: "boots",
        description: "Motorcycle boots for protection and grip",
        image: "/images/categories/boots.jpg",
        icon: "Footprints",
        parentId: null,
        level: 0,
        totalProducts: 0,
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Accessories",
        slug: "accessories",
        description: "Riding accessories and gear",
        image: "/images/categories/accessories.jpg",
        icon: "Sparkles",
        parentId: null,
        level: 0,
        totalProducts: 0,
        sortOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Check if categories exist
if (db.product_categories.countDocuments() === 0) {
    db.product_categories.insertMany(defaultCategories);
    print("  ✓ Default categories inserted");
} else {
    print("  ○ Categories already exist, skipping...");
}

// Default Admin User (password: Admin@123)
// Note: Replace passwordHash with actual bcrypt hash in production
const defaultAdmin = {
    name: "Admin",
    email: "admin@blackpiston.com",
    phone: "9876543210",
    passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDu2K5qD4kBhHYV2eCq6b6ZD8TjJYe", // Admin@123
    role: "ADMIN",
    avatar: null,
    address: {
        street: "BlackPiston Garage HQ",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India"
    },
    savedAddresses: [],
    isActive: true,
    isEmailVerified: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date()
};

// Check if admin exists
if (db.users.countDocuments({ role: "ADMIN" }) === 0) {
    db.users.insertOne(defaultAdmin);
    print("  ✓ Default admin user created (admin@blackpiston.com)");
} else {
    print("  ○ Admin user already exists, skipping...");
}

// Default Settings
const defaultSettings = [
    {
        key: "GENERAL",
        siteName: "BlackPiston Garage",
        siteTagline: "Premium Motorcycle Gear & Accessories",
        siteLogo: "/images/logo.png",
        favicon: "/favicon.ico",
        contactEmail: "contact@blackpiston.com",
        supportEmail: "support@blackpiston.com",
        contactPhone: "+91 98765 43210",
        alternatePhone: "+91 98765 43211",
        whatsappNumber: "+919876543210",
        address: {
            street: "123 Biker Street, Andheri West",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400058",
            country: "India",
            googleMapsUrl: "https://maps.google.com/?q=BlackPiston+Garage"
        },
        socialLinks: {
            facebook: "https://facebook.com/blackpistongarage",
            instagram: "https://instagram.com/blackpistongarage",
            twitter: "https://twitter.com/blackpiston",
            youtube: "https://youtube.com/blackpistongarage",
            linkedin: null
        },
        businessHours: {
            monday: { open: "09:00", close: "20:00" },
            tuesday: { open: "09:00", close: "20:00" },
            wednesday: { open: "09:00", close: "20:00" },
            thursday: { open: "09:00", close: "20:00" },
            friday: { open: "09:00", close: "20:00" },
            saturday: { open: "10:00", close: "18:00" },
            sunday: { open: "10:00", close: "16:00" }
        },
        maintenanceMode: false,
        allowRegistration: true,
        updatedAt: new Date()
    },
    {
        key: "SHIPPING",
        shipping: {
            freeShippingMinimum: NumberDecimal("5000"),
            defaultShippingCost: NumberDecimal("99"),
            expressShippingCost: NumberDecimal("199"),
            deliveryTimeStandard: "5-7 business days",
            deliveryTimeExpress: "2-3 business days"
        },
        updatedAt: new Date()
    },
    {
        key: "SEO",
        seo: {
            metaTitle: "BlackPiston Garage - Premium Motorcycle Gear & Accessories",
            metaDescription: "Shop premium motorcycle helmets, jackets, boots and accessories at BlackPiston Garage. Quality riding gear for passionate bikers.",
            metaKeywords: ["motorcycle gear", "riding gear", "helmets", "jackets", "boots", "biker accessories"],
            ogImage: "/images/og-image.jpg",
            googleAnalyticsId: null
        },
        updatedAt: new Date()
    }
];

// Check if settings exist
if (db.settings.countDocuments() === 0) {
    db.settings.insertMany(defaultSettings);
    print("  ✓ Default settings inserted");
} else {
    print("  ○ Settings already exist, skipping...");
}

// ============================================================
// INSERT SAMPLE PRODUCTS
// ============================================================
print("\n🏍️ Inserting sample products...");

// Get category IDs
const helmetsCategory = db.product_categories.findOne({ slug: "helmets" });
const jacketsCategory = db.product_categories.findOne({ slug: "jackets" });
const bootsCategory = db.product_categories.findOne({ slug: "boots" });
const accessoriesCategory = db.product_categories.findOne({ slug: "accessories" });

const sampleProducts = [
    // Helmets
    {
        name: "AGV Pista GP RR - Rossi Misano",
        slug: "agv-pista-gp-rr-rossi-misano",
        description: "The AGV Pista GP RR is the result of extensive MotoGP™ development, offering premium carbon fiber construction with uncompromising safety.",
        shortDescription: "Premium MotoGP-grade carbon fiber helmet",
        categoryId: helmetsCategory?._id,
        category: "helmets",
        brand: "AGV",
        price: NumberDecimal("125000"),
        offerPrice: NumberDecimal("99999"),
        images: [
            { url: "/images/products/agv-pista-gp-rr-1.jpg", alt: "AGV Pista GP RR Front View", isPrimary: true },
            { url: "/images/products/agv-pista-gp-rr-2.jpg", alt: "AGV Pista GP RR Side View", isPrimary: false }
        ],
        specifications: [
            { label: "Shell Material", value: "Carbon Fiber" },
            { label: "Weight", value: "1,450g ± 50g" },
            { label: "Certification", value: "ECE 22.06" },
            { label: "Visor", value: "ProVision 190° field of view" }
        ],
        variants: [
            { size: "S", color: "Rossi Misano", sku: "AGV-PRR-RM-S", stockQuantity: 5, priceModifier: NumberDecimal("0") },
            { size: "M", color: "Rossi Misano", sku: "AGV-PRR-RM-M", stockQuantity: 8, priceModifier: NumberDecimal("0") },
            { size: "L", color: "Rossi Misano", sku: "AGV-PRR-RM-L", stockQuantity: 6, priceModifier: NumberDecimal("0") }
        ],
        stockQuantity: 19,
        sku: "AGV-PRR-RM",
        rating: 4.9,
        totalReviews: 24,
        tags: ["agv", "carbon fiber", "motogp", "rossi", "premium helmet"],
        isFeatured: true,
        isActive: true,
        inStock: true,
        weight: 1450,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Arai RX-7V Evo",
        slug: "arai-rx-7v-evo",
        description: "The flagship racing helmet from Arai, featuring the Peripheral Belt Construction for superior protection.",
        shortDescription: "Handcrafted Japanese helmet with superior protection",
        categoryId: helmetsCategory?._id,
        category: "helmets",
        brand: "Arai",
        price: NumberDecimal("95000"),
        offerPrice: null,
        images: [
            { url: "/images/products/arai-rx7v-1.jpg", alt: "Arai RX-7V Evo", isPrimary: true }
        ],
        specifications: [
            { label: "Shell Material", value: "Super Fiber Laminate" },
            { label: "Weight", value: "1,530g ± 50g" },
            { label: "Certification", value: "SNELL, ECE 22.06" }
        ],
        variants: [],
        stockQuantity: 12,
        sku: "ARAI-RX7V",
        rating: 4.7,
        totalReviews: 18,
        tags: ["arai", "racing", "japanese", "premium"],
        isFeatured: true,
        isActive: true,
        inStock: true,
        weight: 1530,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Jackets
    {
        name: "Alpinestars GP Tech V4 Leather Suit",
        slug: "alpinestars-gp-tech-v4-leather-suit",
        description: "MotoGP-level protection with Tech-Air® compatibility. Premium bovine leather with aramidic stretch panels.",
        shortDescription: "MotoGP-grade leather suit with airbag compatibility",
        categoryId: jacketsCategory?._id,
        category: "jackets",
        brand: "Alpinestars",
        price: NumberDecimal("185000"),
        offerPrice: NumberDecimal("159000"),
        images: [
            { url: "/images/products/alpinestars-gp-tech-1.jpg", alt: "Alpinestars GP Tech V4", isPrimary: true }
        ],
        specifications: [
            { label: "Material", value: "Premium Bovine Leather" },
            { label: "Protection", value: "CE Level 2 (Shoulders, Elbows, Knees)" },
            { label: "Airbag", value: "Tech-Air® Ready" }
        ],
        variants: [],
        stockQuantity: 5,
        sku: "ALP-GPTV4",
        rating: 4.8,
        totalReviews: 12,
        tags: ["alpinestars", "race suit", "leather", "airbag", "motogp"],
        isFeatured: true,
        isActive: true,
        inStock: true,
        weight: 4200,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Boots
    {
        name: "TCX RT-Race Pro Air",
        slug: "tcx-rt-race-pro-air",
        description: "Premium racing boots with full leather construction, D3O® protection, and excellent ventilation.",
        shortDescription: "Racing boots with superior ventilation",
        categoryId: bootsCategory?._id,
        category: "boots",
        brand: "TCX",
        price: NumberDecimal("28000"),
        offerPrice: NumberDecimal("24500"),
        images: [
            { url: "/images/products/tcx-rt-race-1.jpg", alt: "TCX RT-Race Pro Air", isPrimary: true }
        ],
        specifications: [
            { label: "Upper Material", value: "Full-grain Leather" },
            { label: "Protection", value: "D3O® ankle protection" },
            { label: "Sole", value: "Racing compound with steel shank" }
        ],
        variants: [],
        stockQuantity: 20,
        sku: "TCX-RTRP",
        rating: 4.6,
        totalReviews: 32,
        tags: ["tcx", "racing boots", "ventilated", "d3o"],
        isFeatured: true,
        isActive: true,
        inStock: true,
        weight: 1100,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Accessories
    {
        name: "Cardo Packtalk Bold",
        slug: "cardo-packtalk-bold",
        description: "Premium Bluetooth communication system with DMC technology for group rides of up to 15 riders.",
        shortDescription: "Premium Bluetooth intercom for group rides",
        categoryId: accessoriesCategory?._id,
        category: "accessories",
        brand: "Cardo",
        price: NumberDecimal("32000"),
        offerPrice: null,
        images: [
            { url: "/images/products/cardo-packtalk-1.jpg", alt: "Cardo Packtalk Bold", isPrimary: true }
        ],
        specifications: [
            { label: "Range", value: "Up to 1.6 km" },
            { label: "Riders", value: "Up to 15 in DMC mode" },
            { label: "Battery", value: "13 hours talk time" }
        ],
        variants: [],
        stockQuantity: 35,
        sku: "CARDO-PTB",
        rating: 4.5,
        totalReviews: 56,
        tags: ["cardo", "bluetooth", "intercom", "communication"],
        isFeatured: true,
        isActive: true,
        inStock: true,
        weight: 85,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Check if products exist
if (db.products.countDocuments() === 0) {
    db.products.insertMany(sampleProducts);
    print(`  ✓ ${sampleProducts.length} sample products inserted`);

    // Update category product counts
    db.product_categories.updateOne({ slug: "helmets" }, { $set: { totalProducts: 2 } });
    db.product_categories.updateOne({ slug: "jackets" }, { $set: { totalProducts: 1 } });
    db.product_categories.updateOne({ slug: "boots" }, { $set: { totalProducts: 1 } });
    db.product_categories.updateOne({ slug: "accessories" }, { $set: { totalProducts: 1 } });
    print("  ✓ Category product counts updated");
} else {
    print("  ○ Products already exist, skipping...");
}

// ============================================================
// SUMMARY
// ============================================================
print("\n================================================");
print("✅ BlackPiston Database Initialization Complete!");
print("================================================");
print("\n📊 Collection Summary:");
collections.forEach(collName => {
    const count = db[collName].countDocuments();
    print(`  • ${collName}: ${count} documents`);
});

print("\n🔑 Default Admin Credentials:");
print("  Email: admin@blackpiston.com");
print("  Password: Admin@123 (change in production!)");

print("\n🌐 Connection URI: mongodb://localhost:27017/blackpiston");
print("================================================\n");
