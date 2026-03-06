# BlackPiston Garage — Repository Audit Report

**Date**: 2026-02-26  
**Auditor**: Antigravity Agent  
**Project**: BlackPiston Garage E-Commerce Platform

---

## Architecture Overview

| Layer | Technology | Location |
|-------|-----------|----------|
| Frontend | Vite + React 18 + TypeScript + TailwindCSS + Shadcn/ui | `src/` |
| Backend | Express + TypeScript + Prisma ORM | `server/src/` |
| Database | MongoDB Atlas (via Prisma) | `prisma/schema.prisma` |
| Image Storage | Cloudinary (via multer-storage-cloudinary) | `server/src/config/cloudinary.ts` |
| Auth | Google OAuth + JWT + bcryptjs | `server/src/routes/auth.ts` |
| State | React Query (@tanstack/react-query) | `src/lib/api.ts` |

---

## Files Scanned

### Backend (`server/src/`)
| File | Size | Purpose | Status |
|------|------|---------|--------|
| `index.ts` | 3.2KB | Express server entry, route registration | ✅ OK |
| `config/database.ts` | 490B | Prisma client singleton | ✅ OK |
| `config/cloudinary.ts` | 2.9KB | Cloudinary config, upload/delete helpers | ⚠️ Issues |
| `routes/auth.ts` | 11.0KB | Register, login, Google OAuth, admin login | ✅ OK |
| `routes/admin.ts` | 24.5KB | Admin CRUD: products, categories, payments, users | ⚠️ Issues |
| `routes/products.ts` | 8.3KB | Public product listing, filtering, categories | ✅ OK |
| `routes/upload.ts` | 3.8KB | Image upload endpoints (single, multi, avatar, etc.) | ⚠️ Issues |
| `routes/orders.ts` | 11.3KB | Order CRUD and admin order management | ✅ OK |
| `routes/productTypes.ts` | 9.8KB | Product type CRUD, search, tag suggestions | ✅ OK |
| `seed.ts` | 8.1KB | Database seed script | ✅ OK |
| `seed-admin.ts` | 1.2KB | Admin user seeder | ✅ OK |

### Frontend (`src/`)
| File/Dir | Size | Purpose | Status |
|----------|------|---------|--------|
| `App.tsx` | 4.3KB | Root app with routing, providers | ✅ OK |
| `lib/api.ts` | 15.1KB | Centralized API client (all fetch calls) | ⚠️ Minor |
| `context/AdminAuthContext.tsx` | 3.6KB | Admin auth state management | 🔴 Critical |
| `context/UserAuthContext.tsx` | 3.9KB | User auth state management | ✅ OK |
| `data/userMockData.ts` | 12.9KB | Mock products, categories, services, build kits | ⚠️ Partial use |
| `data/adminMockData.ts` | 20.5KB | Mock admin data | ⚠️ Unused |
| `pages/` (16 user + 16 admin) | ~350KB | All page components | ⚠️ Mixed |
| `components/` (64 files) | ~100KB | UI components | ✅ OK |

### Configuration
| File | Status | Notes |
|------|--------|-------|
| `.env.example` | ⚠️ | Missing `VITE_API_URL` |
| `src/.env` | ✅ | Has `VITE_API_URL=http://localhost:3001/api` |
| `prisma/schema.prisma` | ⚠️ | `ProductImage` missing `public_id` |
| `vite.config.ts` | ✅ | Port 5000, COOP headers set |
| `tailwind.config.ts` | ✅ | Custom brand tokens present |
| `package.json` (root) | ✅ | All deps present |
| `server/package.json` | ✅ | All deps present |

---

## Errors Found — Priority List

### 🔴 P0 — Critical (Blocking Production)

1. **Fake Admin Login in AdminAuthContext**  
   `src/context/AdminAuthContext.tsx:67-75` contains hardcoded `FAKE_ADMIN_JWT_TOKEN` in the `login()` function. Any call to `login()` bypasses real authentication entirely.

2. **No Auth on Upload Routes**  
   `server/src/routes/upload.ts` — All upload endpoints (`/image`, `/images`, `/avatar`, `/category`, `/banner`) have zero authentication middleware. Anyone can upload files to Cloudinary.

3. **Missing `public_id` in Prisma ProductImage Type**  
   `prisma/schema.prisma:153-157` — The `ProductImage` embedded type has `url`, `alt`, `isPrimary` but no `public_id`. This means Cloudinary images cannot be individually deleted or replaced.

4. **Upload Response Missing `public_id`**  
   `server/src/routes/upload.ts` — All upload responses return `{ url: file.path, filename: file.filename }` but the `filename` from multer-storage-cloudinary IS the `public_id`. Not labeled as such, causing confusion in the frontend.

### 🟡 P1 — High (Functionality Gaps)

5. **Mock Data Still Used in 2 Pages**  
   - `src/pages/Garage.tsx:18` imports `services` from `@/data/userMockData`
   - `src/pages/Build.tsx:17` imports `buildKits, getProductById` from `@/data/userMockData`

6. **Unused Mock File**  
   `src/data/adminMockData.ts` (20.5KB) — Not imported anywhere but clutters the codebase.

7. **Cloudinary Config Path Issue**  
   `server/src/config/cloudinary.ts:6` uses `dotenv.config({ path: '../.env' })` which is CWD-relative and fragile. The main `index.ts` uses `path.resolve(__dirname, '../../.env')` which is correct.

8. **No Request Validation (Zod/Joi) on Product Creation**  
   `server/src/routes/admin.ts:135-214` — Product creation has inline validation for `name` and `price` only. No schema validation for the complex payload structure.

