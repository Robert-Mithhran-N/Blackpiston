// Admin Dashboard Mock Data
// For UI development - Replace with API calls

import {
    DashboardStats,
    Order,
    LowStockProduct,
    ProductRequest,
    User,
    UserStats,
    PaymentStats,
    PaymentSummary,
    CODPayment,
    Payment,
    Notification,
    ChartDataPoint,
    RevenueDataPoint,
    SalesData,
} from '@/types/admin';

// ============================================================
// Dashboard Statistics
// ============================================================
export const dashboardStats: DashboardStats = {
    totalOrders: 1248,
    pendingOrders: 23,
    completedOrders: 1156,
    totalRevenue: 4250000,
    totalPurchasingUsers: 892,
    failedPayments: 12,
    pendingPayments: 18,
};

// ============================================================
// Payment Summary
// ============================================================
export const paymentSummary: PaymentSummary = {
    onlineTotal: 3850000,
    codTotal: 400000,
    combinedTotal: 4250000,
};

// ============================================================
// COD Payments
// ============================================================
export const codPayments: CODPayment[] = [
    { id: 'COD-001', orderId: 'ORD-2025-010', amount: 45999, dateReceived: '2025-01-18', createdAt: '2025-01-18T10:30:00' },
    { id: 'COD-002', orderId: 'ORD-2025-015', amount: 28999, dateReceived: '2025-01-19', createdAt: '2025-01-19T14:00:00' },
    { id: 'COD-003', orderId: 'ORD-2025-020', amount: 67999, dateReceived: '2025-01-20', createdAt: '2025-01-20T11:00:00' },
];

