# Jambaar Education

> Mobile-first micro-learning platform for soft skills — built for young Africans.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, TanStack Query |
| Backend | NestJS, Prisma ORM, JWT dual-token auth, RBAC |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Media Storage | MinIO (S3-compatible) |
| Monorepo | pnpm workspaces + Turborepo |
| DevOps | Docker, docker-compose, GitHub Actions CI |

---

## Quick Start

### Prerequisites

- Docker & Docker Compose v2
- Node.js 20+
- pnpm 9+

### 1. Clone & configure

```bash
git clone <repo-url>
cd jambaar_education
cp .env.example .env
# Edit .env with your secrets (JWT_SECRET, etc.)
```

### 2. Start infrastructure + apps

```bash
docker-compose up -d
```

This starts 5 services:
- **postgres** on `localhost:5432`
- **redis** on `localhost:6379`
- **minio** on `localhost:9000` (console: `localhost:9001`)
- **api** (NestJS) on `localhost:3001`
- **web** (Next.js) on `localhost:3000`

### 3. Run migrations & seed

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
```

### 4. Open the app

- **User app**: http://localhost:3000
- **B2B Dashboard**: http://localhost:3000/dashboard
- **API Swagger docs**: http://localhost:3001/api/docs
- **MinIO console**: http://localhost:9001 (user: `minioadmin` / pass: `minioadmin`)

---

## Development (without Docker)

Start services (requires Docker for infra):

```bash
# Terminal 1 – infra only
docker-compose up postgres redis minio -d

# Terminal 2 – API
pnpm --filter api dev

# Terminal 3 – Web
pnpm --filter web dev
```

Or use Turborepo:

```bash
pnpm dev
```

---

## Demo Accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| ADMIN | admin@jambaar.com | Admin123! | Full access + B2B dashboard |
| COACH | coach@jambaar.com | Coach123! | B2B dashboard (read) |
| USER | moussa@example.com | User123! | 340 XP, Starter level, streak 3 |
| USER | fatou@example.com | User123! | 780 XP, Warrior level, streak 7 |

---

## Project Structure

```
jambaar_education/
├── apps/
│   ├── api/                   # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # 25+ table schema
│   │   │   ├── migrations/    # DB migrations
│   │   │   └── seed/          # Demo data seed
│   │   └── src/
│   │       ├── modules/       # Feature modules
│   │       │   ├── auth/      # JWT dual-token, RBAC
│   │       │   ├── users/     # Profile, onboarding
│   │       │   ├── content/   # CRUD, progress tracking
│   │       │   ├── feed/      # Personalized feed ranking
│   │       │   ├── programs/  # Enrollment, module progress
│   │       │   ├── gamification/ # XP engine, badges, streak
│   │       │   ├── challenges/   # 7-day challenges
│   │       │   ├── ai/        # Mock/OpenAI LLM provider
│   │       │   ├── billing/   # Wave/OM payments, webhooks
│   │       │   ├── notifications/ # In-app inbox
│   │       │   ├── dashboard/ # B2B KPIs, admin
│   │       │   └── analytics/ # Event tracking
│   │       ├── prisma/        # PrismaService
│   │       ├── redis/         # RedisService
│   │       └── minio/         # MinioService
│   └── web/                   # Next.js 14 frontend
│       ├── app/
│       │   ├── (auth)/        # login, signup
│       │   ├── (app)/         # main app (feed, programs, etc.)
│       │   └── (dashboard)/   # B2B dashboard
│       ├── components/
│       ├── lib/api/           # Axios API clients
│       ├── store/             # Zustand stores
│       └── middleware.ts      # Auth + role guards
└── packages/
    └── shared/                # Zod schemas, types, constants
```

---

## Key API Endpoints

### Auth
```
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Feed & Content
```
GET  /api/v1/feed                      # Personalized feed (cursor pagination)
GET  /api/v1/content/:id               # Content detail
POST /api/v1/content/:id/progress      # Track watch progress
POST /api/v1/content/:id/like
POST /api/v1/content/:id/save
```

### Programs & Challenges
```
GET  /api/v1/programs
POST /api/v1/programs/:id/enroll
POST /api/v1/challenges/:id/join
POST /api/v1/challenges/:id/validate-day
```

### AI
```
POST /api/v1/ai/chat                   # Chat with AI assistant
POST /api/v1/ai/summarize              # Summarize a content item
GET  /api/v1/ai/recommendations        # Personalized recommendations
```

### Billing
```
GET  /api/v1/billing/plans
POST /api/v1/billing/subscribe
POST /api/v1/billing/webhook/wave
POST /api/v1/billing/webhook/orange-money
```

