// Admin Dashboard TypeScript Types

// ============================================================
// Dashboard Stats Types
// ============================================================
export interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    totalPurchasingUsers: number;
    failedPayments: number;
    pendingPayments: number;
}

// ============================================================
// Top Offer Types
// ============================================================
export interface TopOffer {
    id: string;
    productName: string;
    productImage: string;
    originalPrice: number;
    offerPrice: number;
    discountPercent: number;
    status: 'Active' | 'Inactive';
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// Order Types — aligned with Prisma OrderProduct & ShippingAddress
// ============================================================
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'ONLINE' | 'COD' | 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';

export interface OrderProduct {
    productId: string;
    name: string;
    sku: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variantSize?: string;
    variantColor?: string;
}

export interface ShippingAddress {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

export interface TrackingInfo {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
}

export interface OrderStatusHistoryEntry {
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    user?: { name: string; email: string; phone?: string };
    // Flattened user fields (populated by backend)
    userName?: string;
    userEmail?: string;
    products: OrderProduct[];
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    couponCode?: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    shippingAddress?: ShippingAddress;
    billingAddress?: ShippingAddress;
    tracking?: TrackingInfo;
    statusHistory: OrderStatusHistoryEntry[];
    notes?: string;
    orderedAt: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

// Legacy aliases for backward compatibility
export type OrderItem = OrderProduct;
export type Address = ShippingAddress;

// ============================================================
// Product Types
// ============================================================
export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image?: string;
    status: 'Active' | 'Inactive' | 'Draft';
}

export interface LowStockProduct {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    reorderLevel: number;
    image?: string;
}

// ============================================================
// User Product Request Types
// ============================================================
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESPONDED' | 'COMPLETED' | 'CLOSED';

export interface ProductRequest {
    id: string;
    productName?: string;
    requestedBy?: string; // Legacy
    userName?: string; // Backend
    userEmail?: string;
    userPhone?: string;
    requestDate?: string; // Legacy
    createdAt?: string; // Backend
    status?: RequestStatus; // Legacy
    requestStatus?: RequestStatus; // Backend
    requestType?: string; // Backend
    message?: string; // Backend
    notes?: string;
}

// ============================================================
// User Types
// ============================================================
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
    createdAt: string;
}

export interface UserStats {
    totalRegistered: number;
    totalPurchasers: number;
    newThisMonth: number;
}

// ============================================================
// Payment Types
// ============================================================
export interface PaymentStats {
    paid: number;
    pending: number;
    failed: number;
    totalAmount: number;
}

export interface PaymentSummary {
    onlineTotal: number;
    codTotal: number;
    combinedTotal: number;
}

export interface CODPayment {
    id: string;
    orderId: string;
    amount: number;
    dateReceived: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    userName: string;
    amount: number;
    method: 'UPI' | 'Card' | 'NetBanking' | 'COD' | 'Wallet';
    status: PaymentStatus;
    transactionId?: string;
    createdAt: string;
}

// ============================================================
// Notification Types
// ============================================================
export type NotificationType =
    | 'NEW_ORDER'
    | 'PAYMENT_SUCCESS'
    | 'LOW_STOCK'
    | 'NEW_USER'
    | 'COD_RECEIVED'
    | 'REFUND_REQUEST'
    | 'ORDER_CANCELLED';

export interface AdminNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    orderId?: string;
    orderNumber?: string;
    customerName?: string;
    amount?: number;
    paymentMethod?: string;
    products?: { name: string; quantity: number; image?: string }[];
    isRead: boolean;
    createdAt: string;
}

/** @deprecated Use AdminNotification instead */
export interface Notification {
    id: string;
    type: 'order' | 'payment' | 'stock' | 'request';
    title: string;
    message: string;
    orderId?: string;
    customerName?: string;
    isRead: boolean;
    createdAt: string;
}

// ============================================================
// Chart Data Types
// ============================================================
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

// ============================================================
// Sales Data Types
// ============================================================
export interface SalesDataPoint {
    period: string;
    unitsSold: number;
    percentageSold: number;
}

export interface SalesData {
    weekly: SalesDataPoint[];
    monthly: SalesDataPoint[];
    yearly: SalesDataPoint[];
}
