# 🔧 Fix Admin Dashboard Pages

## Problem
Some admin pages (Blog, Services, Builds, Appointments, Messages) are not working properly because:
1. Database collections might not be initialized
2. API endpoints need proper error handling
3. Frontend needs better loading/error states

## Solution

### Step 1: Sync Prisma Schema with Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to MongoDB (creates collections if they don't exist)
npx prisma db push

# Verify in Prisma Studio
npx prisma studio
```

### Step 2: Seed Initial Data (Optional)

Create `server/src/seed-admin-features.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdminFeatures() {
  console.log('🌱 Seeding admin features...\n');

  // Create sample blog post
  const blog = await prisma.blog.upsert({
    where: { slug: 'welcome-to-blackpiston' },
    update: {},
    create: {
      title: 'Welcome to BlackPiston Garage',
      slug: 'welcome-to-blackpiston',
      content: 'Your premier destination for motorcycle gear and accessories.',
      category: 'Announcements',
      tags: ['welcome', 'announcement'],
      isPublished: true,
    },
  });
  console.log('✅ Blog post created:', blog.title);

  // Create sample service
  const service = await prisma.service.upsert({
    where: { slug: 'oil-change' },
    update: {},
    create: {
      name: 'Oil Change',
      slug: 'oil-change',
      description: 'Complete oil change service for your motorcycle',
      price: 1500,
      duration: '1 hour',
      category: 'Maintenance',
      isActive: true,
    },
  });
  console.log('✅ Service created:', service.name);

  // Create sample build
  const build = await prisma.build.upsert({
    where: { slug: 'custom-r1' },
    update: {},
    create: {
      name: 'Custom Yamaha R1',
      slug: 'custom-r1',
      description: 'Track-ready custom build',
      components: ['Engine tune', 'Exhaust system', 'Suspension upgrade'],
      price: 250000,
      images: [],
      isFeatured: true,
      isActive: true,
    },
  });
  console.log('✅ Build created:', build.name);

  console.log('\n✅ Admin features seeded successfully!');
  await prisma.$disconnect();
}

seedAdminFeatures().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
```

Run it:
```bash
cd server
npx tsx src/seed-admin-features.ts
```

### Step 3: Test Backend Endpoints

```bash
# Test Blog endpoint
curl http://localhost:3001/api/admin/blog

# Test Services endpoint
curl http://localhost:3001/api/admin/services

# Test Builds endpoint
curl http://localhost:3001/api/admin/builds

# Test Appointments endpoint
curl http://localhost:3001/api/admin/appointments

# Test Requests (Messages) endpoint
curl http://localhost:3001/api/admin/requests
```

### Step 4: Fix Frontend API Calls

The API functions are already defined in `src/lib/api.ts`. Just ensure they're being called correctly.

### Step 5: Verify Admin Pages

1. Login to admin panel: `http://localhost:5000/admin`
2. Navigate to each page:
   - Blog: `/admin/blog`
   - Services: `/admin/services`
   - Builds: `/admin/builds`
   - Appointments: `/admin/appointments`
   - Messages: `/admin/messages`
   - Requests: `/admin/requests`

---

## Quick Fix Commands

```bash
# 1. Regenerate Prisma Client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Restart backend
cd server
npm run dev

# 4. Restart frontend (in another terminal)
npm run dev:client
```

---

## Common Issues & Solutions

### Issue 1: "Model not found" error
**Solution**: Run `npx prisma generate` and restart the backend

### Issue 2: Empty data on admin pages
**Solution**: Run the seed script above to create sample data

### Issue 3: API 404 errors
**Solution**: Check that backend routes are registered in `server/src/index.ts`:
```typescript
app.use('/api/admin/blog', blogRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/builds', buildRoutes);
```

### Issue 4: CORS errors
**Solution**: Ensure CORS is configured in `server/src/index.ts`:
```typescript
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5000"],
  credentials: true
}));
```

---

## Verification Checklist

- [ ] Prisma client generated
- [ ] Database schema pushed
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can access admin dashboard
- [ ] Blog page loads
- [ ] Services page loads
- [ ] Builds page loads
- [ ] Appointments page loads
- [ ] Messages page loads
- [ ] Can create new items
- [ ] Can edit items
- [ ] Can delete items

---

## If Pages Still Don't Work

Check browser console for errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for API errors
4. Check Network tab for failed requests

Common error patterns:
- `404 Not Found` → Backend route not registered
- `500 Internal Server Error` → Database/Prisma issue
- `CORS error` → CORS not configured
- `Unauthorized` → Not logged in as admin