### B2B Dashboard (ADMIN/COACH only)
```
GET  /api/v1/dashboard/kpis
GET  /api/v1/dashboard/users
GET  /api/v1/dashboard/users/:id
GET  /api/v1/dashboard/content
POST /api/v1/dashboard/content
```

---

## Gamification Rules

| Event | XP |
|---|---|
| Content viewed | +10 XP |
| Content completed | +25 XP |
| Quiz passed | +50 XP |
| Challenge day completed | +30 XP |
| Challenge completed (7 days) | +200 XP |
| 7-day streak bonus | +100 XP |
| Profile completed | +50 XP |

**Levels**: Starter (0–499 XP) → Warrior (500–1999) → Lion (2000–4999) → GOAT (5000+)

---

## Scripts

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed demo data
pnpm test             # Run API unit tests
pnpm lint             # ESLint all packages
```

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

```env
DATABASE_URL=postgresql://jambaar:password@localhost:5432/jambaar
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=jambaar

USE_MOCK_LLM=true        # Set to false to use OpenAI
OPENAI_API_KEY=          # Required if USE_MOCK_LLM=false

NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Dépannage

### Les données ne s'affichent pas (feed vide)

1. **L'API est-elle démarrée ?** Après `pnpm dev`, vous devriez voir `🚀 API running at http://localhost:3001/api/v1` dans le terminal.
2. **PostgreSQL, Redis et MinIO tournent-ils ?** Lancer `docker-compose up postgres redis minio -d` avant l'API.
3. **La base est-elle migrée et seedée ?** Exécuter `pnpm db:migrate` puis `pnpm db:seed` depuis la racine du projet.
4. **Êtes-vous connecté ?** Le feed nécessite une authentification. Connectez-vous avec :
   - `moussa@example.com` / `User123!`
   - ou `fatou@example.com` / `User123!`
5. **Vérifier la console du navigateur** (F12 → Réseau) : les requêtes vers `/api/v1/feed` doivent retourner 200. Un 401 signifie que la session a expiré — reconnectez-vous.

### L'API ne démarre pas ou s'arrête juste après la compilation

- Le script `dev` utilise maintenant `nest start --watch`, qui compile et démarre le serveur.
- Si l'API plante au démarrage, vérifier :
  - `DATABASE_URL` dans `.env` (PostgreSQL accessible)
  - `REDIS_URL` (Redis accessible)
  - `JWT_SECRET` et `JWT_REFRESH_SECRET` renseignés

---

## Architecture Decisions

### Event-Driven Gamification
Gamification uses `@nestjs/event-emitter` to avoid circular dependencies. Other modules emit `gamification.awardXp` events; the gamification service listens and handles XP, streak updates, and badge evaluation atomically.

### Feed Ranking Algorithm
```
score = recency(0.4) + engagement(0.3) + personalization(0.3) - seen_penalty(0.3)

recency       = exp(-hours_since_publish / 48)
engagement    = normalized(likes × 0.4 + saves × 0.6 + shares)
personalization = tag_overlap(user.interests, content.tags)
```
Cursor-based pagination encodes `{score, id}` in base64.

### JWT Auth Flow
- Access token: 15 min TTL, stored in HttpOnly cookie
- Refresh token: 30 days TTL, stored in Redis + HttpOnly cookie
- Silent refresh via Axios interceptor with pending request queue

### Webhook Idempotency
On webhook receipt: persist `WebhookEvent(providerRef)` immediately → return 200 → process async → mark `processed: true`. Duplicate check via `providerRef` unique constraint.

### MinIO Upload Flow
1. `POST /upload/presign` → returns presigned PUT URL (10 min)
2. Client uploads directly to MinIO (no API bandwidth)
3. `POST /upload/confirm` → API verifies object exists → associates key with entity

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **lint-and-typecheck**: ESLint + `tsc --noEmit` on all packages
2. **test-api**: Spin up postgres + redis → migrate → run Jest unit tests
3. **build**: `turbo build` (shared → api → web) — runs only if jobs 1 & 2 pass

---

## Deployment

For production deployment:

1. Set secure values in `.env` (strong JWT secrets, real DB/Redis URLs)
2. Set `USE_MOCK_LLM=false` and provide `OPENAI_API_KEY`
3. Configure Wave/Orange Money API keys
4. Run: `docker-compose up -d`
5. Run: `pnpm db:migrate` (production safe with `migrate deploy`)

Multi-region or cloud deployment: each Dockerfile produces a minimal Alpine-based image. The API image runs `prisma generate` at build time.
