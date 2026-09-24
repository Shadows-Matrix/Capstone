# SERVEX — Frontend vs Backend Map

Next.js is a **full-stack framework**: frontend pages and backend API routes live
side by side under `src/app` (that is required — moving them breaks routing and
the Vercel build). But the code itself is already split by role. Read this:

## 🎨 FRONTEND (what runs in the browser)

| Folder | What lives here | Languages |
|---|---|---|
| `src/app/(public)/` | Landing, services, providers pages (public screens) | TSX, CSS |
| `src/app/(auth)/` | Login screen | TSX |
| `src/app/customer/`, `provider/`, `admin/` | Dashboard screens | TSX |
| `src/app/saved`, `notifications`, `profile` | Account screens | TSX |
| `src/app/layout.tsx`, `globals.css` | Root layout + all styles | TSX, CSS |
| `src/components/ui/` | Buttons, cards, dialogs, inputs (shadcn) | TSX, CSS |
| `src/components/common/` | Navbar, footer, maps, star ratings | TSX |
| `src/components/service/`, `booking/`, `provider/`, `dashboard/` | Feature widgets (cards, dialogs, chat, charts) | TSX |
| `src/features/` | Client logic: forms, dashboards, React Query hooks | TypeScript |
| `src/lib/api-client.ts`, `src/lib/utils.ts` | Browser fetch wrapper + formatters | TypeScript |

## ⚙️ BACKEND (what runs on the server / database)

| Folder | What lives here | Languages |
|---|---|---|
| `src/app/api/` | REST endpoints (`/api/v1/...`, auth) — thin wrappers | TypeScript |
| `src/services/` | Business rules (bookings, OTP, recommendations, engagement) | TypeScript |
| `src/repositories/` | Database queries only (Prisma calls) | TypeScript |
| `src/lib/auth.ts`, `session.ts`, `api.ts`, `validation.ts`, `mailer.ts`, `geocode.ts`, `prisma.ts` | Auth, sessions, validation, email, maps data | TypeScript |
| `src/middleware.ts` | Route protection (role redirects) | TypeScript |
| `prisma/schema.prisma` | Database tables (User, Booking, Review, …) | Prisma schema |
| `prisma/migrations/` | Database version history | SQL |
| `prisma/seed.ts` | Demo data (Indian cities, providers, bookings) | TypeScript |

## 🔁 How they connect

```
Browser (frontend) --fetch /api/v1/...--> API route --calls--> service --calls--> repository --queries--> PostgreSQL
```

Rule of thumb: **components/features never touch the database** — they only call
`/api/v1/*`. **Services never touch the browser** — no JSX, no hooks.
