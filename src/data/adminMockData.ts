// Admin Dashboard Mock Data
// For UI development only - no backend connections

import {
    DashboardKPI,
    RecentOrder,
    RecentPayment,
    LowStockAlert,
    PendingBooking,
    Order,
    OrderStatus,
    Payment,
    PaymentStatus,
    PaymentMethod,
    Customer,
    AdminProduct,
    InventoryItem,
    Supplier,
    PurchaseOrder,
    AdminUser,
    AdminRole,
    RMA,
    RMAStatus,
    ServiceBooking,
    JobCard,
    BookingStatus,
    AuditLog,
    SupportTicket,
    TicketStatus,
} from '@/types/admin';

// ============================================================
// Dashboard KPIs
// ============================================================
export const dashboardKPIs: DashboardKPI = {
    grossRevenue: 1250000,
    netRevenue: 987500,
    ordersOpen: 34,
    ordersClosed: 156,
    paymentsPending: 12,
    lowStockCount: 8,
    todaysBookings: 5,
};

// ============================================================
// Recent Orders (Dashboard Widget)
// ============================================================
export const recentOrders: RecentOrder[] = [
    { id: 'ORD-2025-001', customerId: 'CUST-001', customerName: 'Rahul Sharma', date: '2025-01-20', status: 'New', total: 45999, paymentStatus: 'Pending' },
    { id: 'ORD-2025-002', customerId: 'CUST-002', customerName: 'Priya Patel', date: '2025-01-20', status: 'Confirmed', total: 28500, paymentStatus: 'Paid' },
    { id: 'ORD-2025-003', customerId: 'CUST-003', customerName: 'Amit Kumar', date: '2025-01-19', status: 'Packed', total: 67999, paymentStatus: 'Paid' },
    { id: 'ORD-2025-004', customerId: 'CUST-004', customerName: 'Sneha Reddy', date: '2025-01-19', status: 'Shipped', total: 15999, paymentStatus: 'Paid' },
    { id: 'ORD-2025-005', customerId: 'CUST-005', customerName: 'Vikram Singh', date: '2025-01-18', status: 'Delivered', total: 89999, paymentStatus: 'Paid' },
];

// ============================================================
// Recent Payments (Dashboard Widget)
// ============================================================
export const recentPayments: RecentPayment[] = [
    { id: 'PAY-001', orderId: 'ORD-2025-002', customerName: 'Priya Patel', amount: 28500, method: 'UPI', date: '2025-01-20', status: 'Paid' },
    { id: 'PAY-002', orderId: 'ORD-2025-003', customerName: 'Amit Kumar', amount: 67999, method: 'Credit Card', date: '2025-01-19', status: 'Paid' },
    { id: 'PAY-003', orderId: 'ORD-2025-005', customerName: 'Vikram Singh', amount: 44999, method: 'Online', date: '2025-01-18', status: 'Partial' },
    { id: 'PAY-004', orderId: 'ORD-2025-001', customerName: 'Rahul Sharma', amount: 45999, method: 'Bank Transfer', date: '2025-01-18', status: 'Pending' },
];

// ============================================================
// Low Stock Alerts (Dashboard Widget)
// ============================================================
export const lowStockAlerts: LowStockAlert[] = [
    { id: 'AGV-001', productName: 'Pista GP RR', sku: 'AGV-PISTA-001', currentStock: 2, reorderPoint: 5, category: 'Helmets', isCritical: true },
    { id: 'DAI-002', productName: 'Super Speed Tex', sku: 'DAI-SST-002', currentStock: 3, reorderPoint: 5, category: 'Riding Jackets', isCritical: true },
    { id: 'GLV-003', productName: 'Jerez 3', sku: 'REV-J3-003', currentStock: 4, reorderPoint: 5, category: 'Riding Gloves', isCritical: false },
    { id: 'BOOT-003', productName: 'Jerez Pro', sku: 'REV-JP-003', currentStock: 5, reorderPoint: 8, category: 'Riding Boots', isCritical: false },
    { id: 'HJC-002', productName: 'F70', sku: 'HJC-F70-002', currentStock: 3, reorderPoint: 5, category: 'Helmets', isCritical: true },
];

// ============================================================
// Pending Service Bookings (Dashboard Widget)
// ============================================================
export const pendingBookings: PendingBooking[] = [
    { id: 'BK-001', customerName: 'Arjun Mehta', vehicleInfo: 'Duke 390 (2023)', serviceType: 'Full Service', date: '2025-01-20', time: '10:00 AM', status: 'Pending' },
    { id: 'BK-002', customerName: 'Neha Gupta', vehicleInfo: 'Ninja 650 (2022)', serviceType: 'Oil Change', date: '2025-01-20', time: '11:30 AM', status: 'Confirmed' },
    { id: 'BK-003', customerName: 'Ravi Chopra', vehicleInfo: 'CBR 650R (2024)', serviceType: 'Brake Service', date: '2025-01-20', time: '02:00 PM', status: 'Pending' },
    { id: 'BK-004', customerName: 'Kavitha Nair', vehicleInfo: 'Himalayan 450 (2024)', serviceType: 'Chain & Sprocket', date: '2025-01-20', time: '03:30 PM', status: 'Confirmed' },
    { id: 'BK-005', customerName: 'Rohit Verma', vehicleInfo: 'RS 200 (2021)', serviceType: 'Full Service', date: '2025-01-20', time: '05:00 PM', status: 'Pending' },
];

