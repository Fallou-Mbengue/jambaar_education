# Jambaar Education - Admin Platform

Plateforme éducative sénégalaise avec panel d'administration complet.

## Stack technique

- **Backend** : NestJS 10, Prisma 5, PostgreSQL, Redis, MinIO
- **Frontend** : Next.js 14, React 18, TailwindCSS, TanStack Query 5, Zustand, React Hook Form + Zod
- **Auth** : JWT cookies, RBAC (ADMIN / COACH / USER)
- **CI/CD** : GitHub Actions, Docker Compose

## Démarrage rapide

### Avec Docker Compose (recommandé)

```bash
docker-compose up -d
```

Services démarrés :
- API : http://localhost:4000
- Swagger : http://localhost:4000/api/docs
- Frontend : http://localhost:3000
- MinIO Console : http://localhost:9001

### Développement local

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## Comptes par défaut (seed)

| Rôle  | Email               | Mot de passe |
|-------|---------------------|--------------|
| ADMIN | admin@jambaar.sn    | admin123     |
| COACH | coach@jambaar.sn    | coach123     |
| USER  | fatou@example.com   | user123      |
| USER  | amadou@example.com  | user123      |

## Permissions COACH vs ADMIN

| Action                     | ADMIN | COACH |
|----------------------------|-------|-------|
| Voir contenus / users / KPIs | Yes | Yes (read-only) |
| Créer / éditer contenus    | Yes   | No    |
| Publish / archive / duplicate | Yes | No  |
| Changer rôle utilisateur   | Yes   | No    |
| Suspendre / réactiver user | Yes   | No    |
| Ajuster XP / streak        | Yes   | No    |
| Accorder / retirer premium | Yes   | No    |
| CRUD plans abonnement      | Yes   | No    |
| Cancel / extend subscription | Yes | No   |
| Envoyer notifications      | Yes   | No    |
| Voir audit logs            | Yes   | No    |

## Endpoints API Admin

Tous sous `/api/v1/dashboard/*`, protégés par `JwtAuthGuard` + `RolesGuard`.

### Auth
- `POST /api/v1/auth/login` — Login, set JWT cookie
- `POST /api/v1/auth/logout` — Clear JWT cookie
- `GET /api/v1/auth/me` — Get current user

### Content (CMS)
- `GET /dashboard/content` — List (search, filter status/level/premium, pagination)
- `POST /dashboard/content` — Create
- `GET /dashboard/content/:id` — Get by ID
- `PATCH /dashboard/content/:id` — Update
- `POST /dashboard/content/:id/publish` — Publish
- `POST /dashboard/content/:id/archive` — Archive
- `POST /dashboard/content/:id/unarchive` — Unarchive
- `POST /dashboard/content/:id/duplicate` — Duplicate
- `DELETE /dashboard/content/:id` — Soft delete (archive)

### Programs
- `GET /dashboard/programs` — List programs
- `POST /dashboard/programs` — Create program
- `GET /dashboard/programs/:id` — Get program with modules
- `PATCH /dashboard/programs/:id` — Update
- `DELETE /dashboard/programs/:id` — Archive
- `POST /dashboard/programs/:id/modules` — Attach modules
- `PATCH /dashboard/programs/:id/reorder` — Reorder modules
- `GET /dashboard/programs/modules` — List all modules
- `POST /dashboard/programs/modules` — Create module

### Challenges
- `GET /dashboard/challenges` — List challenges
- `POST /dashboard/challenges` — Create (auto-creates 7 days)
- `GET /dashboard/challenges/:id` — Get with days
- `PATCH /dashboard/challenges/:id` — Update
- `DELETE /dashboard/challenges/:id` — Archive
- `PATCH /dashboard/challenges/:id/days/:dayNumber` — Update day content

### Quizzes
- `GET /dashboard/quizzes` — List quizzes
- `POST /dashboard/quizzes` — Create
- `GET /dashboard/quizzes/:id` — Get with questions
- `PATCH /dashboard/quizzes/:id` — Update
- `DELETE /dashboard/quizzes/:id` — Archive
- `POST /dashboard/quizzes/:id/questions` — Add question
- `PATCH /dashboard/quizzes/:id/questions/:questionId` — Update question
- `DELETE /dashboard/quizzes/:id/questions/:questionId` — Delete question

