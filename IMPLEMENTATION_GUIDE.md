# 🛠️ BlackPiston Garage - Implementation Guide
## Step-by-Step Instructions for Critical Features

---

## 🎯 PHASE 1: PAYMENT INTEGRATION (Razorpay)

### Step 1: Setup Razorpay Account
1. Go to https://razorpay.com and create account
2. Get API keys from Dashboard → Settings → API Keys
3. Add to `.env`:
```bash
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Step 2: Install Dependencies
```bash
cd server
npm install razorpay
npm install --save-dev @types/razorpay
```

### Step 3: Create Razorpay Config
Create `server/src/config/razorpay.ts`:
```typescript
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

### Step 4: Create Payment Routes
Create `server/src/routes/payments.ts`:
```typescript
import { Router } from 'express';
import { razorpay } from '../config/razorpay.js';
import crypto from 'crypto';
import prisma from '../config/database.js';

const router = Router();

function authenticateToken(req: any, res: any, next: any) {
  // Copy from existing auth middleware
}

// Create Razorpay order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex');
    
    if (razorpay_signature === expectedSign) {
      // Update payment status
      await prisma.payment.update({
        where: { orderId },
        data: {
          paymentStatus: 'PAID',
          transactionId: razorpay_payment_id,
          receivedDate: new Date(),
        },
      });
      
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
        },
      });
      
      res.json({ success: true, message: 'Payment verified' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;
```

### Step 5: Register Payment Routes
In `server/src/index.ts`, add:
```typescript
import paymentRoutes from './routes/payments.js';
app.use('/api/payments', paymentRoutes);
```


### Step 6: Frontend Integration

Add Razorpay script to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Create `src/lib/razorpay.ts`:
```typescript
import { API } from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export async function initiateRazorpayPayment(
  amount: number,
  orderId: string,
  userDetails: { name: string; email: string; phone: string },
  onSuccess: () => void,
  onFailure: (error: any) => void
) {
  try {
    // Create Razorpay order
    const { data } = await API.post('/api/payments/create-order', { amount });
    
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'BlackPiston Garage',
      description: 'Order Payment',
      order_id: data.orderId,
      handler: async function (response: any) {
        try {
          // Verify payment
          const verifyRes = await API.post('/api/payments/verify', {
            ...response,
            orderId,
          });
          
          if (verifyRes.data.success) {
            onSuccess();
          } else {
            onFailure(new Error('Payment verification failed'));
          }
        } catch (error) {
          onFailure(error);
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: '#FF6B00',
      },
      modal: {
        ondismiss: function() {
          onFailure(new Error('Payment cancelled'));
        }
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    onFailure(error);
  }
}
```

### Step 7: Update Checkout Page

In `src/pages/Checkout.tsx`, modify the payment handling:

```typescript
import { initiateRazorpayPayment } from '@/lib/razorpay';

const handlePlaceOrder = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation...
  
  setIsProcessing(true);
  
  try {
    // 1. Verify stock
    const stockResult = await verifyStock(stockItems);
    if (!stockResult.available) {
      // Handle out of stock
      return;
    }
    
    // 2. Create order (with PENDING payment status)
    const orderData = {
      products: orderProducts,
      shippingAddress: {
        name: formData.fullName,
        phone: formData.phone,
        street: formData.addressLine,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code,
    };
    
    const orderResult = await placeOrder(orderData);
    
    // 3. If online payment, initiate Razorpay
    if (paymentMethod === 'ONLINE') {
      await initiateRazorpayPayment(
        orderResult.order.totalAmount,
        orderResult.order.id,
        {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        () => {
          // Payment successful
          clearCart();
          toast.success('Order placed successfully!');
          navigate(`/order-success/${orderResult.order.id}`);
        },
        (error) => {
          // Payment failed
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
        }
      );
    } else {
      // COD - order already created
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${orderResult.order.id}`);
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to place order');
  } finally {
    if (paymentMethod === 'COD') {
      setIsProcessing(false);
    }
  }
};
```

### Step 8: Test Payment Flow

1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev:client`
3. Add products to cart
4. Go to checkout
5. Fill address details
6. Select "Online Payment"
7. Click "Place Order"
8. Complete payment in Razorpay modal
9. Verify order status updated to CONFIRMED


---

## 📄 PHASE 2: INVOICE GENERATION

### Step 1: Update Prisma Schema

Add Invoice model to `prisma/schema.prisma`:

```prisma
model Invoice {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  invoiceNumber String   @unique
  orderId       String   @unique @db.ObjectId
  order         Order    @relation(fields: [orderId], references: [id])
  userId        String   @db.ObjectId
  user          User     @relation(fields: [userId], references: [id])
  pdfUrl        String
  amount        Float
  taxAmount     Float
  issuedAt      DateTime @default(now())
  
  @@map("invoices")
}

// Update Order model - add this line:
model Order {
  // ... existing fields
  invoice       Invoice?
}

// Update User model - add this line:
model User {
  // ... existing fields
  invoices      Invoice[]
}
```

Run migration:
```bash
npx prisma db push
npx prisma generate
```

### Step 2: Create Invoice Generator

Create `server/src/utils/invoiceGenerator.ts`:

```typescript
import jsPDF from 'jspdf';

interface InvoiceData {
  order: any;
  user: any;
}

export function generateInvoicePDF(data: InvoiceData): Buffer {
  const { order, user } = data;
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BlackPiston Garage', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Motorcycle Gear & Accessories', 20, 28);
  doc.text('GST: 29XXXXX1234X1ZX', 20, 34);
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 150, 20);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${order.orderNumber}`, 150, 28);
  doc.text(`Date: ${new Date(order.orderedAt).toLocaleDateString('en-IN')}`, 150, 34);
  
  // Customer Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(user.name, 20, 58);
  doc.text(user.email, 20, 64);
  doc.text(user.phone || '', 20, 70);
  
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    doc.text(addr.street || '', 20, 76);
    doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 20, 82);
  }
  
  // Table Header
  let yPos = 100;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, yPos);
  doc.text('Qty', 120, yPos);
  doc.text('Price', 145, yPos);
  doc.text('Total', 175, yPos);
  
  // Draw line
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  // Table Rows
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  
  order.products.forEach((item: any) => {
    doc.text(item.name.substring(0, 40), 20, yPos);
    doc.text(item.quantity.toString(), 120, yPos);
    doc.text(`₹${item.unitPrice.toFixed(2)}`, 145, yPos);
    doc.text(`₹${item.totalPrice.toFixed(2)}`, 175, yPos);
    yPos += 7;
  });
  
  // Draw line
  doc.line(20, yPos, 190, yPos);
  
  // Totals
  yPos += 10;
  doc.text('Subtotal:', 145, yPos);
  doc.text(`₹${order.subtotal.toFixed(2)}`, 175, yPos);
  
  yPos += 7;
  doc.text('Shipping:', 145, yPos);
  doc.text(`₹${order.shippingCost.toFixed(2)}`, 175, yPos);
  
  yPos += 7;
  doc.text('Tax (GST 18%):', 145, yPos);
  doc.text(`₹${order.taxAmount.toFixed(2)}`, 175, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', 145, yPos);
  doc.text(`₹${order.totalAmount.toFixed(2)}`, 175, yPos);
  
  // Payment Info
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${order.paymentMethod}`, 20, yPos);
  doc.text(`Payment Status: ${order.paymentStatus}`, 20, yPos + 7);
  
  // Footer
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 20, 280);
  doc.text('For support: support@blackpistongarage.com', 20, 285);
  
  return Buffer.from(doc.output('arraybuffer'));
}
```


### Step 3: Upload Invoice to Cloudinary

Create `server/src/utils/invoiceService.ts`:

```typescript
import cloudinary from '../config/cloudinary.js';
import { generateInvoicePDF } from './invoiceGenerator.js';
import prisma from '../config/database.js';

export async function createAndUploadInvoice(orderId: string): Promise<string> {
  // Fetch order with user details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Generate PDF
  const pdfBuffer = generateInvoicePDF({ order, user: order.user });
  
  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'blackpiston/invoices',
        resource_type: 'raw',
        public_id: `invoice_${order.orderNumber}`,
        format: 'pdf',
      },
      (error, result) => {
        if (error) {
          console.error('Invoice upload error:', error);
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    
    uploadStream.end(pdfBuffer);
  });
}

export async function generateInvoiceForOrder(orderId: string) {
  try {
    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId },
    });
    
    if (existingInvoice) {
      return existingInvoice;
    }
    
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Upload invoice PDF
    const pdfUrl = await createAndUploadInvoice(orderId);
    
    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${order.orderNumber}`,
        orderId: order.id,
        userId: order.userId,
        pdfUrl,
        amount: order.totalAmount,
        taxAmount: order.taxAmount,
      },
    });
    
    return invoice;
  } catch (error) {
    console.error('Generate invoice error:', error);
    throw error;
  }
}
```

### Step 4: Integrate into Order Creation

Update `server/src/routes/orders.ts`:

```typescript
import { generateInvoiceForOrder } from '../utils/invoiceService.js';
import { sendOrderConfirmation } from '../utils/emailService.js';

