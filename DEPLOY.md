# BlackPiston Garage — Deployment Guide

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│  MongoDB    │
│  (Vite/React)│     │  (Express)  │     │  (Atlas)    │
│  Port: 5000  │     │  Port: 3001 │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ Cloudinary  │
                    │ (Images)    │
                    └─────────────┘
```

---

## Option 1: Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Google Cloud Console project (for OAuth)

### Steps

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Generate Prisma client
npx prisma generate

# 3. Create .env from template
cp .env.example .env
# Fill in all values in .env

# 4. Seed admin user
cd server && npx tsx src/seed-admin.ts && cd ..

# 5. Start backend (terminal 1)
cd server && npm run dev

# 6. Start frontend (terminal 2)
npm run dev
```

Visit: `http://localhost:5000`

---

## Option 2: Docker Compose

### Build & Run

```bash
docker-compose up --build
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:3001/api

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
```

---

## Option 3: Vercel (Frontend) + Render/Railway (Backend)

### Frontend on Vercel

1. Connect GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_API_URL` = your backend URL + `/api`
   - `VITE_GOOGLE_CLIENT_ID` = your Google client ID

### Backend on Render

1. Create new Web Service on Render
2. Set root directory: `server`
3. Set build command: `npm install && npx prisma generate`
4. Set start command: `npm start`
5. Add all environment variables from `.env.example`

### Backend on Railway

1. Create new project from GitHub
2. Set root directory: `server`
3. Add all environment variables
4. Railway auto-detects Node.js and deploys

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `JWT_SECRET` | ✅ | Secret for JWT signing (use a strong random string) |
| `JWT_EXPIRES_IN` | ✅ | JWT expiry (e.g., `7d`) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS (e.g., `https://yourdomain.com`) |
| `PORT` | ⬜ | Backend port (default: `3001`) |
| `NODE_ENV` | ⬜ | Environment (`development` / `production`) |
| `VITE_API_URL` | ✅ | Backend API URL for frontend |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | Google client ID for frontend |

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, unique `JWT_SECRET`
- [ ] Set `FRONTEND_URL` to your actual frontend domain
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set secure cookie options if using cookies
- [ ] Verify Cloudinary upload/delete works
- [ ] Verify Google OAuth redirect URIs match your domain
- [ ] Run `npx prisma generate` before starting backend
- [ ] Seed admin user: `npx tsx src/seed-admin.ts`
- [ ] Test all API endpoints with production URLs
- [ ] Verify CORS allows your frontend domain
- [ ] Set up database backups on MongoDB Atlas
- [ ] Monitor Cloudinary storage usage
