# BlackPiston Garage — MongoDB Database Design

## Database Configuration

```
Database Name: blackpiston
Connection URI: mongodb://localhost:27017
```

---

## 📊 Collection Overview

| # | Collection Name | Purpose | Access Level |
|---|-----------------|---------|--------------|
| 1 | `users` | Customer & admin accounts | User + Admin |
| 2 | `products` | All products (gear, parts, accessories) | User + Admin |
| 3 | `product_categories` | Category navigation | User + Admin |
| 4 | `orders` | Customer orders | User + Admin |
| 5 | `payments` | Transaction records | Admin |
| 6 | `top_offers` | Featured discount products | User + Admin |
| 7 | `inventory` | Stock & warehouse tracking | Admin |
| 8 | `suppliers` | Product suppliers/dealers | Admin |
| 9 | `purchase_orders` | Supplier orders | Admin |
| 10 | `requests` | User product/service requests | User + Admin |
| 11 | `reviews` | Product reviews & ratings | User + Admin |
| 12 | `service_bookings` | Garage appointments | User + Admin |
| 13 | `notifications` | System notifications | Admin |
| 14 | `settings` | Global site configuration | Admin |

---

## 📁 Collection Schemas

---

### 1️⃣ USERS Collection

Stores all customer and admin accounts.

```javascript
{
  _id: ObjectId,                    // Auto-generated unique ID
  name: String,                     // Full name (required)
  email: String,                    // Unique email (required, indexed)
  phone: String,                    // Phone number (optional)
  passwordHash: String,             // Bcrypt hashed password (required)
  role: String,                     // Enum: "USER" | "ADMIN" | "STAFF"
  avatar: String,                   // Profile image URL (optional)
  address: {                        // Embedded address object
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  savedAddresses: [                 // Multiple saved addresses for checkout
    {
      _id: ObjectId,
      label: String,                // "Home", "Office", etc.
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      isDefault: Boolean
    }
  ],
  isActive: Boolean,                // Account status (default: true)
  isEmailVerified: Boolean,         // Email verification status
  lastLogin: Date,                  // Last login timestamp
  createdAt: Date,                  // Account creation date
  updatedAt: Date                   // Last update timestamp
}
```