// ============================================================
// Orders Data - Extended with paymentMethod
// ============================================================
export const orders: Order[] = [
    {
        id: 'ORD-2025-001',
        userId: 'USR-001',
        userName: 'Rahul Sharma',
        userEmail: 'rahul.sharma@email.com',
        items: [
            { id: 'ITM-001', productId: 'PRD-001', productName: 'AGV K6 S Helmet', quantity: 1, price: 45999, total: 45999 },
        ],
        totalAmount: 45999,
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        shippingAddress: {
            name: 'Rahul Sharma',
            line1: '123 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
            phone: '+91 9876543210',
        },
        createdAt: '2025-01-20T10:30:00',
        updatedAt: '2025-01-20T14:00:00',
    },
    {
        id: 'ORD-2025-002',
        userId: 'USR-002',
        userName: 'Priya Patel',
        userEmail: 'priya.patel@email.com',
        items: [
            { id: 'ITM-002', productId: 'PRD-002', productName: 'Dainese Racing 4 Jacket', quantity: 1, price: 89999, total: 89999 },
            { id: 'ITM-003', productId: 'PRD-003', productName: 'Alpinestars GP Pro Gloves', quantity: 1, price: 18999, total: 18999 },
        ],
        totalAmount: 108998,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        shippingAddress: {
            name: 'Priya Patel',
            line1: '45 Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
            phone: '+91 9876543211',
        },
        createdAt: '2025-01-20T09:15:00',
        updatedAt: '2025-01-20T09:15:00',
    },
    {
        id: 'ORD-2025-003',
        userId: 'USR-003',
        userName: 'Amit Kumar',
        userEmail: 'amit.kumar@email.com',
        items: [
            { id: 'ITM-004', productId: 'PRD-004', productName: 'Shoei RF-1400 Helmet', quantity: 1, price: 67999, total: 67999 },
        ],
        totalAmount: 67999,
        paymentStatus: 'Paid',
        orderStatus: 'Shipped',
        shippingAddress: {
            name: 'Amit Kumar',
            line1: '78 Park Street',
            city: 'Delhi',
            state: 'Delhi',
            postalCode: '110001',
            country: 'India',
            phone: '+91 9876543212',
        },
        createdAt: '2025-01-19T14:20:00',
        updatedAt: '2025-01-20T08:00:00',
    },
    {
        id: 'ORD-2025-004',
        userId: 'USR-004',
        userName: 'Sneha Reddy',
        userEmail: 'sneha.reddy@email.com',
        items: [
            { id: 'ITM-005', productId: 'PRD-005', productName: 'Rev\'It Striker 3 Gloves', quantity: 1, price: 15999, total: 15999 },
        ],
        totalAmount: 15999,
        paymentStatus: 'Failed',
        orderStatus: 'Pending',
        shippingAddress: {
            name: 'Sneha Reddy',
            line1: '12 Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500033',
            country: 'India',
            phone: '+91 9876543213',
        },
        createdAt: '2025-01-20T11:45:00',
        updatedAt: '2025-01-20T11:45:00',
    },
    {
        id: 'ORD-2025-005',
        userId: 'USR-005',
        userName: 'Vikram Singh',
        userEmail: 'vikram.singh@email.com',
        items: [
            { id: 'ITM-006', productId: 'PRD-006', productName: 'AGV Pista GP RR', quantity: 1, price: 125000, total: 125000 },
        ],
        totalAmount: 125000,
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        shippingAddress: {
            name: 'Vikram Singh',
            line1: '56 Sector 17',
            city: 'Chandigarh',
            state: 'Chandigarh',
            postalCode: '160017',
            country: 'India',
            phone: '+91 9876543214',
        },
        createdAt: '2025-01-20T08:00:00',
        updatedAt: '2025-01-20T10:30:00',
    },
    {
        id: 'ORD-2025-006',
        userId: 'USR-006',
        userName: 'Kavitha Nair',
        userEmail: 'kavitha.nair@email.com',
        items: [
            { id: 'ITM-007', productId: 'PRD-007', productName: 'Alpinestars SMX-6 Boots', quantity: 1, price: 28999, total: 28999 },
        ],
        totalAmount: 28999,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        shippingAddress: {
            name: 'Kavitha Nair',
            line1: '89 MG Road',
            city: 'Kochi',
            state: 'Kerala',
            postalCode: '682001',
            country: 'India',
            phone: '+91 9876543215',
        },
        createdAt: '2025-01-20T07:30:00',
        updatedAt: '2025-01-20T07:30:00',
    },
    {
        id: 'ORD-2025-007',
        userId: 'USR-007',
        userName: 'Arjun Mehta',
        userEmail: 'arjun.mehta@email.com',
        items: [
            { id: 'ITM-008', productId: 'PRD-008', productName: 'Dainese Super Speed Tex', quantity: 1, price: 52999, total: 52999 },
            { id: 'ITM-009', productId: 'PRD-009', productName: 'TCX SP-Master Boots', quantity: 1, price: 24999, total: 24999 },
        ],
        totalAmount: 77998,
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        shippingAddress: {
            name: 'Arjun Mehta',
            line1: '34 Civil Lines',
            city: 'Jaipur',
            state: 'Rajasthan',
            postalCode: '302001',
            country: 'India',
            phone: '+91 9876543216',
        },
        createdAt: '2025-01-18T16:45:00',
        updatedAt: '2025-01-20T12:00:00',
    },
    {
        id: 'ORD-2025-008',
        userId: 'USR-008',
        userName: 'Divya Krishnan',
        userEmail: 'divya.k@email.com',
        items: [
            { id: 'ITM-010', productId: 'PRD-010', productName: 'Shoei X-Fourteen Marquez', quantity: 1, price: 89999, total: 89999 },
        ],
        totalAmount: 89999,
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        shippingAddress: {
            name: 'Divya Krishnan',
            line1: '67 Anna Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            postalCode: '600040',
            country: 'India',
            phone: '+91 9876543217',
        },
        createdAt: '2025-01-19T09:30:00',
        updatedAt: '2025-01-20T11:00:00',
    },
    {
        id: 'ORD-2025-009',
        userId: 'USR-009',
        userName: 'Sanjay Kumar',
        userEmail: 'sanjay.k@email.com',
        items: [
            { id: 'ITM-011', productId: 'PRD-011', productName: 'Arai RX-7V Evo', quantity: 1, price: 95000, total: 95000 },
        ],
        totalAmount: 95000,
        paymentStatus: 'Paid',
        orderStatus: 'Pending',
        shippingAddress: {
            name: 'Sanjay Kumar',
            line1: '22 Brigade Road',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560025',
            country: 'India',
            phone: '+91 9876543218',
        },
        createdAt: '2025-01-21T08:00:00',
        updatedAt: '2025-01-21T08:00:00',
    },
    {
        id: 'ORD-2025-010',
        userId: 'USR-010',
        userName: 'Meera Joshi',
        userEmail: 'meera.j@email.com',
        items: [
            { id: 'ITM-012', productId: 'PRD-012', productName: 'Alpinestars Tech-Air 5', quantity: 1, price: 112000, total: 112000 },
        ],
        totalAmount: 112000,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        shippingAddress: {
            name: 'Meera Joshi',
            line1: '45 FC Road',
            city: 'Pune',
            state: 'Maharashtra',
            postalCode: '411004',
            country: 'India',
            phone: '+91 9876543219',
        },
        createdAt: '2025-01-21T09:30:00',
        updatedAt: '2025-01-21T09:30:00',
    },
];