// ============================================================
// Full Orders Data
// ============================================================
export const allOrders: Order[] = [
    {
        id: 'ORD-2025-001',
        customerId: 'CUST-001',
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul.sharma@email.com',
        date: '2025-01-20',
        status: 'New',
        total: 45999,
        subtotal: 43999,
        tax: 2000,
        shipping: 0,
        discount: 0,
        paymentStatus: 'Pending',
        items: [
            { id: 'ITM-001', productId: 'AGV-002', productName: 'AGV K6 S', sku: 'AGV-K6S-BLK-M', price: 45999, quantity: 1, total: 45999 },
        ],
        shippingAddress: { name: 'Rahul Sharma', line1: '123 MG Road', line2: 'Apt 5B', city: 'Bangalore', state: 'Karnataka', postalCode: '560001', country: 'India', phone: '+91 9876543210' },
        billingAddress: { name: 'Rahul Sharma', line1: '123 MG Road', line2: 'Apt 5B', city: 'Bangalore', state: 'Karnataka', postalCode: '560001', country: 'India', phone: '+91 9876543210' },
        notes: 'Please deliver before 5 PM',
        createdAt: '2025-01-20T10:30:00',
        updatedAt: '2025-01-20T10:30:00',
    },
    {
        id: 'ORD-2025-002',
        customerId: 'CUST-002',
        customerName: 'Priya Patel',
        customerEmail: 'priya.patel@email.com',
        date: '2025-01-20',
        status: 'Confirmed',
        total: 28500,
        subtotal: 26500,
        tax: 2000,
        shipping: 0,
        discount: 0,
        paymentStatus: 'Paid',
        items: [
            { id: 'ITM-002', productId: 'GLV-004', productName: 'Alpinestars SMX-1 Air v2', sku: 'ALP-SMX1-BLK-M', price: 18999, quantity: 1, total: 18999 },
            { id: 'ITM-003', productId: 'ACC-007', productName: 'Motul Synthetic Oil 10W-40', sku: 'MOT-SYN-1L', price: 2999, quantity: 3, total: 8997 },
        ],
        shippingAddress: { name: 'Priya Patel', line1: '45 Linking Road', city: 'Mumbai', state: 'Maharashtra', postalCode: '400050', country: 'India', phone: '+91 9876543211' },
        billingAddress: { name: 'Priya Patel', line1: '45 Linking Road', city: 'Mumbai', state: 'Maharashtra', postalCode: '400050', country: 'India', phone: '+91 9876543211' },
        notes: '',
        createdAt: '2025-01-20T09:15:00',
        updatedAt: '2025-01-20T11:00:00',
    },
    {
        id: 'ORD-2025-003',
        customerId: 'CUST-003',
        customerName: 'Amit Kumar',
        customerEmail: 'amit.kumar@email.com',
        date: '2025-01-19',
        status: 'Packed',
        total: 67999,
        subtotal: 63999,
        tax: 4000,
        shipping: 0,
        discount: 0,
        paymentStatus: 'Paid',
        items: [
            { id: 'ITM-004', productId: 'SHOEI-002', productName: 'Shoei RF-1400', sku: 'SHOEI-RF14-WHT-L', price: 67999, quantity: 1, total: 67999 },
        ],
        shippingAddress: { name: 'Amit Kumar', line1: '78 Park Street', city: 'Delhi', state: 'Delhi', postalCode: '110001', country: 'India', phone: '+91 9876543212' },
        billingAddress: { name: 'Amit Kumar', line1: '78 Park Street', city: 'Delhi', state: 'Delhi', postalCode: '110001', country: 'India', phone: '+91 9876543212' },
        notes: 'Gift wrap please',
        carrier: 'BlueDart',
        createdAt: '2025-01-19T14:20:00',
        updatedAt: '2025-01-20T08:00:00',
    },
    {
        id: 'ORD-2025-004',
        customerId: 'CUST-004',
        customerName: 'Sneha Reddy',
        customerEmail: 'sneha.reddy@email.com',
        date: '2025-01-19',
        status: 'Shipped',
        total: 15999,
        subtotal: 14999,
        tax: 1000,
        shipping: 0,
        discount: 0,
        paymentStatus: 'Paid',
        items: [
            { id: 'ITM-005', productId: 'GLV-006', productName: "Rev'It Striker 3", sku: 'REV-STR3-BLK-S', price: 16999, quantity: 1, total: 16999 },
        ],
        shippingAddress: { name: 'Sneha Reddy', line1: '12 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', postalCode: '500033', country: 'India', phone: '+91 9876543213' },
        billingAddress: { name: 'Sneha Reddy', line1: '12 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', postalCode: '500033', country: 'India', phone: '+91 9876543213' },
        notes: '',
        carrier: 'Delhivery',
        trackingNumber: 'DL123456789IN',
        createdAt: '2025-01-19T11:45:00',
        updatedAt: '2025-01-20T09:30:00',
    },
    {
        id: 'ORD-2025-005',
        customerId: 'CUST-005',
        customerName: 'Vikram Singh',
        customerEmail: 'vikram.singh@email.com',
        date: '2025-01-18',
        status: 'Delivered',
        total: 89999,
        subtotal: 85999,
        tax: 4000,
        shipping: 0,
        discount: 0,
        paymentStatus: 'Paid',
        items: [
            { id: 'ITM-006', productId: 'AGV-001', productName: 'AGV Pista GP RR', sku: 'AGV-PISTA-RED-M', price: 89999, quantity: 1, total: 89999 },
        ],
        shippingAddress: { name: 'Vikram Singh', line1: '56 Sector 17', city: 'Chandigarh', state: 'Chandigarh', postalCode: '160017', country: 'India', phone: '+91 9876543214' },
        billingAddress: { name: 'Vikram Singh', line1: '56 Sector 17', city: 'Chandigarh', state: 'Chandigarh', postalCode: '160017', country: 'India', phone: '+91 9876543214' },
        notes: '',
        carrier: 'BlueDart',
        trackingNumber: 'BD987654321IN',
        createdAt: '2025-01-18T16:00:00',
        updatedAt: '2025-01-19T15:00:00',
    },
];

