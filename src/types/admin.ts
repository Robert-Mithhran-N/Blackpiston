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
// Order Types
// ============================================================
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Order {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    items: OrderItem[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    shippingAddress: Address;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
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
    productName: string;
    requestedBy: string;
    userEmail: string;
    userPhone: string;
    requestDate: string;
    status: RequestStatus;
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