// In the order creation endpoint, after order is created:
router.post('/', authenticateToken, async (req, res) => {
  try {
    // ... existing order creation logic
    
    // After order is created successfully:
    const order = await prisma.order.create({ /* ... */ });
    
    // Generate invoice (async, don't wait)
    generateInvoiceForOrder(order.id)
      .then(invoice => {
        // Send email with invoice
        return sendOrderConfirmation(
          user.email,
          user.name,
          order.orderNumber,
          invoice.pdfUrl
        );
      })
      .catch(err => console.error('Invoice generation failed:', err));
    
    res.json({ order });
  } catch (error) {
    // ... error handling
  }
});
```

### Step 5: Add Download Invoice Endpoint

```typescript
// server/src/routes/orders.ts
router.get('/:orderId/invoice', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).userId;
    
    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get or generate invoice
    let invoice = await prisma.invoice.findUnique({
      where: { orderId },
    });
    
    if (!invoice) {
      invoice = await generateInvoiceForOrder(orderId);
    }
    
    res.json({ invoiceUrl: invoice.pdfUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});
```

### Step 6: Frontend - Download Invoice Button

In `src/pages/user/ProfileOrders.tsx`:

```typescript
const handleDownloadInvoice = async (orderId: string) => {
  try {
    const response = await API.get(`/api/orders/${orderId}/invoice`);
    window.open(response.data.invoiceUrl, '_blank');
  } catch (error) {
    toast.error('Failed to download invoice');
  }
};

// In the order list:
<Button 
  variant="outline" 
  size="sm"
  onClick={() => handleDownloadInvoice(order.id)}
>
  Download Invoice
</Button>
```


---

## 🔒 PHASE 3: SECURITY IMPROVEMENTS

### Step 1: Add Input Validation

Install Zod:
```bash
cd server
npm install zod
```

Create `server/src/validators/order.validator.ts`:

```typescript
import { z } from 'zod';

export const createOrderSchema = z.object({
  products: z.array(z.object({
    productId: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().min(1).max(100),
    unitPrice: z.number().min(0),
  })).min(1),
  shippingAddress: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[0-9]{10}$/),
    street: z.string().min(5).max(200),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    pincode: z.string().regex(/^[0-9]{6}$/),
  }),
  paymentMethod: z.enum(['COD', 'ONLINE', 'UPI', 'CARD']),
  couponCode: z.string().optional(),
});
```

Create validation middleware `server/src/middleware/validation.ts`:

```typescript
import { z } from 'zod';
import { Request, Response } from 'express';

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: Function) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
```

Apply to routes:

```typescript
import { validate } from '../middleware/validation.js';
import { createOrderSchema } from '../validators/order.validator.js';

router.post('/', authenticateToken, validate(createOrderSchema), async (req, res) => {
  // ... handler
});
```

### Step 2: Add Rate Limiting

Install:
```bash
npm install express-rate-limit
```

Create `server/src/middleware/rateLimit.ts`:

```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour
  message: 'Too many orders, please try again later',
});
```

Apply in `server/src/index.ts`:

```typescript
import { apiLimiter, authLimiter, orderLimiter } from './middleware/rateLimit.js';

// Apply to all API routes
app.use('/api/', apiLimiter);