// ============================================================
// Full Payments Data
// ============================================================
export const allPayments: Payment[] = [
    {
        id: 'PAY-2025-001',
        userId: 'CUST-001',
        username: 'rahul_sharma',
        contact: '+91 9876543210',
        address: '123 MG Road, Bangalore 560001',
        orderId: 'ORD-2025-001',
        itemsSummary: 'AGV K6 S (1)',
        orderDate: '2025-01-20',
        amountDue: 45999,
        amountReceived: 0,
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Pending',
        createdAt: '2025-01-20T10:30:00',
        updatedAt: '2025-01-20T10:30:00',
    },
    {
        id: 'PAY-2025-002',
        userId: 'CUST-002',
        username: 'priya_patel',
        contact: '+91 9876543211',
        address: '45 Linking Road, Mumbai 400050',
        orderId: 'ORD-2025-002',
        itemsSummary: 'SMX-1 Air v2 (1), Motul Oil (3)',
        orderDate: '2025-01-20',
        productReceivedDate: '2025-01-22',
        amountDue: 28500,
        amountReceived: 28500,
        receivedDate: '2025-01-20',
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        createdAt: '2025-01-20T09:15:00',
        updatedAt: '2025-01-20T09:20:00',
    },
    {
        id: 'PAY-2025-003',
        userId: 'CUST-003',
        username: 'amit_kumar',
        contact: '+91 9876543212',
        address: '78 Park Street, Delhi 110001',
        orderId: 'ORD-2025-003',
        itemsSummary: 'Shoei RF-1400 (1)',
        orderDate: '2025-01-19',
        amountDue: 67999,
        amountReceived: 67999,
        receivedDate: '2025-01-19',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        createdAt: '2025-01-19T14:20:00',
        updatedAt: '2025-01-19T14:25:00',
    },
    {
        id: 'PAY-2025-004',
        userId: 'CUST-004',
        username: 'sneha_reddy',
        contact: '+91 9876543213',
        address: '12 Jubilee Hills, Hyderabad 500033',
        orderId: 'ORD-2025-004',
        itemsSummary: "Rev'It Striker 3 (1)",
        orderDate: '2025-01-19',
        productReceivedDate: '2025-01-21',
        amountDue: 15999,
        amountReceived: 15999,
        receivedDate: '2025-01-19',
        paymentMethod: 'Debit Card',
        paymentStatus: 'Paid',
        createdAt: '2025-01-19T11:45:00',
        updatedAt: '2025-01-19T11:50:00',
    },
    {
        id: 'PAY-2025-005',
        userId: 'CUST-005',
        username: 'vikram_singh',
        contact: '+91 9876543214',
        address: '56 Sector 17, Chandigarh 160017',
        orderId: 'ORD-2025-005',
        itemsSummary: 'AGV Pista GP RR (1)',
        orderDate: '2025-01-18',
        productReceivedDate: '2025-01-19',
        amountDue: 89999,
        amountReceived: 44999,
        receivedDate: '2025-01-18',
        paymentMethod: 'Online',
        paymentStatus: 'Partial',
        createdAt: '2025-01-18T16:00:00',
        updatedAt: '2025-01-18T16:10:00',
    },
    {
        id: 'PAY-2025-006',
        userId: 'CUST-006',
        username: 'deepa_nair',
        contact: '+91 9876543215',
        address: '34 MG Road, Kochi 682001',
        orderId: 'ORD-2025-006',
        itemsSummary: 'Dainese Racing 4 (1)',
        orderDate: '2025-01-17',
        amountDue: 125999,
        amountReceived: 125999,
        receivedDate: '2025-01-17',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Refunded',
        createdAt: '2025-01-17T10:00:00',
        updatedAt: '2025-01-19T14:00:00',
    },
];