// ============================================================
// Low Stock Products
// ============================================================
export const lowStockProducts: LowStockProduct[] = [
    { id: 'PRD-001', name: 'AGV Pista GP RR - Rossi Misano 2021', category: 'Helmets', currentStock: 2, reorderLevel: 5 },
    { id: 'PRD-002', name: 'Dainese Super Speed Tex Jacket - Black/Red', category: 'Riding Jackets', currentStock: 3, reorderLevel: 5 },
    { id: 'PRD-003', name: 'Alpinestars Supertech R Boots - Black', category: 'Riding Boots', currentStock: 1, reorderLevel: 5 },
    { id: 'PRD-004', name: 'Shoei X-Fourteen Marquez Catalunya', category: 'Helmets', currentStock: 4, reorderLevel: 5 },
    { id: 'PRD-005', name: 'Rev\'It Jerez 3 Gloves - Black/White', category: 'Riding Gloves', currentStock: 2, reorderLevel: 5 },
    { id: 'PRD-006', name: 'Arai RX-7V Evo - Nakagami GP2', category: 'Helmets', currentStock: 1, reorderLevel: 5 },
    { id: 'PRD-007', name: 'Dainese D-Air Smart Jacket', category: 'Riding Jackets', currentStock: 3, reorderLevel: 5 },
    { id: 'PRD-008', name: 'TCX Comp Evo 2 Boots - Michelin', category: 'Riding Boots', currentStock: 2, reorderLevel: 5 },
    { id: 'PRD-009', name: 'Alpinestars GP Plus R V4 Gloves', category: 'Riding Gloves', currentStock: 4, reorderLevel: 5 },
];

// ============================================================
// User Product Requests
// ============================================================
export const productRequests: ProductRequest[] = [
    { id: 'REQ-001', productName: 'Arai RX-7V Evo - Nakagami GP2 (Size M)', requestedBy: 'Arjun Mehta', userEmail: 'arjun.mehta@email.com', userPhone: '+91 9876543220', requestDate: '2025-01-20', status: 'Pending', notes: 'Looking for size M in blue' },
    { id: 'REQ-002', productName: 'Dainese D-Air Smart Jacket (Size L)', requestedBy: 'Neha Gupta', userEmail: 'neha.gupta@email.com', userPhone: '+91 9876543221', requestDate: '2025-01-19', status: 'Approved' },
    { id: 'REQ-003', productName: 'Alpinestars Tech-Air 5 Airbag System', requestedBy: 'Ravi Chopra', userEmail: 'ravi.chopra@email.com', userPhone: '+91 9876543222', requestDate: '2025-01-18', status: 'Pending' },
    { id: 'REQ-004', productName: 'Ohlins TTX GP Rear Shock for ZX-10R', requestedBy: 'Deepak Verma', userEmail: 'deepak.verma@email.com', userPhone: '+91 9876543223', requestDate: '2025-01-17', status: 'Rejected', notes: 'Product discontinued by manufacturer' },
    { id: 'REQ-005', productName: 'Akrapovic Evolution Line Exhaust - S1000RR', requestedBy: 'Kiran Rao', userEmail: 'kiran.rao@email.com', userPhone: '+91 9876543224', requestDate: '2025-01-20', status: 'Pending', notes: 'Titanium version preferred' },
    { id: 'REQ-006', productName: 'Shoei X-SPR Pro - Marquez Dazzle', requestedBy: 'Sanjay Kumar', userEmail: 'sanjay.k@email.com', userPhone: '+91 9876543225', requestDate: '2025-01-19', status: 'Approved' },
    { id: 'REQ-007', productName: 'Brembo GP4-RX Calipers - Pair', requestedBy: 'Priya Sharma', userEmail: 'priya.s@email.com', userPhone: '+91 9876543226', requestDate: '2025-01-18', status: 'Pending' },
    { id: 'REQ-008', productName: 'Rizoma Mirror - Stealth Series', requestedBy: 'Amit Joshi', userEmail: 'amit.j@email.com', userPhone: '+91 9876543227', requestDate: '2025-01-17', status: 'Approved' },
    { id: 'REQ-009', productName: 'Yoshimura Alpha T Slip-On - CBR1000RR', requestedBy: 'Rahul Menon', userEmail: 'rahul.m@email.com', userPhone: '+91 9876543228', requestDate: '2025-01-16', status: 'Rejected', notes: 'Not available for India market' },
    { id: 'REQ-010', productName: 'Spidi Track Wind Pro Leather Suit', requestedBy: 'Vikrant Chauhan', userEmail: 'vikrant.c@email.com', userPhone: '+91 9876543229', requestDate: '2025-01-20', status: 'Pending', notes: 'Custom size needed' },
];