// Apply to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Apply to order creation
app.use('/api/orders', orderLimiter);
```

### Step 3: Add Security Headers

Install Helmet:
```bash
npm install helmet
```

In `server/src/index.ts`:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

### Step 4: Improve CORS Configuration

```typescript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL!]
  : ['http://localhost:5173', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```


---

## 🧹 PHASE 4: CLEANUP & OPTIMIZATION

### Step 1: Remove Unused Features

**Delete these files:**

```bash
# Frontend
rm src/pages/Garage.tsx
rm src/pages/Build.tsx
rm src/pages/Blog.tsx

# Backend
rm server/src/routes/blog.ts
rm server/src/routes/services.ts
rm server/src/routes/builds.ts

# Admin pages
rm src/pages/admin/AdminBlog.tsx
rm src/pages/admin/AdminServices.tsx
rm src/pages/admin/AdminBuilds.tsx
rm src/pages/admin/AdminAppointments.tsx
```

**Update App.tsx** - Remove these routes:

```typescript
// Remove these lines:
<Route path="/garage" element={<Garage />} />
<Route path="/build" element={<Build />} />
<Route path="/blog" element={<Blog />} />
```

**Update server/src/index.ts** - Remove these routes:

```typescript
// Remove these lines:
import blogRoutes from './routes/blog.js';
import serviceRoutes from './routes/services.js';
import buildRoutes from './routes/builds.js';

app.use('/api/admin/blog', blogRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/builds', buildRoutes);
```

**Update Prisma Schema** - Remove these models:

```prisma
// Remove these models from prisma/schema.prisma:
model Blog { ... }
model Service { ... }
model Build { ... }
model ServiceBooking { ... }
model Supplier { ... }
model PurchaseOrder { ... }
model Request { ... }
```

Run migration:
```bash
npx prisma db push
npx prisma generate
```

### Step 2: Add Error Boundaries

Create `src/components/ErrorBoundary.tsx`:

```typescript
import { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

Wrap app in `src/App.tsx`:

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            <UserAuthProvider>
              <AdminAuthProvider>
                <ErrorBoundary>
                  <Routes>
                    {/* ... routes */}
                  </Routes>
                </ErrorBoundary>
              </AdminAuthProvider>
            </UserAuthProvider>
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
```

### Step 3: Add Loading Component

Create `src/components/Loader.tsx`:

```typescript
import { Loader2 } from 'lucide-react';

export function Loader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
```

Use in pages:

```typescript
import { Loader } from '@/components/Loader';

if (loading) return <Loader message="Loading products..." />;
```

### Step 4: Optimize Images

Create `src/lib/cloudinary.ts`:

```typescript
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const { width = 800, height, quality = 80 } = options;
  
  // Extract public_id
  const match = url.match(/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  if (!match) return url;
  
  const publicId = match[1];
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dp890nvg2';
  
  const transformations = [
    `f_auto`,
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    'c_fill',
  ].filter(Boolean).join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}
```

Use in components:

```typescript
import { getOptimizedImageUrl } from '@/lib/cloudinary';

<img 
  src={getOptimizedImageUrl(product.image, { width: 400 })}
  alt={product.name}
  loading="lazy"
/>
```


---

## 🚀 PHASE 5: DEPLOYMENT

### Step 1: Environment Variables

Create `.env.production` for backend:

```bash
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/blackpiston

# JWT
JWT_SECRET=<generate-strong-secret-256-bit>
JWT_REFRESH_SECRET=<generate-different-secret>
JWT_EXPIRES_IN=15m

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Razorpay (LIVE keys)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# Email
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=...
EMAIL_FROM=noreply@blackpistongarage.com

# Frontend
FRONTEND_URL=https://blackpistongarage.com

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Create `.env.production` for frontend:

```bash
VITE_API_URL=https://api.blackpistongarage.com/api
VITE_API_BASE_URL=https://api.blackpistongarage.com
VITE_GOOGLE_CLIENT_ID=...
VITE_RAZORPAY_KEY_ID=rzp_live_...
VITE_CLOUDINARY_CLOUD_NAME=your_cloud
```

### Step 2: Build Commands

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
npm run build
# Output in dist/ folder
```

### Step 3: Deploy to Vercel (Frontend)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Step 4: Deploy to Railway (Backend)

1. Go to https://railway.app
2. Create new project
3. Connect GitHub repo
4. Set root directory to `server/`
5. Add environment variables
6. Deploy

### Step 5: Post-Deployment Checklist

- [ ] Test payment flow with real Razorpay account
- [ ] Verify email notifications working
- [ ] Test order creation end-to-end
- [ ] Check invoice generation
- [ ] Verify image uploads to Cloudinary
- [ ] Test admin panel access
- [ ] Check mobile responsiveness
- [ ] Test all API endpoints
- [ ] Monitor error logs
- [ ] Set up database backups

---

## ✅ FINAL VERIFICATION

### Test Complete User Flow:

1. **Browse Products**
   - Visit homepage
   - Navigate to shop
   - Filter by category
   - Search products

2. **Add to Cart**
   - Select product
   - Choose variant (if applicable)
   - Add to cart
   - View cart

3. **Checkout**
   - Go to checkout
   - Fill shipping address
   - Apply coupon (optional)
   - Select payment method

4. **Payment**
   - Complete Razorpay payment
   - Verify payment success
   - Check order confirmation email

5. **Order Management**
   - View order in profile
   - Download invoice
   - Track order status

6. **Admin Operations**
   - Login to admin panel
   - View new order
   - Update order status
   - Add tracking info

---

## 🎉 CONGRATULATIONS!

Your BlackPiston Garage e-commerce platform is now production-ready with:

✅ Complete payment integration (Razorpay)  
✅ Automated invoice generation  
✅ Secure authentication & authorization  
✅ Input validation & rate limiting  
✅ Error handling & monitoring  
✅ Optimized performance  
✅ Clean, maintainable codebase  

**Next Steps:**
1. Monitor user feedback
2. Fix bugs as they arise
3. Add features based on demand
4. Scale infrastructure as needed

Good luck with your launch! 🏍️