**Indexes:**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "phone": 1 })
db.users.createIndex({ "role": 1 })
```

---

### 2️⃣ PRODUCTS Collection

All bike parts, riding gear, and accessories.

```javascript
{
  _id: ObjectId,                    // Auto-generated unique ID
  name: String,                     // Product name (required)
  slug: String,                     // URL-friendly name (unique, indexed)
  description: String,              // Detailed description
  shortDescription: String,         // Brief description for cards
  categoryId: ObjectId,             // Reference to product_categories
  category: String,                 // Category slug: "helmets" | "jackets" | "boots" | "accessories"
  brand: String,                    // Brand name
  price: Decimal128,                // Original price (required)
  offerPrice: Decimal128,           // Discounted price (optional)
  images: [                         // Array of product images
    {
      url: String,
      alt: String,
      isPrimary: Boolean
    }
  ],
  specifications: [                 // Product specifications
    {
      label: String,                // e.g., "Material"
      value: String                 // e.g., "Carbon Fiber"
    }
  ],
  variants: [                       // Size/color variants
    {
      size: String,
      color: String,
      sku: String,
      stockQuantity: Number,
      priceModifier: Decimal128
    }
  ],
  stockQuantity: Number,            // Available stock (required)
  sku: String,                      // Stock Keeping Unit (unique)
  rating: Number,                   // Average rating (0-5)
  totalReviews: Number,             // Total review count
  tags: [String],                   // Search tags
  isFeatured: Boolean,              // Show in featured section
  isActive: Boolean,                // Product visibility
  inStock: Boolean,                 // Computed from stockQuantity
  weight: Number,                   // Weight in grams (for shipping)
  dimensions: {                     // Product dimensions
    length: Number,
    width: Number,
    height: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.products.createIndex({ "slug": 1 }, { unique: true })
db.products.createIndex({ "sku": 1 }, { unique: true })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "categoryId": 1 })
db.products.createIndex({ "brand": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "isActive": 1, "isFeatured": 1 })
db.products.createIndex({ "name": "text", "description": "text", "tags": "text" })
```

---

### 3️⃣ PRODUCT_CATEGORIES Collection

Shop categories for navigation.

```javascript
{
  _id: ObjectId,
  name: String,                     // Display name (required)
  slug: String,                     // URL-friendly name (unique)
  description: String,              // Category description
  image: String,                    // Category image URL
  icon: String,                     // Icon class or SVG
  parentId: ObjectId,               // Parent category (for subcategories)
  level: Number,                    // Hierarchy level (0 = root)
  totalProducts: Number,            // Product count in category
  sortOrder: Number,                // Display order
  isActive: Boolean,                // Category visibility
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.product_categories.createIndex({ "slug": 1 }, { unique: true })
db.product_categories.createIndex({ "parentId": 1 })
db.product_categories.createIndex({ "sortOrder": 1 })
```

---

### 4️⃣ ORDERS Collection

Customer orders.

```javascript
{
  _id: ObjectId,
  orderNumber: String,              // Human-readable order ID (e.g., "BP-2026-001234")
  userId: ObjectId,                 // Reference to users collection (required)
  products: [                       // Ordered products (embedded)
    {
      productId: ObjectId,          // Reference to products
      name: String,                 // Product name at time of order
      sku: String,
      image: String,                // Product image URL
      quantity: Number,             // Ordered quantity
      unitPrice: Decimal128,        // Price per unit at order time
      totalPrice: Decimal128,       // quantity × unitPrice
      variant: {                    // Selected variant (optional)
        size: String,
        color: String
      }
    }
  ],
  subtotal: Decimal128,             // Sum of product prices
  shippingCost: Decimal128,         // Shipping charges
  taxAmount: Decimal128,            // Tax amount
  discountAmount: Decimal128,       // Applied discounts
  totalAmount: Decimal128,          // Final payable amount
  couponCode: String,               // Applied coupon (optional)
  paymentMethod: String,            // "ONLINE" | "COD" | "UPI" | "CARD"
  paymentStatus: String,            // "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  orderStatus: String,              // Order lifecycle status
  // Possible values: "NEW" | "CONFIRMED" | "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "RETURNED"
  shippingAddress: {                // Delivery address (embedded)
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  billingAddress: {                 // Billing address (embedded)
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  tracking: {                       // Shipment tracking
    carrier: String,
    trackingNumber: String,
    trackingUrl: String
  },
  statusHistory: [                  // Order status timeline
    {
      status: String,
      timestamp: Date,
      note: String,
      updatedBy: ObjectId           // Staff/Admin who updated
    }
  ],
  notes: String,                    // Internal notes
  orderedAt: Date,                  // Order placement date
  confirmedAt: Date,                // Order confirmation date
  shippedAt: Date,                  // Shipping date
  deliveredAt: Date,                // Delivery date
  completedAt: Date,                // Order completion date
  cancelledAt: Date,                // Cancellation date (if cancelled)
  cancellationReason: String,       // Reason for cancellation
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.orders.createIndex({ "orderNumber": 1 }, { unique: true })
db.orders.createIndex({ "userId": 1 })
db.orders.createIndex({ "orderStatus": 1 })
db.orders.createIndex({ "paymentStatus": 1 })
db.orders.createIndex({ "orderedAt": -1 })
db.orders.createIndex({ "products.productId": 1 })
```

---

### 5️⃣ PAYMENTS Collection

All transaction records.

```javascript
{
  _id: ObjectId,
  paymentId: String,                // Unique payment reference (e.g., "PAY-2026-001234")
  orderId: ObjectId,                // Reference to orders collection (required)
  userId: ObjectId,                 // Reference to users collection (required)
  paymentMethod: String,            // "ONLINE" | "COD" | "UPI" | "CARD" | "NETBANKING" | "WALLET"
  paymentGateway: String,           // "RAZORPAY" | "PAYTM" | "STRIPE" | "MANUAL"
  amountDue: Decimal128,            // Total amount to be paid
  amountReceived: Decimal128,       // Amount actually received
  currency: String,                 // Currency code (default: "INR")
  paymentStatus: String,            // "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED"
  transactionId: String,            // Gateway transaction ID
  gatewayResponse: {                // Raw gateway response (for debugging)
    responseCode: String,
    responseMessage: String,
    rawData: Object
  },
  refundDetails: {                  // Refund information (if applicable)
    refundId: String,
    refundAmount: Decimal128,
    refundReason: String,
    refundedAt: Date
  },
  failureReason: String,            // Reason for payment failure
  receivedDate: Date,               // Payment received date
  receivedTime: String,             // Payment received time (HH:mm:ss)
  attempts: Number,                 // Payment attempt count
  metadata: Object,                 // Additional metadata
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.payments.createIndex({ "paymentId": 1 }, { unique: true })
db.payments.createIndex({ "orderId": 1 })
db.payments.createIndex({ "userId": 1 })
db.payments.createIndex({ "transactionId": 1 })
db.payments.createIndex({ "paymentStatus": 1 })
db.payments.createIndex({ "receivedDate": -1 })
```

---

### 6️⃣ TOP_OFFERS Collection

Products highlighted as top offers.

```javascript
{
  _id: ObjectId,
  productId: ObjectId,              // Reference to products collection (required)
  title: String,                    // Offer title (e.g., "Summer Sale!")
  description: String,              // Offer description
  originalPrice: Decimal128,        // Original product price
  offerPrice: Decimal128,           // Discounted price
  discountPercentage: Number,       // Discount % (computed or manual)
  discountType: String,             // "PERCENTAGE" | "FIXED"
  bannerImage: String,              // Promotional banner URL
  badge: String,                    // Badge text (e.g., "HOT", "LIMITED")
  priority: Number,                 // Display priority (lower = higher priority)
  validFrom: Date,                  // Offer start date
  validUntil: Date,                 // Offer end date
  isActive: Boolean,                // Offer visibility
  usageLimit: Number,               // Max times offer can be used
  usedCount: Number,                // Times offer has been used
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.top_offers.createIndex({ "productId": 1 })
db.top_offers.createIndex({ "isActive": 1, "priority": 1 })
db.top_offers.createIndex({ "validFrom": 1, "validUntil": 1 })
```

---

### 7️⃣ INVENTORY Collection

Stock and warehouse tracking.

```javascript
{
  _id: ObjectId,
  productId: ObjectId,              // Reference to products collection (required)
  sku: String,                      // Product SKU
  availableStock: Number,           // Current available quantity
  reservedStock: Number,            // Stock reserved for pending orders
  totalStock: Number,               // Total stock (available + reserved)
  reorderLevel: Number,             // Minimum stock before reorder alert
  reorderQuantity: Number,          // Quantity to order when restocking
  warehouseLocation: String,        // Physical location in warehouse
  supplierId: ObjectId,             // Reference to suppliers collection
  lastRestockDate: Date,            // Last restock date
  lastRestockQuantity: Number,      // Quantity added in last restock
  unitCost: Decimal128,             // Cost per unit from supplier
  stockHistory: [                   // Stock movement history
    {
      type: String,                 // "IN" | "OUT" | "ADJUSTMENT" | "RETURN"
      quantity: Number,
      reason: String,
      referenceId: ObjectId,        // Order ID or PO ID
      timestamp: Date,
      updatedBy: ObjectId
    }
  ],
  isLowStock: Boolean,              // Computed: availableStock <= reorderLevel
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.inventory.createIndex({ "productId": 1 }, { unique: true })
db.inventory.createIndex({ "sku": 1 })
db.inventory.createIndex({ "supplierId": 1 })
db.inventory.createIndex({ "isLowStock": 1 })
db.inventory.createIndex({ "availableStock": 1 })
```

---

### 8️⃣ SUPPLIERS Collection

Product suppliers and dealers.

```javascript
{
  _id: ObjectId,
  supplierCode: String,             // Unique supplier code (e.g., "SUP-001")
  supplierName: String,             // Company name (required)
  contactPerson: String,            // Primary contact name
  phone: String,                    // Primary phone number
  alternatePhone: String,           // Alternate phone
  email: String,                    // Email address
  website: String,                  // Company website
  address: {                        // Supplier address
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  brandsSupplied: [String],         // Brands this supplier provides
  categoriesSupplied: [String],     // Categories supplied
  paymentTerms: String,             // Payment terms (e.g., "Net 30")
  leadTimeDays: Number,             // Average delivery time in days
  rating: Number,                   // Supplier rating (1-5)
  bankDetails: {                    // Payment details
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  gstNumber: String,                // GST registration number
  isActive: Boolean,                // Supplier status
  notes: String,                    // Internal notes
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.suppliers.createIndex({ "supplierCode": 1 }, { unique: true })
db.suppliers.createIndex({ "email": 1 })
db.suppliers.createIndex({ "brandsSupplied": 1 })
db.suppliers.createIndex({ "isActive": 1 })
```

---

### 9️⃣ PURCHASE_ORDERS Collection

Orders placed to suppliers for restocking.

```javascript
{
  _id: ObjectId,
  poNumber: String,                 // Purchase Order Number (e.g., "PO-2026-001")
  supplierId: ObjectId,             // Reference to suppliers collection (required)
  products: [                       // Products ordered
    {
      productId: ObjectId,          // Reference to products
      productName: String,          // Product name
      sku: String,
      quantity: Number,             // Ordered quantity
      unitCost: Decimal128,         // Cost per unit
      totalCost: Decimal128,        // quantity × unitCost
      receivedQuantity: Number,     // Quantity actually received
      damagedQuantity: Number       // Damaged items
    }
  ],
  subtotal: Decimal128,             // Sum of product costs
  shippingCost: Decimal128,         // Shipping charges
  taxAmount: Decimal128,            // Tax amount
  totalCost: Decimal128,            // Total PO amount
  status: String,                   // "DRAFT" | "SENT" | "CONFIRMED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED"
  paymentStatus: String,            // "UNPAID" | "PARTIALLY_PAID" | "PAID"
  expectedDeliveryDate: Date,       // Expected delivery date
  orderDate: Date,                  // PO creation date
  sentDate: Date,                   // Date sent to supplier
  receivedDate: Date,               // Full receipt date
  notes: String,                    // Order notes
  attachments: [String],            // Document URLs (invoices, etc.)
  createdBy: ObjectId,              // Admin who created PO
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.purchase_orders.createIndex({ "poNumber": 1 }, { unique: true })
db.purchase_orders.createIndex({ "supplierId": 1 })
db.purchase_orders.createIndex({ "status": 1 })
db.purchase_orders.createIndex({ "orderDate": -1 })
```

---

### 🔟 REQUESTS Collection

User product/service requests.

```javascript
{
  _id: ObjectId,
  requestNumber: String,            // Request reference (e.g., "REQ-2026-001")
  userId: ObjectId,                 // Reference to users collection (required)
  userName: String,                 // User's name (denormalized)
  userEmail: String,                // User's email (denormalized)
  userPhone: String,                // User's phone
  requestType: String,              // "PRODUCT_INQUIRY" | "CUSTOM_ORDER" | "BULK_ORDER" | "OTHER"
  productName: String,              // Requested product name
  productId: ObjectId,              // Existing product (if applicable)
  quantity: Number,                 // Requested quantity
  message: String,                  // User's message/description
  attachments: [String],            // Uploaded image/document URLs
  priority: String,                 // "LOW" | "MEDIUM" | "HIGH"
  requestStatus: String,            // "PENDING" | "IN_PROGRESS" | "RESPONDED" | "COMPLETED" | "CLOSED"
  assignedTo: ObjectId,             // Staff assigned to handle request
  adminNotes: String,               // Internal admin notes
  responses: [                      // Admin responses
    {
      message: String,
      respondedBy: ObjectId,
      respondedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date
}
```

**Indexes:**
```javascript
db.requests.createIndex({ "requestNumber": 1 }, { unique: true })
db.requests.createIndex({ "userId": 1 })
db.requests.createIndex({ "requestStatus": 1 })
db.requests.createIndex({ "requestType": 1 })
db.requests.createIndex({ "createdAt": -1 })
```

---

### 1️⃣1️⃣ REVIEWS Collection

Product reviews and ratings.

```javascript
{
  _id: ObjectId,
  productId: ObjectId,              // Reference to products collection (required)
  userId: ObjectId,                 // Reference to users collection (required)
  orderId: ObjectId,                // Reference to order (verified purchase)
  userName: String,                 // Reviewer name (denormalized)
  userAvatar: String,               // Reviewer avatar (denormalized)
  rating: Number,                   // Rating 1-5 (required)
  title: String,                    // Review title
  comment: String,                  // Review text
  pros: [String],                   // Positive points
  cons: [String],                   // Negative points
  images: [String],                 // Review image URLs
  isVerifiedPurchase: Boolean,      // User actually purchased product
  helpfulCount: Number,             // "Helpful" votes
  notHelpfulCount: Number,          // "Not helpful" votes
  isApproved: Boolean,              // Admin approval status
  isFeatured: Boolean,              // Featured review
  adminReply: {                     // Admin response
    message: String,
    repliedBy: ObjectId,
    repliedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.reviews.createIndex({ "productId": 1 })
db.reviews.createIndex({ "userId": 1 })
db.reviews.createIndex({ "productId": 1, "userId": 1 }, { unique: true })
db.reviews.createIndex({ "rating": 1 })
db.reviews.createIndex({ "isApproved": 1, "createdAt": -1 })
```

---

### 1️⃣2️⃣ SERVICE_BOOKINGS Collection

Garage and service appointments.

```javascript
{
  _id: ObjectId,
  bookingNumber: String,            // Booking reference (e.g., "SVC-2026-001")
  userId: ObjectId,                 // Reference to users collection (required)
  customerName: String,             // Customer name
  customerPhone: String,            // Contact phone
  customerEmail: String,            // Contact email
  serviceType: String,              // "MAINTENANCE" | "REPAIR" | "CUSTOMIZATION" | "INSPECTION" | "WASH" | "OTHER"
  serviceDescription: String,       // Detailed service description
  bikeDetails: {                    // Vehicle information
    make: String,                   // e.g., "Royal Enfield"
    model: String,                  // e.g., "Classic 350"
    year: Number,                   // Manufacturing year
    registrationNumber: String,     // Vehicle registration
    color: String,
    engineCC: Number
  },
  appointmentDate: Date,            // Scheduled date
  appointmentTime: String,          // Scheduled time slot
  estimatedDuration: Number,        // Duration in hours
  estimatedCost: Decimal128,        // Estimated service cost
  actualCost: Decimal128,           // Final cost after service
  status: String,                   // "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  assignedMechanic: String,         // Assigned technician name
  notes: String,                    // Additional notes
  statusHistory: [                  // Status timeline
    {
      status: String,
      timestamp: Date,
      note: String,
      updatedBy: ObjectId
    }
  ],
  feedback: {                       // Post-service feedback
    rating: Number,
    comment: String,
    submittedAt: Date
  },
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

**Indexes:**
```javascript
db.service_bookings.createIndex({ "bookingNumber": 1 }, { unique: true })
db.service_bookings.createIndex({ "userId": 1 })
db.service_bookings.createIndex({ "status": 1 })
db.service_bookings.createIndex({ "appointmentDate": 1 })
db.service_bookings.createIndex({ "serviceType": 1 })
```

---

### 1️⃣3️⃣ NOTIFICATIONS Collection

Admin and system notifications.

```javascript
{
  _id: ObjectId,
  type: String,                     // "ORDER" | "PAYMENT" | "LOW_STOCK" | "REQUEST" | "REVIEW" | "SYSTEM" | "BOOKING"
  title: String,                    // Notification title
  message: String,                  // Notification message
  priority: String,                 // "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  referenceType: String,            // "ORDER" | "PRODUCT" | "USER" | "PAYMENT" | etc.
  referenceId: ObjectId,            // ID of related document
  link: String,                     // Link to related page in admin dashboard
  recipientType: String,            // "ADMIN" | "STAFF" | "USER" | "ALL"
  recipientId: ObjectId,            // Specific recipient (optional)
  isRead: Boolean,                  // Read status
  readAt: Date,                     // When notification was read
  isArchived: Boolean,              // Archived status
  expiresAt: Date,                  // Auto-delete after this date
  metadata: Object,                 // Additional data
  createdAt: Date
}
```

**Indexes:**
```javascript
db.notifications.createIndex({ "recipientType": 1, "recipientId": 1 })
db.notifications.createIndex({ "type": 1 })
db.notifications.createIndex({ "isRead": 1 })
db.notifications.createIndex({ "createdAt": -1 })
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

---

### 1️⃣4️⃣ SETTINGS Collection

Global site settings (singleton document pattern).

```javascript
{
  _id: ObjectId,
  key: String,                      // "GENERAL" | "PAYMENT" | "SHIPPING" | "EMAIL" | "SEO"
  
  // General Settings (key: "GENERAL")
  siteName: String,                 // "BlackPiston Garage"
  siteTagline: String,              // "Premium Motorcycle Gear"
  siteLogo: String,                 // Logo URL
  favicon: String,                  // Favicon URL
  contactEmail: String,             // Primary contact email
  supportEmail: String,             // Support email
  contactPhone: String,             // Primary phone
  alternatePhone: String,           // Alternate phone
  whatsappNumber: String,           // WhatsApp for support
  address: {                        // Physical store address
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    googleMapsUrl: String
  },
  socialLinks: {                    // Social media links
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    linkedin: String
  },
  businessHours: {                  // Operating hours
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  // Payment Settings (key: "PAYMENT")
  paymentGateways: {
    razorpay: {
      enabled: Boolean,
      keyId: String,
      keySecret: String,            // Encrypted
      webhookSecret: String
    },
    cod: {
      enabled: Boolean,
      minOrderAmount: Decimal128,
      maxOrderAmount: Decimal128
    }
  },
  
  // Shipping Settings (key: "SHIPPING")
  shipping: {
    freeShippingMinimum: Decimal128,  // Free shipping threshold
    defaultShippingCost: Decimal128,
    expressShippingCost: Decimal128,
    deliveryTimeStandard: String,     // "5-7 business days"
    deliveryTimeExpress: String       // "2-3 business days"
  },
  
  // SEO Settings (key: "SEO")
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogImage: String,
    googleAnalyticsId: String
  },
  
  maintenanceMode: Boolean,         // Enable maintenance mode
  allowRegistration: Boolean,       // Allow new user registration
  updatedAt: Date,
  updatedBy: ObjectId
}
```

**Indexes:**
```javascript
db.settings.createIndex({ "key": 1 }, { unique: true })
```

---

## 🔗 Collection Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RELATIONSHIP DIAGRAM                                │
└─────────────────────────────────────────────────────────────────────────────┘

USERS ─────────────┬──────────────────> ORDERS ─────────────> PAYMENTS
  │                │                       │
  │                │                       └──────> products (embedded)
  │                │
  │                ├──────────────────> REQUESTS
  │                │
  │                ├──────────────────> REVIEWS ──────────> PRODUCTS
  │                │
  │                └──────────────────> SERVICE_BOOKINGS
  │
  │
PRODUCTS ──────────┬──────────────────> PRODUCT_CATEGORIES
  │                │
  │                ├──────────────────> TOP_OFFERS
  │                │
  │                ├──────────────────> INVENTORY ─────────> SUPPLIERS
  │                │
  │                └──────────────────> REVIEWS


SUPPLIERS ─────────────────────────────> PURCHASE_ORDERS
                                            │
                                            └──────> products (embedded)


NOTIFICATIONS ─────────────────────────> (References multiple collections)

SETTINGS ──────────────────────────────> (Standalone singleton)
```

### Reference Types:

| From Collection | To Collection | Relationship | Type |
|-----------------|---------------|--------------|------|
| orders | users | Many-to-One | ObjectId Reference |
| orders | products | Many-to-Many | Embedded Array |
| payments | orders | One-to-One | ObjectId Reference |
| payments | users | Many-to-One | ObjectId Reference |
| inventory | products | One-to-One | ObjectId Reference |
| inventory | suppliers | Many-to-One | ObjectId Reference |
| top_offers | products | Many-to-One | ObjectId Reference |
| reviews | products | Many-to-One | ObjectId Reference |
| reviews | users | Many-to-One | ObjectId Reference |
| requests | users | Many-to-One | ObjectId Reference |
| service_bookings | users | Many-to-One | ObjectId Reference |
| purchase_orders | suppliers | Many-to-One | ObjectId Reference |
| products | product_categories | Many-to-One | ObjectId Reference |

---

## 📊 Access Level Matrix

| Collection | User (Frontend) | Admin Dashboard |
|------------|-----------------|-----------------|
| users | Read Own, Update Own | Full CRUD |
| products | Read Only | Full CRUD |
| product_categories | Read Only | Full CRUD |
| orders | Read Own, Create | Full CRUD |
| payments | Read Own | Full CRUD |
| top_offers | Read Active | Full CRUD |
| inventory | ❌ | Full CRUD |
| suppliers | ❌ | Full CRUD |
| purchase_orders | ❌ | Full CRUD |
| requests | Create, Read Own | Full CRUD |
| reviews | Create, Read, Update Own | Full CRUD |
| service_bookings | Create, Read Own | Full CRUD |
| notifications | ❌ | Full CRUD |
| settings | ❌ | Full CRUD |

---

## 🚀 Initial Data Setup Script

```javascript
// Create Database
use blackpiston

// Create Collections with Validation
db.createCollection("users")
db.createCollection("products")
db.createCollection("product_categories")
db.createCollection("orders")
db.createCollection("payments")
db.createCollection("top_offers")
db.createCollection("inventory")
db.createCollection("suppliers")
db.createCollection("purchase_orders")
db.createCollection("requests")
db.createCollection("reviews")
db.createCollection("service_bookings")
db.createCollection("notifications")
db.createCollection("settings")

// Insert Default Categories
db.product_categories.insertMany([
  {
    name: "Helmets",
    slug: "helmets",
    description: "Premium motorcycle helmets for safety and style",
    image: "/images/categories/helmets.jpg",
    icon: "helmet",
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
    icon: "jacket",
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
    icon: "boot",
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
    icon: "accessories",
    parentId: null,
    level: 0,
    totalProducts: 0,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Insert Default Admin User
db.users.insertOne({
  name: "Admin",
  email: "admin@blackpiston.com",
  phone: "9876543210",
  passwordHash: "$2a$10$...", // Bcrypt hash of password
  role: "ADMIN",
  avatar: null,
  address: null,
  savedAddresses: [],
  isActive: true,
  isEmailVerified: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Insert Default Settings
db.settings.insertOne({
  key: "GENERAL",
  siteName: "BlackPiston Garage",
  siteTagline: "Premium Motorcycle Gear & Accessories",
  contactEmail: "contact@blackpiston.com",
  supportEmail: "support@blackpiston.com",
  contactPhone: "+91 98765 43210",
  address: {
    street: "123 Biker Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India"
  },
  maintenanceMode: false,
  allowRegistration: true,
  updatedAt: new Date()
})

print("BlackPiston database initialized successfully!")
```

---

## 📈 Dashboard Support

This schema design supports the following admin dashboard features:

### Orders Dashboard
- View all orders with status filtering
- Order timeline/status history
- Payment status tracking
- Shipping tracking integration

### Payments Page
- Transaction history
- Payment status (Paid/Pending/Failed)
- Refund management
- Gateway response logs

### Inventory Management
- Stock levels across products
- Low stock alerts (reorderLevel)
- Stock movement history
- Supplier connections

### Top Offers
- Create/manage promotional offers
- Set validity periods
- Track usage
- Feature products

### Order History
- Complete order timeline
- Status tracking
- Customer order history
- Revenue analytics

---

## 🔒 Security Considerations

1. **Password Storage**: Always use bcrypt or argon2 for `passwordHash`
2. **Sensitive Data**: Encrypt payment gateway secrets in settings
3. **Indexes**: Ensure proper indexes for query performance
4. **Validation**: Add MongoDB schema validation for required fields
5. **TTL Indexes**: Use for notifications and session data

---

## 📝 Notes for Spring Boot Integration

1. Use `spring-data-mongodb` for repository patterns
2. Create corresponding Java/Kotlin entity classes
3. Use `@DBRef` for references or manual population
4. Implement `MongoRepository` interfaces for each collection
5. Use `@Document` annotation with collection names
6. Add `@Indexed` annotations matching the indexes above

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Author**: BlackPiston Development Team