// ============================================================
// Users Data
// ============================================================
export const users: User[] = [
    { id: 'USR-001', name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 9876543210', totalOrders: 12, totalSpent: 285000, lastOrderDate: '2025-01-20', createdAt: '2024-03-15' },
    { id: 'USR-002', name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91 9876543211', totalOrders: 5, totalSpent: 125000, lastOrderDate: '2025-01-20', createdAt: '2024-06-20' },
    { id: 'USR-003', name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 9876543212', totalOrders: 8, totalSpent: 345000, lastOrderDate: '2025-01-19', createdAt: '2024-01-10' },
    { id: 'USR-004', name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '+91 9876543213', totalOrders: 3, totalSpent: 78000, lastOrderDate: '2025-01-20', createdAt: '2024-09-05' },
    { id: 'USR-005', name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 9876543214', totalOrders: 15, totalSpent: 567000, lastOrderDate: '2025-01-20', createdAt: '2023-12-01' },
];

export const userStats: UserStats = {
    totalRegistered: 1248,
    totalPurchasers: 892,
    newThisMonth: 67,
};

// ============================================================
// Payment Data
// ============================================================
export const paymentStats: PaymentStats = {
    paid: 1156,
    pending: 18,
    failed: 12,
    totalAmount: 4250000,
};

export const payments: Payment[] = [
    { id: 'PAY-001', orderId: 'ORD-2025-001', userId: 'USR-001', userName: 'Rahul Sharma', amount: 45999, method: 'UPI', status: 'Paid', transactionId: 'TXN123456', createdAt: '2025-01-20T10:32:00' },
    { id: 'PAY-002', orderId: 'ORD-2025-002', userId: 'USR-002', userName: 'Priya Patel', amount: 108998, method: 'Card', status: 'Pending', createdAt: '2025-01-20T09:16:00' },
    { id: 'PAY-003', orderId: 'ORD-2025-003', userId: 'USR-003', userName: 'Amit Kumar', amount: 67999, method: 'NetBanking', status: 'Paid', transactionId: 'TXN123457', createdAt: '2025-01-19T14:22:00' },
    { id: 'PAY-004', orderId: 'ORD-2025-004', userId: 'USR-004', userName: 'Sneha Reddy', amount: 15999, method: 'Card', status: 'Failed', createdAt: '2025-01-20T11:46:00' },
    { id: 'PAY-005', orderId: 'ORD-2025-005', userId: 'USR-005', userName: 'Vikram Singh', amount: 125000, method: 'UPI', status: 'Paid', transactionId: 'TXN123458', createdAt: '2025-01-20T08:02:00' },
    { id: 'PAY-006', orderId: 'ORD-2025-006', userId: 'USR-006', userName: 'Kavitha Nair', amount: 28999, method: 'COD', status: 'Pending', createdAt: '2025-01-20T07:32:00' },
];

// ============================================================
// Notifications - New Order Notifications
// ============================================================
export const notifications: Notification[] = [
    { id: 'NOT-001', type: 'order', title: 'New Order Received', message: 'Order ORD-2025-010 from Meera Joshi', orderId: 'ORD-2025-010', customerName: 'Meera Joshi', isRead: false, createdAt: '2025-01-21T09:30:00' },
    { id: 'NOT-002', type: 'order', title: 'New Order Received', message: 'Order ORD-2025-009 from Sanjay Kumar', orderId: 'ORD-2025-009', customerName: 'Sanjay Kumar', isRead: false, createdAt: '2025-01-21T08:00:00' },
    { id: 'NOT-003', type: 'order', title: 'New Order Received', message: 'Order ORD-2025-006 from Kavitha Nair', orderId: 'ORD-2025-006', customerName: 'Kavitha Nair', isRead: false, createdAt: '2025-01-20T07:30:00' },
    { id: 'NOT-004', type: 'payment', title: 'Payment Failed', message: 'Payment for order ORD-2025-004 failed', orderId: 'ORD-2025-004', customerName: 'Sneha Reddy', isRead: true, createdAt: '2025-01-20T11:46:00' },
    { id: 'NOT-005', type: 'order', title: 'New Order Received', message: 'Order ORD-2025-005 from Vikram Singh', orderId: 'ORD-2025-005', customerName: 'Vikram Singh', isRead: true, createdAt: '2025-01-20T08:00:00' },
];

// ============================================================
// Chart Data
// ============================================================
export const paymentChartData: ChartDataPoint[] = [
    { name: 'Paid', value: 1156, color: '#22c55e' },
    { name: 'Pending', value: 18, color: '#eab308' },
    { name: 'Failed', value: 12, color: '#ef4444' },
];

export const revenueData: RevenueDataPoint[] = [
    { date: '2025-01-14', revenue: 156000, orders: 23 },
    { date: '2025-01-15', revenue: 245000, orders: 31 },
    { date: '2025-01-16', revenue: 189000, orders: 27 },
    { date: '2025-01-17', revenue: 312000, orders: 42 },
    { date: '2025-01-18', revenue: 278000, orders: 38 },
    { date: '2025-01-19', revenue: 423000, orders: 52 },
    { date: '2025-01-20', revenue: 367000, orders: 45 },
];

// ============================================================
// Sales Data for Graph
// ============================================================
export const salesData: SalesData = {
    weekly: [
        { period: 'Mon', unitsSold: 45, percentageSold: 12 },
        { period: 'Tue', unitsSold: 62, percentageSold: 16 },
        { period: 'Wed', unitsSold: 38, percentageSold: 10 },
        { period: 'Thu', unitsSold: 78, percentageSold: 20 },
        { period: 'Fri', unitsSold: 95, percentageSold: 25 },
        { period: 'Sat', unitsSold: 112, percentageSold: 29 },
        { period: 'Sun', unitsSold: 85, percentageSold: 22 },
    ],
    monthly: [
        { period: 'Week 1', unitsSold: 320, percentageSold: 18 },
        { period: 'Week 2', unitsSold: 445, percentageSold: 25 },
        { period: 'Week 3', unitsSold: 512, percentageSold: 29 },
        { period: 'Week 4', unitsSold: 478, percentageSold: 27 },
    ],
    yearly: [
        { period: 'Jan', unitsSold: 1520, percentageSold: 8 },
        { period: 'Feb', unitsSold: 1280, percentageSold: 7 },
        { period: 'Mar', unitsSold: 1890, percentageSold: 10 },
        { period: 'Apr', unitsSold: 2100, percentageSold: 11 },
        { period: 'May', unitsSold: 1750, percentageSold: 9 },
        { period: 'Jun', unitsSold: 2340, percentageSold: 12 },
        { period: 'Jul', unitsSold: 2560, percentageSold: 13 },
        { period: 'Aug', unitsSold: 2890, percentageSold: 15 },
        { period: 'Sep', unitsSold: 2450, percentageSold: 13 },
        { period: 'Oct', unitsSold: 2780, percentageSold: 14 },
        { period: 'Nov', unitsSold: 3120, percentageSold: 16 },
        { period: 'Dec', unitsSold: 3560, percentageSold: 18 },
    ],
};

export const topBuyers: User[] = users.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