// ============================================================
// Customers Data
// ============================================================
export const allCustomers: Customer[] = [
    {
        id: 'CUST-001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91 9876543210',
        ordersCount: 5,
        lifetimeValue: 198500,
        vehicles: [
            { id: 'VH-001', make: 'KTM', model: 'Duke 390', year: 2023, registrationNumber: 'KA-01-AB-1234' },
        ],
        addresses: [
            { name: 'Rahul Sharma', line1: '123 MG Road', line2: 'Apt 5B', city: 'Bangalore', state: 'Karnataka', postalCode: '560001', country: 'India', phone: '+91 9876543210' },
        ],
        createdAt: '2024-06-15',
        lastOrderDate: '2025-01-20',
    },
    {
        id: 'CUST-002',
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 9876543211',
        ordersCount: 3,
        lifetimeValue: 87500,
        vehicles: [
            { id: 'VH-002', make: 'Kawasaki', model: 'Ninja 650', year: 2022, registrationNumber: 'MH-02-CD-5678' },
        ],
        addresses: [
            { name: 'Priya Patel', line1: '45 Linking Road', city: 'Mumbai', state: 'Maharashtra', postalCode: '400050', country: 'India', phone: '+91 9876543211' },
        ],
        createdAt: '2024-08-20',
        lastOrderDate: '2025-01-20',
    },
    {
        id: 'CUST-003',
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        phone: '+91 9876543212',
        ordersCount: 8,
        lifetimeValue: 345000,
        vehicles: [
            { id: 'VH-003', make: 'Honda', model: 'CBR 650R', year: 2024, registrationNumber: 'DL-03-EF-9012' },
            { id: 'VH-004', make: 'Royal Enfield', model: 'Continental GT 650', year: 2023, registrationNumber: 'DL-03-GH-3456' },
        ],
        addresses: [
            { name: 'Amit Kumar', line1: '78 Park Street', city: 'Delhi', state: 'Delhi', postalCode: '110001', country: 'India', phone: '+91 9876543212' },
        ],
        createdAt: '2024-03-10',
        lastOrderDate: '2025-01-19',
    },
    {
        id: 'CUST-004',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@email.com',
        phone: '+91 9876543213',
        ordersCount: 2,
        lifetimeValue: 42000,
        vehicles: [
            { id: 'VH-005', make: 'Yamaha', model: 'R15 V4', year: 2023, registrationNumber: 'TS-04-IJ-7890' },
        ],
        addresses: [
            { name: 'Sneha Reddy', line1: '12 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', postalCode: '500033', country: 'India', phone: '+91 9876543213' },
        ],
        createdAt: '2024-11-05',
        lastOrderDate: '2025-01-19',
    },
    {
        id: 'CUST-005',
        name: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        phone: '+91 9876543214',
        ordersCount: 12,
        lifetimeValue: 567000,
        vehicles: [
            { id: 'VH-006', make: 'Ducati', model: 'Panigale V4', year: 2024, registrationNumber: 'CH-05-KL-1234' },
            { id: 'VH-007', make: 'BMW', model: 'S1000RR', year: 2023, registrationNumber: 'CH-05-MN-5678' },
        ],
        addresses: [
            { name: 'Vikram Singh', line1: '56 Sector 17', city: 'Chandigarh', state: 'Chandigarh', postalCode: '160017', country: 'India', phone: '+91 9876543214' },
        ],
        createdAt: '2023-12-01',
        lastOrderDate: '2025-01-18',
    },
];

// ============================================================
// Inventory Data
// ============================================================
export const inventoryItems: InventoryItem[] = [
    { id: 'INV-001', productId: 'AGV-001', productName: 'AGV Pista GP RR', sku: 'AGV-PISTA-001', category: 'Helmets', currentStock: 2, reorderPoint: 5, maxStock: 20, supplierId: 'SUP-001', supplierName: 'AGV India' },
    { id: 'INV-002', productId: 'AGV-002', productName: 'AGV K6 S', sku: 'AGV-K6S-002', category: 'Helmets', currentStock: 15, reorderPoint: 10, maxStock: 30, supplierId: 'SUP-001', supplierName: 'AGV India' },
    { id: 'INV-003', productId: 'SHOEI-001', productName: 'Shoei X-Fourteen', sku: 'SHOEI-X14-001', category: 'Helmets', currentStock: 8, reorderPoint: 5, maxStock: 15, supplierId: 'SUP-002', supplierName: 'Shoei Asia' },
    { id: 'INV-004', productId: 'DAI-001', productName: 'Dainese Racing 4', sku: 'DAI-R4-001', category: 'Riding Jackets', currentStock: 12, reorderPoint: 8, maxStock: 25, supplierId: 'SUP-003', supplierName: 'Dainese India' },
    { id: 'INV-005', productId: 'DAI-002', productName: 'Dainese Super Speed Tex', sku: 'DAI-SST-002', category: 'Riding Jackets', currentStock: 3, reorderPoint: 5, maxStock: 20, supplierId: 'SUP-003', supplierName: 'Dainese India' },
    { id: 'INV-006', productId: 'GLV-001', productName: 'Alpinestars GP Pro R3', sku: 'ALP-GPR3-001', category: 'Riding Gloves', currentStock: 20, reorderPoint: 10, maxStock: 40, supplierId: 'SUP-004', supplierName: 'Alpinestars India' },
    { id: 'INV-007', productId: 'BOOT-001', productName: 'Alpinestars Supertech R', sku: 'ALP-STR-001', category: 'Riding Boots', currentStock: 6, reorderPoint: 5, maxStock: 15, supplierId: 'SUP-004', supplierName: 'Alpinestars India' },
    { id: 'INV-008', productId: 'ACC-001', productName: 'Philips LED Headlight Kit', sku: 'PHI-LED-001', category: 'Accessories', currentStock: 45, reorderPoint: 20, maxStock: 100, supplierId: 'SUP-005', supplierName: 'Philips Automotive' },
];

