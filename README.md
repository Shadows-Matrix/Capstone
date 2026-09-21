# SERVEX — Smart Hyperlocal Services Marketplace

A production-quality, Vercel-compatible full-stack web application for connecting customers with trusted local service providers.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS, shadcn/ui
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js v5 (JWT-based)
- **State:** TanStack React Query
- **Validation:** Zod + React Hook Form

## Features

### Customer Features
- Register & login
- Natural language service search ("My AC isn't cooling...")
- Browse categories & filter providers
- View provider profiles, ratings, and pricing
- Create bookings with date/time selection
- View and cancel bookings
- Review completed services

### Provider Features
- Login & manage profile
- Add/edit services with pricing
- Set availability status
- Accept/reject booking requests
- Start/complete service jobs
- View earnings and ratings

### Admin Features
- Dashboard with analytics (users, bookings, revenue)
- Booking status breakdown
- Top categories chart
- Recent bookings table

### Smart Matching
- NLP-based service detection from natural language queries
- Rule-based provider ranking (rating 30%, availability 25%, location 20%, price 15%, completion rate 10%)
- Designed for future LLM/ML integration

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon, Supabase, or Vercel Postgres)

### Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd servex
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URL and auth secret.

3. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database:**
   ```bash
   npm run db:seed
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

6. **Open:** http://localhost:3000

### Demo Accounts

All accounts use password: `Password123!`

| Role | Email |
|------|-------|
| Admin | admin@servex.com |
| Customer | john@example.com |
| Provider | alice@servexpro.com |

## Deployment to Vercel

1. **Create a PostgreSQL database** (Neon recommended for free tier)

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Import into Vercel:**
   - Go to vercel.com/new
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

4. **Add environment variables in Vercel:**
   - `DATABASE_URL` — Your PostgreSQL connection string
   - `AUTH_SECRET` — Generate with `openssl rand -base64 32`
   - `AUTH_URL` — Your Vercel deployment URL (e.g., `https://servex.vercel.app`)

5. **Deploy:**
   - Vercel auto-deploys on push to main

6. **Run Prisma migration on production:**
   ```bash
   npx prisma migrate deploy
   ```

7. **Seed production (optional):**
   ```bash
   npx tsx prisma/seed.ts
   ```

8. **Verify:** Open your Vercel URL and test the full workflow.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with NLP search
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── services/             # Service listing & detail
│   ├── providers/            # Provider listing & detail
│   ├── customer/             # Customer dashboard
│   ├── provider/             # Provider dashboard
│   ├── admin/                # Admin dashboard
│   └── api/                  # API routes
│       ├── auth/             # NextAuth handlers
│       └── v1/               # REST API endpoints
├── components/               # Reusable UI components
├── features/                 # Feature-specific components
├── lib/                      # Utilities, auth, validation
├── repositories/             # Data access layer
├── services/                 # Business logic layer
└── types/                    # TypeScript types
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| GET | /api/v1/categories | List service categories |
| GET | /api/v1/services | List services (with filters) |
| GET | /api/v1/services/[id] | Get service detail |
| GET | /api/v1/providers | List providers |
| GET | /api/v1/providers/[id] | Get provider detail |
| GET | /api/v1/recommendations | Get smart recommendations |
| GET/POST | /api/v1/bookings | List/create bookings |
| PATCH | /api/v1/bookings/[id] | Update booking status |
| POST | /api/v1/reviews | Create review |
| GET | /api/v1/admin/dashboard | Admin analytics |

## License

MIT