### Users
- `GET /dashboard/users` — List (search email/name, filter role/status/premium/date)
- `GET /dashboard/users/:id` — Full detail (profile, gamification, billing, progress)
- `PATCH /dashboard/users/:id/role` — Change role
- `PATCH /dashboard/users/:id/status` — Suspend / unsuspend
- `POST /dashboard/users/:id/gamification/adjust` — Adjust XP / reset streak (reason required)
- `POST /dashboard/users/:id/premium/grant` — Grant premium for N days
- `POST /dashboard/users/:id/premium/revoke` — Revoke premium

### Billing
- `GET /dashboard/billing/plans` — List plans
- `POST /dashboard/billing/plans` — Create plan
- `PATCH /dashboard/billing/plans/:id` — Update plan
- `DELETE /dashboard/billing/plans/:id` — Deactivate plan
- `GET /dashboard/billing/subscriptions` — List subscriptions
- `PATCH /dashboard/billing/subscriptions/:id/cancel` — Cancel subscription
- `PATCH /dashboard/billing/subscriptions/:id/extend` — Extend by N days
- `GET /dashboard/billing/payments` — List payments
- `POST /dashboard/billing/payments/:id/reconcile` — Reconcile pending payment

### Notifications
- `POST /dashboard/notifications` — Send to segment (ALL/PREMIUM/NON_PREMIUM/CHALLENGE_PARTICIPANTS/CUSTOM)
- `GET /dashboard/notifications` — List sent notifications

### Audit & Analytics
- `GET /dashboard/audit-logs` — List audit logs (filter actor/action/entity/date)
- `GET /dashboard/analytics/overview` — Dashboard KPIs
- `GET /dashboard/analytics/activation` — Activation metrics
- `GET /dashboard/analytics/retention` — Retention metrics

### Media
- `POST /dashboard/media/presign` — Get presigned upload URL (MinIO)

## Pages Frontend Admin

| Route | Description |
|-------|-------------|
| `/login` | Connexion admin |
| `/dashboard` | KPIs overview |
| `/dashboard/content` | Liste contenus + actions |
| `/dashboard/content/new` | Formulaire création contenu |
| `/dashboard/content/[id]` | Édition contenu + actions publish/archive |
| `/dashboard/programs` | Liste programmes |
| `/dashboard/programs/[id]` | Détail programme + modules |
| `/dashboard/challenges` | Liste challenges 7 jours |
| `/dashboard/challenges/[id]` | Détail + édition jours J1-J7 |
| `/dashboard/quizzes` | Liste quizzes |
| `/dashboard/quizzes/[id]` | Détail + gestion questions |
| `/dashboard/users` | Liste utilisateurs (filtres multiples) |
| `/dashboard/users/[id]` | Fiche utilisateur 5 onglets |
| `/dashboard/billing/plans` | CRUD plans abonnement |
| `/dashboard/billing/subscriptions` | Liste abonnements + cancel/extend |
| `/dashboard/billing/payments` | Liste paiements + réconciliation |
| `/dashboard/notifications` | Envoi + historique notifications |
| `/dashboard/audit-logs` | Journal audit avec filtres |

## Schema Prisma

Modèles principaux : User, UserProfile, GamificationProfile, Badge, UserBadge, Content, Program, Module, ProgramModule, Challenge, ChallengeDay, ChallengeProgress, Quiz, QuizQuestion, QuizAttempt, Like, Save, ShareLog, SubscriptionPlan, Subscription, Payment, WebhookEvent, AdminAuditLog, AnalyticsEvent, Notification, NotificationTarget.

## Tests

```bash
cd backend
npm test          # Unit tests
npm run test:e2e  # E2E tests
```

Tests couvrent : content publish, user role change, subscription extend, audit log creation, payment reconciliation.