// ============================================================
// Suppliers Data
// ============================================================
export const allSuppliers: Supplier[] = [
    {
        id: 'SUP-001',
        name: 'AGV India',
        contactPerson: 'Ramesh Kumar',
        email: 'ramesh@agvindia.com',
        phone: '+91 9800011111',
        address: { line1: 'Plot 45, Industrial Area', city: 'Gurgaon', state: 'Haryana', postalCode: '122001', country: 'India' },
        categories: ['Helmets'],
        productCodes: ['AGV-*'],
        products: [
            { productId: 'AGV-001', productName: 'AGV Pista GP RR', sku: 'AGV-PISTA-001', costPrice: 72000 },
            { productId: 'AGV-002', productName: 'AGV K6 S', sku: 'AGV-K6S-002', costPrice: 37000 },
        ],
        leadTimeDays: 14,
        minimumOrderQuantity: 5,
        rating: 4.8,
        paymentTerms: 'Net 30',
        status: 'Active',
    },
    {
        id: 'SUP-002',
        name: 'Shoei Asia',
        contactPerson: 'Takeshi Yamamoto',
        email: 'takeshi@shoeiasia.com',
        phone: '+91 9800022222',
        address: { line1: 'Tower A, Business Bay', line2: 'Floor 15', city: 'Mumbai', state: 'Maharashtra', postalCode: '400013', country: 'India' },
        categories: ['Helmets'],
        productCodes: ['SHOEI-*'],
        products: [
            { productId: 'SHOEI-001', productName: 'Shoei X-Fourteen', sku: 'SHOEI-X14-001', costPrice: 55000 },
            { productId: 'SHOEI-002', productName: 'Shoei RF-1400', sku: 'SHOEI-RF14-001', costPrice: 52000 },
        ],
        leadTimeDays: 21,
        minimumOrderQuantity: 3,
        rating: 4.9,
        paymentTerms: 'Net 45',
        notes: 'Premium partner - direct import from Japan',
        status: 'Active',
    },
    {
        id: 'SUP-003',
        name: 'Dainese India',
        contactPerson: 'Marco Rossi',
        email: 'marco@dainese.in',
        phone: '+91 9800033333',
        address: { line1: 'Unit 12, Export Zone', city: 'Chennai', state: 'Tamil Nadu', postalCode: '600032', country: 'India' },
        categories: ['Riding Jackets', 'Riding Gloves', 'Riding Boots'],
        productCodes: ['DAI-*'],
        products: [
            { productId: 'DAI-001', productName: 'Dainese Racing 4', sku: 'DAI-R4-001', costPrice: 98000 },
            { productId: 'DAI-002', productName: 'Dainese Super Speed Tex', sku: 'DAI-SST-002', costPrice: 63000 },
        ],
        leadTimeDays: 18,
        minimumOrderQuantity: 5,
        rating: 4.6,
        paymentTerms: 'Net 30',
        status: 'Active',
    },
    {
        id: 'SUP-004',
        name: 'Alpinestars India',
        contactPerson: 'Alex Martinez',
        email: 'alex@alpinestars.in',
        phone: '+91 9800044444',
        address: { line1: 'Block C, Auto Hub', city: 'Pune', state: 'Maharashtra', postalCode: '411057', country: 'India' },
        categories: ['Riding Gloves', 'Riding Boots', 'Riding Jackets'],
        productCodes: ['ALP-*', 'GLV-*', 'BOOT-*'],
        products: [
            { productId: 'GLV-001', productName: 'Alpinestars GP Pro R3', sku: 'ALP-GPR3-001', costPrice: 18000 },
            { productId: 'BOOT-001', productName: 'Alpinestars Supertech R', sku: 'ALP-STR-001', costPrice: 54000 },
        ],
        leadTimeDays: 12,
        minimumOrderQuantity: 10,
        rating: 4.7,
        paymentTerms: 'Net 15',
        status: 'Active',
    },
    {
        id: 'SUP-005',
        name: 'Philips Automotive',
        contactPerson: 'Suresh Menon',
        email: 'suresh@philips.com',
        phone: '+91 9800055555',
        address: { line1: 'Philips Tower', line2: 'Electronic City Phase 2', city: 'Bangalore', state: 'Karnataka', postalCode: '560100', country: 'India' },
        categories: ['Accessories', 'Lighting'],
        productCodes: ['PHI-*', 'ACC-*'],
        products: [
            { productId: 'ACC-001', productName: 'Philips LED Headlight Kit', sku: 'PHI-LED-001', costPrice: 4500 },
        ],
        leadTimeDays: 7,
        minimumOrderQuantity: 20,
        rating: 4.5,
        paymentTerms: 'Net 30',
        notes: 'Bulk discount available for orders > 100 units',
        status: 'Active',
    },
];

