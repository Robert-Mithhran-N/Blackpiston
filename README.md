# BlackPiston Garage

A premium motorcycle gear and accessories e-commerce platform built with React, TypeScript, Tailwind CSS, and Node.js with MongoDB backend.

## 🏍️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Router** - Navigation
- **TanStack Query** - Data fetching

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma ORM** - Database ORM
- **MongoDB Atlas** - Database
- **Cloudinary** - Image storage
- **JWT** - Authentication

## 📂 Project Structure

```
blackpiston-garage/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── context/            # React contexts
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   └── data/               # Mock data
├── server/                 # Backend source
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration
│   │   └── index.ts        # Server entry
│   └── package.json
├── prisma/                 # Database schema
│   └── schema.prisma
├── database/               # DB documentation
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Environment Setup

1. **Clone the repository**
   ```bash
   cd blackpiston-garage
   ```

2. **Create environment file**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```
   DATABASE_URL="mongodb+srv://..."
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   JWT_SECRET="your_secret"
   ```

### Frontend Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:8081`

### Backend Setup

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

Backend API will be available at: `http://localhost:3001`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/all` - Get all categories
- `GET /api/products/featured/list` - Get featured products
- `GET /api/products/offers/top` - Get top offers

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/:id/cancel` - Cancel order

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images

## 🗄️ Database

The project uses **MongoDB** with **Prisma ORM**. Schema includes:

- **Users** - Customer and admin accounts
- **Products** - All products with variants
- **ProductCategories** - Category navigation
- **Orders** - Customer orders
- **Payments** - Transaction records
- **TopOffers** - Featured discount products
- **Inventory** - Stock tracking
- **Reviews** - Product reviews
- **ServiceBookings** - Garage appointments
- **Settings** - Site configuration

### Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Push schema changes
npx prisma db push

# Seed database with sample data
npm run seed
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm run start` - Start production server
- `npm run seed` - Seed database

## 👤 Admin Access

After running the seed script:
- **Email:** admin@blackpiston.com
- **Password:** admin123

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request
