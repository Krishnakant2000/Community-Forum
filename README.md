# Community Forum - Saved Posts (Full-Stack Slice)

A complete full-stack feature slice implementing a discussion feed with idempotent, history-preserving bookmarks and optimistic UI caching.

## Tech Stack
* **Runtime & Workspaces:** Bun (Monorepo with `apps/api`, `apps/web`, and `packages/shared`)
* **API Layer:** Elysia (TypeScript strict mode)
* **Database & ORM:** PostgreSQL (Docker Compose) + Drizzle ORM
* **Client Data Layer:** React Query (TanStack) v5 with Query Key Factory & Optimistic Updates
* **UI Presentation:** Next.js 15 (App Router) + Tailwind CSS + React 19
* **Testing:** Vitest (Unit domain logic + API integration tests)

---

## Quick Start Setup Steps

### 1. Install Dependencies
```bash
bun install
```

### 2. Start PostgreSQL Database
```
bun run db:up
(Spins up a local PostgreSQL 16 container on port 5432 via Docker Compose)
```

### 3. Push Schema & Seed Database
```
bun run --cwd apps/api db:push
bun run --cwd apps/api db:seed
(Populates 2 courses, 3 users, enrollments, and initial discussion posts)
```

### 4. Run Automated Tests
```
bun run --cwd apps/api test
(Runs 100% green unit tests for pure bookmark transition logic and API authorization boundaries)
```

### 5. Start the Application (API + Web Simultaneously)
```
bun run dev
```

* Frontend UI: Open ```http://localhost:3000```

* Backend API: Running on ```http://localhost:3001```

**Testing the Features in the UI**
* **Optimistic Toggling:** Click "Save" on any post in the Course Feed. The toggle responds instantly, updating the UI cache and save counts before the network call settles.

* **Saved List View:** Switch to the "Saved Posts" tab to see your actively bookmarked discussions sorted by most recently saved.

* **Authorization Boundaries:** Try switching the course dropdown to "Scalable Systems Design". Because the default logged-in user (student-1) is only enrolled in React, the API enforces a strict 403 Forbidden access boundary.

* **Internationalization (i18n):** Click the "🇪🇸 Español" button in the header. The entire UI transforms, applying strict Spanish pluralization mathematical rules (e.g., "1 guardado" vs "2 guardados").