### 🟢 P2 — Medium (Quality / DX)

9. **Zero Project-Level Tests**  
   No unit tests, integration tests, or E2E tests exist in the project. Only tests found are inside `node_modules/zod/`.

10. **No CI/CD Pipeline**  
    No `.github/workflows/`, no Dockerfile, no deployment configuration.

11. **No Storybook**  
    Not configured despite having a mature component library.

12. **Missing `VITE_API_URL` in Root `.env.example`**  
    Root `.env.example` has backend keys but missing `VITE_API_URL` needed by frontend.

13. **Product Deletion Doesn't Clean Cloudinary**  
    `server/src/routes/admin.ts:275-286` — `DELETE /products/:id` deletes from DB but doesn't call `deleteFromCloudinary()` for associated images.

### ⚪ P3 — Low (Nice to Have)

14. **Admin pages not in App.tsx routes** — `AdminUsers.tsx`, `AdminAppointments.tsx`, `AdminBlog.tsx`, `AdminBuilds.tsx`, `AdminMessages.tsx`, `AdminServices.tsx` exist as files but are not in the router.

15. **`eslint_*.txt` Files in Root** — 4 eslint output files checked into repo (`eslint_errors.txt`, `eslint_final.txt`, `eslint_full.txt`, `eslint_output.txt`, `eslint_report.txt`).

---

## Environment Variables Matrix

| Key | Location | Required By | Present in .env.example |
|-----|----------|-------------|------------------------|
| `DATABASE_URL` | `.env` | Backend (Prisma) | ✅ |
| `CLOUDINARY_CLOUD_NAME` | `.env` | Backend | ✅ |
| `CLOUDINARY_API_KEY` | `.env` | Backend | ✅ |
| `CLOUDINARY_API_SECRET` | `.env` | Backend | ✅ |
| `CLOUDINARY_URL` | `.env` | Backend (optional) | ✅ |
| `PORT` | `.env` | Backend | ✅ |
| `NODE_ENV` | `.env` | Backend | ✅ |
| `JWT_SECRET` | `.env` | Backend | ✅ |
| `JWT_EXPIRES_IN` | `.env` | Backend | ✅ |
| `FRONTEND_URL` | `.env` | Backend (CORS) | ✅ |
| `GOOGLE_CLIENT_ID` | `.env` | Backend + Frontend | ✅ |
| `GOOGLE_CLIENT_SECRET` | `.env` | Backend | ✅ |
| `VITE_GOOGLE_CLIENT_ID` | `.env` | Frontend | ✅ |
| `VITE_API_URL` | `src/.env` | Frontend | ❌ Missing from root |
| `VITE_APP_NAME` | `src/.env` | Frontend | ❌ Missing from root |

---

## Server Routes Registered

| Method | Path | Auth | Source File |
|--------|------|------|-------------|
| GET | `/api/health` | None | `index.ts` |
| POST | `/api/auth/register` | None | `auth.ts` |
| POST | `/api/auth/login` | None | `auth.ts` |
| POST | `/api/auth/google` | None | `auth.ts` |
| POST | `/api/auth/admin/login` | None | `auth.ts` |
| GET | `/api/auth/me` | Bearer JWT | `auth.ts` |
| GET | `/api/products` | None | `products.ts` |
| GET | `/api/products/categories/all` | None | `products.ts` |
| GET | `/api/products/category/:slug` | None | `products.ts` |
| GET | `/api/products/featured/list` | None | `products.ts` |
| GET | `/api/products/offers/top` | None | `products.ts` |
| GET | `/api/products/:idOrSlug` | None | `products.ts` |
| POST | `/api/upload/image` | ❌ None | `upload.ts` |
| POST | `/api/upload/images` | ❌ None | `upload.ts` |
| POST | `/api/upload/avatar` | ❌ None | `upload.ts` |
| POST | `/api/upload/category` | ❌ None | `upload.ts` |
| POST | `/api/upload/banner` | ❌ None | `upload.ts` |
| GET | `/api/admin/dashboard/stats` | Admin JWT | `admin.ts` |
| POST | `/api/admin/products` | Admin JWT | `admin.ts` |
| PUT | `/api/admin/products/:id` | Admin JWT | `admin.ts` |
| DELETE | `/api/admin/products/:id` | Admin JWT | `admin.ts` |
| GET | `/api/admin/products` | Admin JWT | `admin.ts` |
| POST | `/api/admin/categories` | Admin JWT | `admin.ts` |
| PUT | `/api/admin/categories/:id` | Admin JWT | `admin.ts` |
| DELETE | `/api/admin/categories/:id` | Admin JWT | `admin.ts` |
| GET | `/api/admin/payments` | Admin JWT | `admin.ts` |
| GET | `/api/admin/requests` | Admin JWT | `admin.ts` |
| PATCH | `/api/admin/requests/:id` | Admin JWT | `admin.ts` |
| GET | `/api/admin/inventory/low-stock` | Admin JWT | `admin.ts` |
| GET | `/api/admin/users` | Admin JWT | `admin.ts` |
| CRUD | `/api/admin/top-offers` | Admin JWT | `admin.ts` |
| CRUD | `/api/product-types` | Mixed | `productTypes.ts` |
| GET | `/api/product-types/search` | None | `productTypes.ts` |
| GET | `/api/product-types/tags/suggestions` | None | `productTypes.ts` |
| CRUD | `/api/orders` | Bearer JWT | `orders.ts` |

---

## Next Steps

See `implementation_plan.md` for the full execution plan across all 8 phases.