// ============================================================
// Purchase Orders
// ============================================================
export const purchaseOrders: PurchaseOrder[] = [
    {
        id: 'PO-2025-001',
        supplierId: 'SUP-001',
        supplierName: 'AGV India',
        items: [
            { productId: 'AGV-001', productName: 'AGV Pista GP RR', sku: 'AGV-PISTA-001', quantity: 10, unitPrice: 72000, total: 720000 },
            { productId: 'AGV-002', productName: 'AGV K6 S', sku: 'AGV-K6S-002', quantity: 15, unitPrice: 37000, total: 555000 },
        ],
        status: 'Sent',
        totalAmount: 1275000,
        createdAt: '2025-01-15',
        expectedDelivery: '2025-01-29',
    },
    {
        id: 'PO-2025-002',
        supplierId: 'SUP-003',
        supplierName: 'Dainese India',
        items: [
            { productId: 'DAI-002', productName: 'Dainese Super Speed Tex', sku: 'DAI-SST-002', quantity: 10, unitPrice: 63000, total: 630000 },
        ],
        status: 'Confirmed',
        totalAmount: 630000,
        createdAt: '2025-01-18',
        expectedDelivery: '2025-02-05',
    },
];

// ============================================================
// Admin Users
// ============================================================
export const adminUsers: AdminUser[] = [
    {
        id: 'ADM-001',
        name: 'Arun Krishnan',
        email: 'arun@blackpiston.com',
        role: 'SuperAdmin',
        permissions: [
            { module: 'dashboard', actions: ['view'] },
            { module: 'products', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'payments', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'customers', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
        ],
        twoFactorEnabled: true,
        lastLogin: '2025-01-20T09:00:00',
        status: 'Active',
        createdAt: '2024-01-01',
    },
    {
        id: 'ADM-002',
        name: 'Meera Shah',
        email: 'meera@blackpiston.com',
        role: 'ProductManager',
        permissions: [
            { module: 'dashboard', actions: ['view'] },
            { module: 'products', actions: ['view', 'create', 'edit'] },
            { module: 'inventory', actions: ['view', 'edit'] },
        ],
        twoFactorEnabled: true,
        lastLogin: '2025-01-20T08:30:00',
        status: 'Active',
        createdAt: '2024-03-15',
    },
    {
        id: 'ADM-003',
        name: 'Rajesh Iyer',
        email: 'rajesh@blackpiston.com',
        role: 'OrderManager',
        permissions: [
            { module: 'dashboard', actions: ['view'] },
            { module: 'orders', actions: ['view', 'edit'] },
            { module: 'customers', actions: ['view'] },
            { module: 'payments', actions: ['view'] },
        ],
        twoFactorEnabled: false,
        lastLogin: '2025-01-19T17:45:00',
        status: 'Active',
        createdAt: '2024-06-01',
    },
    {
        id: 'ADM-004',
        name: 'Sunita Gupta',
        email: 'sunita@blackpiston.com',
        role: 'Accountant',
        permissions: [
            { module: 'dashboard', actions: ['view'] },
            { module: 'payments', actions: ['view', 'edit'] },
            { module: 'orders', actions: ['view'] },
        ],
        twoFactorEnabled: true,
        lastLogin: '2025-01-20T10:00:00',
        status: 'Active',
        createdAt: '2024-04-10',
    },
    {
        id: 'ADM-005',
        name: 'Vinod Kumar',
        email: 'vinod@blackpiston.com',
        role: 'ServiceManager',
        permissions: [
            { module: 'dashboard', actions: ['view'] },
            { module: 'bookings', actions: ['view', 'create', 'edit'] },
            { module: 'customers', actions: ['view'] },
        ],
        twoFactorEnabled: false,
        lastLogin: '2025-01-20T07:00:00',
        status: 'Active',
        createdAt: '2024-08-20',
    },
];

// ============================================================
// RMA / Returns
// ============================================================
export const allRMAs: RMA[] = [
    {
        id: 'RMA-2025-001',
        orderId: 'ORD-2025-006',
        customerId: 'CUST-006',
        customerName: 'Deepa Nair',
        reason: 'Size does not fit properly',
        items: [
            { productId: 'DAI-001', productName: 'Dainese Racing 4', sku: 'DAI-R4-001', quantity: 1, reason: 'Wrong size ordered' },
        ],
        status: 'Approved',
        resolution: 'Replace',
        createdAt: '2025-01-18',
        updatedAt: '2025-01-19',
    },
    {
        id: 'RMA-2025-002',
        orderId: 'ORD-2024-145',
        customerId: 'CUST-008',
        customerName: 'Karthik Rajan',
        reason: 'Product damaged during shipping',
        items: [
            { productId: 'SHOEI-002', productName: 'Shoei RF-1400', sku: 'SHOEI-RF14-001', quantity: 1, reason: 'Visor cracked on arrival' },
        ],
        status: 'Received',
        resolution: 'Refund',
        refundAmount: 67999,
        createdAt: '2025-01-16',
        updatedAt: '2025-01-19',
    },
    {
        id: 'RMA-2025-003',
        orderId: 'ORD-2024-156',
        customerId: 'CUST-010',
        customerName: 'Ananya Sharma',
        reason: 'Changed mind',
        items: [
            { productId: 'GLV-004', productName: 'Alpinestars SMX-1 Air v2', sku: 'ALP-SMX1-001', quantity: 1, reason: 'No longer needed' },
        ],
        status: 'Requested',
        createdAt: '2025-01-20',
        updatedAt: '2025-01-20',
    },
];

// ============================================================
// Service Bookings
// ============================================================
export const serviceBookings: ServiceBooking[] = [
    {
        id: 'BK-2025-001',
        customerId: 'CUST-001',
        customerName: 'Arjun Mehta',
        customerPhone: '+91 9876545001',
        vehicleInfo: 'KTM Duke 390 (2023)',
        vehicleMake: 'KTM',
        vehicleModel: 'Duke 390',
        vehicleYear: 2023,
        serviceType: 'Full Service',
        services: ['Oil Change', 'Air Filter', 'Chain Lubrication', 'Brake Check', 'General Inspection'],
        date: '2025-01-20',
        timeSlot: '10:00 AM',
        status: 'Pending',
        assignedMechanic: 'Raju',
        estimatedCost: 4500,
        createdAt: '2025-01-18',
    },
    {
        id: 'BK-2025-002',
        customerId: 'CUST-002',
        customerName: 'Neha Gupta',
        customerPhone: '+91 9876545002',
        vehicleInfo: 'Kawasaki Ninja 650 (2022)',
        vehicleMake: 'Kawasaki',
        vehicleModel: 'Ninja 650',
        vehicleYear: 2022,
        serviceType: 'Oil Change',
        services: ['Oil Change', 'Oil Filter'],
        date: '2025-01-20',
        timeSlot: '11:30 AM',
        status: 'Confirmed',
        assignedMechanic: 'Suresh',
        estimatedCost: 2500,
        createdAt: '2025-01-17',
    },
    {
        id: 'BK-2025-003',
        customerId: 'CUST-003',
        customerName: 'Ravi Chopra',
        customerPhone: '+91 9876545003',
        vehicleInfo: 'Honda CBR 650R (2024)',
        vehicleMake: 'Honda',
        vehicleModel: 'CBR 650R',
        vehicleYear: 2024,
        serviceType: 'Brake Service',
        services: ['Brake Pad Replacement', 'Brake Fluid Change', 'Brake Line Inspection'],
        date: '2025-01-20',
        timeSlot: '02:00 PM',
        status: 'Pending',
        estimatedCost: 6500,
        createdAt: '2025-01-19',
    },
    {
        id: 'BK-2025-004',
        customerId: 'CUST-004',
        customerName: 'Kavitha Nair',
        customerPhone: '+91 9876545004',
        vehicleInfo: 'Royal Enfield Himalayan 450 (2024)',
        vehicleMake: 'Royal Enfield',
        vehicleModel: 'Himalayan 450',
        vehicleYear: 2024,
        serviceType: 'Chain & Sprocket',
        services: ['Chain Replacement', 'Sprocket Replacement', 'Chain Alignment'],
        date: '2025-01-20',
        timeSlot: '03:30 PM',
        status: 'Confirmed',
        assignedMechanic: 'Mohan',
        estimatedCost: 8500,
        createdAt: '2025-01-16',
    },
    {
        id: 'BK-2025-005',
        customerId: 'CUST-005',
        customerName: 'Rohit Verma',
        customerPhone: '+91 9876545005',
        vehicleInfo: 'Bajaj Pulsar RS 200 (2021)',
        vehicleMake: 'Bajaj',
        vehicleModel: 'Pulsar RS 200',
        vehicleYear: 2021,
        serviceType: 'Full Service',
        services: ['Oil Change', 'Air Filter', 'Spark Plug', 'Chain Lubrication', 'Brake Check'],
        date: '2025-01-20',
        timeSlot: '05:00 PM',
        status: 'Pending',
        estimatedCost: 3500,
        createdAt: '2025-01-19',
    },
];

// ============================================================
// Job Cards
// ============================================================
export const jobCards: JobCard[] = [
    {
        id: 'JC-2025-001',
        bookingId: 'BK-2025-002',
        customerId: 'CUST-002',
        customerName: 'Neha Gupta',
        vehicleInfo: 'Kawasaki Ninja 650 (2022)',
        assignedMechanic: 'Suresh',
        services: [
            { name: 'Oil Change', description: 'Replace engine oil with Motul 10W-40', price: 1800, completed: true },
            { name: 'Oil Filter', description: 'Replace oil filter', price: 700, completed: false },
        ],
        partsUsed: [
            { productId: 'ACC-007', productName: 'Motul Synthetic Oil 10W-40', sku: 'MOT-SYN-1L', quantity: 4, unitPrice: 750, total: 3000 },
        ],
        laborHours: 1,
        laborCost: 500,
        partsCost: 3000,
        totalCost: 3500,
        status: 'In Progress',
        startedAt: '2025-01-20T11:30:00',
        createdAt: '2025-01-20T11:00:00',
    },
];

// ============================================================
// Audit Logs
// ============================================================
export const auditLogs: AuditLog[] = [
    { id: 'LOG-001', userId: 'ADM-001', userName: 'Arun Krishnan', action: 'update', entity: 'Order', entityId: 'ORD-2025-003', changes: { status: { from: 'Confirmed', to: 'Packed' } }, timestamp: '2025-01-20T08:00:00' },
    { id: 'LOG-002', userId: 'ADM-002', userName: 'Meera Shah', action: 'create', entity: 'Product', entityId: 'NEW-001', timestamp: '2025-01-20T07:45:00' },
    { id: 'LOG-003', userId: 'ADM-003', userName: 'Rajesh Iyer', action: 'update', entity: 'Order', entityId: 'ORD-2025-004', changes: { status: { from: 'Packed', to: 'Shipped' } }, timestamp: '2025-01-20T09:30:00' },
    { id: 'LOG-004', userId: 'ADM-004', userName: 'Sunita Gupta', action: 'update', entity: 'Payment', entityId: 'PAY-2025-005', changes: { amountReceived: { from: 0, to: 44999 } }, timestamp: '2025-01-18T16:10:00' },
    { id: 'LOG-005', userId: 'ADM-001', userName: 'Arun Krishnan', action: 'approve', entity: 'RMA', entityId: 'RMA-2025-001', timestamp: '2025-01-19T14:00:00' },
];

// ============================================================
// Support Tickets
// ============================================================
export const supportTickets: SupportTicket[] = [
    {
        id: 'TKT-2025-001',
        customerId: 'CUST-003',
        customerName: 'Amit Kumar',
        customerEmail: 'amit.kumar@email.com',
        subject: 'Delayed delivery for order ORD-2025-003',
        description: 'My order was supposed to arrive on 20th but tracking shows no movement since yesterday.',
        status: 'Open',
        priority: 'High',
        category: 'Shipping',
        orderId: 'ORD-2025-003',
        messages: [
            { id: 'MSG-001', sender: 'Amit Kumar', senderType: 'Customer', message: 'My order was supposed to arrive on 20th but tracking shows no movement since yesterday.', timestamp: '2025-01-20T10:00:00' },
        ],
        createdAt: '2025-01-20T10:00:00',
        updatedAt: '2025-01-20T10:00:00',
    },
    {
        id: 'TKT-2025-002',
        customerId: 'CUST-005',
        customerName: 'Vikram Singh',
        customerEmail: 'vikram.singh@email.com',
        subject: 'Request for invoice copy',
        description: 'I need a GST invoice copy for my recent order.',
        status: 'Resolved',
        priority: 'Low',
        category: 'Billing',
        orderId: 'ORD-2025-005',
        assignedTo: 'Sunita Gupta',
        messages: [
            { id: 'MSG-002', sender: 'Vikram Singh', senderType: 'Customer', message: 'I need a GST invoice copy for my recent order.', timestamp: '2025-01-19T11:00:00' },
            { id: 'MSG-003', sender: 'Sunita Gupta', senderType: 'Admin', message: 'Hi Vikram, I have attached the GST invoice to this ticket. Please let me know if you need anything else.', timestamp: '2025-01-19T11:30:00' },
        ],
        createdAt: '2025-01-19T11:00:00',
        updatedAt: '2025-01-19T11:30:00',
        resolvedAt: '2025-01-19T11:30:00',
    },
];

// ============================================================
// Chart Data for Reports
// ============================================================
export const salesByCategory = [
    { name: 'Helmets', value: 450000 },
    { name: 'Riding Jackets', value: 320000 },
    { name: 'Riding Gloves', value: 180000 },
    { name: 'Riding Boots', value: 220000 },
    { name: 'Accessories', value: 80000 },
];

export const salesByMonth = [
    { month: 'Jul', revenue: 95000 },
    { month: 'Aug', revenue: 120000 },
    { month: 'Sep', revenue: 145000 },
    { month: 'Oct', revenue: 175000 },
    { month: 'Nov', revenue: 210000 },
    { month: 'Dec', revenue: 280000 },
    { month: 'Jan', revenue: 225000 },
];

export const topSellingProducts = [
    { name: 'AGV Pista GP RR', quantity: 24, revenue: 2159976 },
    { name: 'Shoei RF-1400', quantity: 18, revenue: 1223982 },
    { name: 'Dainese Racing 4', quantity: 12, revenue: 1511988 },
    { name: 'Alpinestars GP Plus R v3', quantity: 15, revenue: 1349985 },
    { name: 'Alpinestars Supertech R', quantity: 20, revenue: 1379980 },
];

// Order Status Options
export const orderStatusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'New', label: 'New' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Packed', label: 'Packed' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

// Payment Status Options
export const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
    { value: 'Paid', label: 'Paid' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Failed', label: 'Failed' },
];

// Payment Method Options
export const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
    { value: 'Online', label: 'Online' },
    { value: 'COD', label: 'Cash on Delivery' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
];

// Admin Role Options
export const adminRoleOptions: { value: AdminRole; label: string }[] = [
    { value: 'SuperAdmin', label: 'Super Admin' },
    { value: 'ProductManager', label: 'Product Manager' },
    { value: 'OrderManager', label: 'Order Manager' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'ServiceManager', label: 'Service Manager' },
    { value: 'Support', label: 'Support' },
];
