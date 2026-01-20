// Admin Dashboard TypeScript Types
// All types for the admin panel UI

// ============================================================
// KPI & Dashboard Types
// ============================================================
export interface DashboardKPI {
    grossRevenue: number;
    netRevenue: number;
    ordersOpen: number;
    ordersClosed: number;
    paymentsPending: number;
    lowStockCount: number;
    todaysBookings: number;
}

export interface RecentOrder {
    id: string;
    customerId: string;
    customerName: string;
    date: string;
    status: OrderStatus;
    total: number;
    paymentStatus: PaymentStatus;
}

export interface RecentPayment {
    id: string;
    orderId: string;
    customerName: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    status: PaymentStatus;
}

export interface LowStockAlert {
    id: string;
    productName: string;
    sku: string;
    currentStock: number;
    reorderPoint: number;
    category: string;
    isCritical: boolean;
}

export interface PendingBooking {
    id: string;
    customerName: string;
    vehicleInfo: string;
    serviceType: string;
    date: string;
    time: string;
    status: BookingStatus;
}

// ============================================================
// Order Types
// ============================================================
export type OrderStatus =
    | 'New'
    | 'Confirmed'
    | 'Packed'
    | 'Shipped'
    | 'Delivered'
    | 'Closed'
    | 'Cancelled';

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    date: string;
    status: OrderStatus;
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    paymentStatus: PaymentStatus;
    items: OrderItem[];
    shippingAddress: Address;
    billingAddress: Address;
    notes: string;
    carrier?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
    image?: string;
}

export interface Address {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
}

// ============================================================
// Payment Types
// ============================================================
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Refunded' | 'Failed';
export type PaymentMethod = 'Online' | 'COD' | 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Debit Card';

export interface Payment {
    id: string;
    userId: string;
    username: string;
    contact: string;
    address: string;
    orderId: string;
    itemsSummary: string;
    orderDate: string;
    productReceivedDate?: string;
    amountDue: number;
    amountReceived: number;
    receivedDate?: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// Customer Types
// ============================================================
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    ordersCount: number;
    lifetimeValue: number;
    vehicles: SavedVehicle[];
    addresses: Address[];
    createdAt: string;
    lastOrderDate?: string;
}

export interface SavedVehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    variant?: string;
    registrationNumber?: string;
}

// ============================================================
// Product Types (Extended for Admin)
// ============================================================
export interface AdminProduct {
    id: string;
    name: string;
    sku: string;
    brand: string;
    category: string;
    subcategory?: string;
    tags: string[];
    price: number;
    comparePrice?: number;
    cost?: number;
    images: string[];
    variants: ProductVariant[];
    stockQuantity: number;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
    weight?: number;
    dimensions?: ProductDimensions;
    attributes: ProductAttribute[];
    vehicleFitments: VehicleFitment[];
    status: 'Active' | 'Draft' | 'Archived';
    scheduledPriceChange?: ScheduledPriceChange;
    createdAt: string;
    updatedAt: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    size?: string;
    color?: string;
    price: number;
    stockQuantity: number;
}

export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
}

export interface ProductAttribute {
    name: string;
    value: string;
}

export interface VehicleFitment {
    id: string;
    make: string;
    model: string;
    yearFrom: number;
    yearTo: number;
    notes?: string;
}

export interface ScheduledPriceChange {
    newPrice: number;
    scheduledDate: string;
    scheduledTime: string;
}

// ============================================================
// Inventory & Supplier Types
// ============================================================
export interface InventoryItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    category: string;
    currentStock: number;
    reorderPoint: number;
    maxStock: number;
    lastRestocked?: string;
    supplierId?: string;
    supplierName?: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: SupplierAddress;
    categories: string[];
    productCodes: string[];
    products: SupplierProduct[];
    leadTimeDays: number;
    minimumOrderQuantity: number;
    rating: number;
    paymentTerms: string;
    notes?: string;
    status: 'Active' | 'Inactive' | 'On Hold';
}

export interface SupplierAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface SupplierProduct {
    productId: string;
    productName: string;
    sku: string;
    costPrice: number;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseOrderItem[];
    status: 'Draft' | 'Sent' | 'Confirmed' | 'Received' | 'Cancelled';
    totalAmount: number;
    createdAt: string;
    expectedDelivery?: string;
    receivedAt?: string;
}

export interface PurchaseOrderItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// ============================================================
// Admin User & Role Types
// ============================================================
export type AdminRole =
    | 'SuperAdmin'
    | 'ProductManager'
    | 'OrderManager'
    | 'Accountant'
    | 'ServiceManager'
    | 'Support';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    permissions: Permission[];
    twoFactorEnabled: boolean;
    lastLogin?: string;
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export interface Permission {
    module: string;
    actions: ('view' | 'create' | 'edit' | 'delete')[];
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    createdAt: string;
    lastUsed?: string;
    expiresAt?: string;
    status: 'Active' | 'Revoked';
}

// ============================================================
// RMA / Returns Types
// ============================================================
export type RMAStatus =
    | 'Requested'
    | 'Approved'
    | 'Rejected'
    | 'Received'
    | 'Refunded'
    | 'Replaced';

export interface RMA {
    id: string;
    orderId: string;
    customerId: string;
    customerName: string;
    reason: string;
    items: RMAItem[];
    status: RMAStatus;
    resolution?: 'Refund' | 'Replace';
    refundAmount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface RMAItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    reason: string;
}

// ============================================================
// Service Booking Types
// ============================================================
export type BookingStatus =
    | 'Pending'
    | 'Confirmed'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled';

export interface ServiceBooking {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    vehicleInfo: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    serviceType: string;
    services: string[];
    date: string;
    timeSlot: string;
    status: BookingStatus;
    assignedMechanic?: string;
    estimatedCost?: number;
    actualCost?: number;
    notes?: string;
    createdAt: string;
}

export interface JobCard {
    id: string;
    bookingId: string;
    customerId: string;
    customerName: string;
    vehicleInfo: string;
    assignedMechanic: string;
    services: JobCardService[];
    partsUsed: JobCardPart[];
    laborHours: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
    status: 'Open' | 'In Progress' | 'Completed' | 'Invoiced';
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
}

export interface JobCardService {
    name: string;
    description: string;
    price: number;
    completed: boolean;
}

export interface JobCardPart {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// ============================================================
// Reports & Audit Types
// ============================================================
export interface SalesReport {
    period: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
    topProducts: { name: string; quantity: number; revenue: number }[];
    topCategories: { name: string; revenue: number }[];
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
    timestamp: string;
    ipAddress?: string;
}

// ============================================================
// Support Ticket Types
// ============================================================
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Customer' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface SupportTicket {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    orderId?: string;
    productId?: string;
    assignedTo?: string;
    messages: TicketMessage[];
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface TicketMessage {
    id: string;
    sender: string;
    senderType: 'Customer' | 'Admin';
    message: string;
    timestamp: string;
}

// ============================================================
// Filter & View Types
// ============================================================
export interface SavedFilter {
    id: string;
    name: string;
    module: string;
    filters: Record<string, unknown>;
    isDefault: boolean;
    role?: AdminRole;
    createdBy: string;
    createdAt: string;
}

export interface TableColumn {
    id: string;
    label: string;
    sortable?: boolean;
    visible?: boolean;
    width?: string;
}

// ============================================================
// Common UI Types
// ============================================================
export interface SelectOption {
    value: string;
    label: string;
}

export interface DateRange {
    from: Date;
    to: Date;
}

export interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
