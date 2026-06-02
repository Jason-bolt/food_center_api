# Food Center API

A Node.js/Express REST API for Food Center — an African food discovery platform with AI-powered recipe generation, user accounts, meal planning, ingredient pantry management, and gamification.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express 5 (TypeScript) |
| Database | MongoDB + Mongoose |
| Cache | Redis |
| AI | Google Gemini 2.5 Flash (recipe generation) |
| Images | Cloudinary (upload + storage) |
| Background jobs | Inngest |
| Email | Mailgun |
| Video metadata | YouTube Data API v3 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Pino + pino-pretty |
| Uploads | Multer |

---

## Features

### Food Catalogue
- Full CRUD for food items (admin-key protected writes)
- Paginated listing with search (name), country, and region filters
- Redis-cached reads with automatic invalidation on write
- Per-food influencer and video listings

### Influencer & Video Management
- Full CRUD for food influencers (admin-key protected writes)
- Links influencers to foods with associated YouTube video URLs
- **Inngest background job** fetches video metadata (title, thumbnail, publish date) from the YouTube API asynchronously on influencer creation — no blocking, 3 automatic retries

### User Accounts & Auth
- Email/password registration with bcrypt hashing
- JWT-based authentication (`Authorization: Bearer <token>`, 7-day expiry)
- `GET /auth/me` to hydrate the client with the current user + stats
- Mailgun welcome email sent on registration (fire-and-forget)

### AI Chef — Recipe Generation
- `POST /recipes/suggest` streams Gemini-generated recipes over SSE
  - Accepts up to 20 ingredients
  - Suggests 2–3 recipes with steps, difficulty, time, and serving size
  - Tighter per-IP rate limit (10 requests / 15 min) to control AI costs
  - Optional JWT — logs the generate event to user stats when authenticated
- `POST /recipes/images` — Cloudinary image generation for recipe cards (5 requests / 15 min)

### Saved Recipes & Collections
- Save any AI-generated recipe to a named collection
- Collections: create, rename, delete
- Recipes: save, list (by collection), move between collections, delete
- All endpoints JWT-protected; awards XP and updates streak on save

### Meal Planner
- Weekly meal plan per user (indexed by Monday of the week)
- `GET /meal-plan` — fetch current or any week's plan
- `PUT /meal-plan/slot` — assign a saved recipe to a day slot
- `DELETE /meal-plan/slot` — clear a slot
- Completing all 7 days of a week awards a one-time +50 XP bonus (idempotent — tracked by week key)

### Ingredient Pantry
- Per-user persistent ingredient list
- `GET /pantry` — fetch pantry
- `PUT /pantry` — replace entire list
- `POST /pantry/ingredient` — add a single ingredient
- `DELETE /pantry/ingredient` — remove a single ingredient

### Trending Ingredients
- Every `/recipes/suggest` call atomically increments each ingredient's score in a Redis sorted set keyed by ISO week (`trending:ingredients:{YYYY-Www}`)
- 2-week TTL — data expires automatically
- `GET /trending` — returns the top 10 ingredients for the current week

### Gamification & Streaks
- `UserStats` embedded in every user document:
  - `currentStreak` / `longestStreak` — consecutive active days
  - `lastActiveDate` — YYYY-MM-DD (UTC)
  - `totalRecipesGenerated` / `totalRecipesSaved`
  - `xp` — cumulative experience points
  - `completedWeeks` — week keys where the full-plan bonus was already awarded
- XP awards: **+10** generate · **+20** save · **+50** full week (once per week)
- Streak logic: increments on a new calendar day, resets to 1 if a day is skipped
- All stat updates are a single atomic MongoDB aggregation-pipeline update — no read-modify-write race conditions

### File Uploads
- `POST /upload` — multipart image upload via Multer → Cloudinary; returns `secure_url`

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (Atlas or local)
- Redis (local or managed, e.g. Upstash)
- Cloudinary account
- Google Cloud project with YouTube Data API v3 and Gemini API enabled
- Mailgun account (for welcome emails)
- Inngest account or local Inngest CLI (for background jobs)

### Installation

```bash
cd food_center_api
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in every value:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Redis
REDIS_URL=redis://...

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google APIs
GOOGLE_YOUTUBE_API_KEY=
GEMINI_API_KEY=

# Auth
JWT_SECRET=                          # long random secret
API_SECRET=                          # admin API key for food/influencer writes

# Mailgun
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM=Food Center <noreply@yourdomain.com>
MAILGUN_REGION=us                    # or eu

# App
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173  # comma-separated in production
CLIENT_URL=http://localhost:5173       # used in email links
```

### Running

```bash
# Development — nodemon + ts-node with auto-reload
npm run dev

# TypeScript compile check
npm run build

# Start Inngest dev server (separate terminal, needed for background jobs)
npm run inngest:start

# Lint
npm run lint
npm run lint:fix
```

The API server listens on **port 3000**. Base path: `/api/v1`.  
The Inngest dev server runs on **port 8288**.

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

All write endpoints that are admin-only require the header `x-api-key: <API_SECRET>`.  
All user endpoints that are auth-required need `Authorization: Bearer <JWT>`.

### Authentication — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register; returns `{ token, user }` |
| POST | `/auth/login` | — | Login; returns `{ token, user }` |
| GET | `/auth/me` | JWT | Return current user with stats |

### Foods — `/foods`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/foods` | — | Paginated list. Query: `page`, `limit`, `search`, `country`, `region` |
| GET | `/foods/all/items/nonpaginated` | — | All foods, no pagination |
| GET | `/foods/:id` | — | Single food |
| POST | `/foods` | Admin key | Create food |
| PUT | `/foods/:id` | Admin key | Update food |
| DELETE | `/foods/:id` | Admin key | Delete food + related InfluencerFood records |
| GET | `/foods/:id/influencers` | — | Influencers linked to this food |
| GET | `/foods/:id/videos` | — | Videos linked to this food |

### Influencers — `/influencers`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/influencers` | — | All influencers (Redis-cached) |
| GET | `/influencers/:id` | — | Single influencer |
| POST | `/influencers` | Admin key | Create influencer + trigger YouTube background job |
| PUT | `/influencers/:id` | Admin key | Update influencer |
| DELETE | `/influencers/:id` | Admin key | Delete influencer + related records |

### AI Recipes — `/recipes`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/recipes/suggest` | Optional JWT | Stream SSE recipe suggestions. Body: `{ ingredients: string[] }` |
| POST | `/recipes/images` | — | Generate Cloudinary images for recipes. Body: `{ recipes: [{ name, region }] }` |

Rate limits: `/suggest` — 10 req / 15 min; `/images` — 5 req / 15 min (per IP, in addition to the global 1000 req / 15 min limit).

### Saved Recipes — `/saved-recipes` *(JWT required)*

| Method | Path | Description |
|---|---|---|
| GET | `/saved-recipes` | List saved recipes. Query: `collectionId` (or `none`) |
| POST | `/saved-recipes` | Save a recipe. Body: `{ title, region, markdown, imageUrl?, collectionId? }` |
| DELETE | `/saved-recipes/:id` | Delete a saved recipe |
| PUT | `/saved-recipes/:id/collection` | Move recipe to a different collection |
| GET | `/saved-recipes/collections` | List collections |
| POST | `/saved-recipes/collections` | Create collection. Body: `{ name }` |
| PUT | `/saved-recipes/collections/:id` | Rename collection |
| DELETE | `/saved-recipes/collections/:id` | Delete collection |

### Meal Plan — `/meal-plan` *(JWT required)*

| Method | Path | Description |
|---|---|---|
| GET | `/meal-plan` | Fetch meal plan. Query: `weekStart` (ISO date, optional — defaults to current week) |
| PUT | `/meal-plan/slot` | Assign a recipe to a day slot |
| DELETE | `/meal-plan/slot` | Clear a day slot |

### Pantry — `/pantry` *(JWT required)*

| Method | Path | Description |
|---|---|---|
| GET | `/pantry` | Fetch the user's pantry ingredient list |
| PUT | `/pantry` | Replace the entire list. Body: `{ ingredients: string[] }` |
| POST | `/pantry/ingredient` | Add one ingredient. Body: `{ ingredient: string }` |
| DELETE | `/pantry/ingredient` | Remove one ingredient. Body: `{ ingredient: string }` |

### Trending — `/trending`

| Method | Path | Description |
|---|---|---|
| GET | `/trending` | Top 10 trending ingredients for the current week |

### Upload — `/upload`

| Method | Path | Description |
|---|---|---|
| POST | `/upload` | `multipart/form-data` with field `imageUrl`. Returns Cloudinary `secure_url` |

---

## Data Models

### User
```
name, email, password (hashed), plan (free|pro), createdAt
stats: {
  currentStreak, longestStreak, lastActiveDate,
  totalRecipesGenerated, totalRecipesSaved,
  xp, completedWeeks[]
}
```

### Food
```
name, countries[], region, culturalStory, description, imageUrl, ingredients[], createdAt, updatedAt
```

### Influencer
```
name, description, imageUrl, instagram, youtube, tiktok, facebook, twitter, snapchat, linkedin, website, createdAt, updatedAt
```

### InfluencerFood *(junction)*
```
influencer (ref), food (ref), videoUrl, videoId, videoTitle, videoThumbnailUrl, videoPublishedAt
```

### SavedRecipe
```
userId (ref), collectionId (ref, nullable), title, region, markdown, imageUrl, createdAt
```

### Collection
```
userId (ref), name, createdAt
```

### MealPlan
```
userId (ref), weekStart (Monday UTC midnight), slots[]: { day 0–6, savedRecipeId, title, region, imageUrl, ingredients[] }
```

### Pantry
```
userId (ref, unique), ingredients[], updatedAt
```

---

## Project Structure

```
food_center_api/
├── index.ts                        # Bootstrap: middleware, routes, DB/Redis connect
├── config/
│   ├── cloudinary/index.ts         # Cloudinary SDK config
│   └── db/
│       ├── index.ts                # Mongoose connect
│       └── models/                 # All Mongoose models
├── inngest/
│   ├── index.ts                    # Inngest client
│   └── functions/index.ts          # Background jobs (YouTube metadata fetch)
├── src/
│   ├── routes/index.ts             # Mounts all module routers under /api/v1
│   ├── middleware/
│   │   ├── auth.ts                 # Admin x-api-key guard
│   │   ├── userAuth.ts             # JWT user guard
│   │   └── optionalUserAuth.ts     # JWT attach if present (no 401 if absent)
│   └── modules/
│       ├── auth/                   # Register, login, /me
│       ├── food/                   # Food CRUD + filtering
│       ├── influencer/             # Influencer CRUD + Inngest trigger
│       ├── upload/                 # Cloudinary file upload
│       ├── recipes/                # Gemini SSE stream + image generation
│       ├── savedRecipes/           # Saved recipes + collections
│       ├── mealPlan/               # Weekly meal planning
│       ├── pantry/                 # Per-user ingredient pantry
│       └── trending/               # Redis-backed trending ingredients
└── utils/
    ├── logger.ts                   # Pino logger
    ├── tryCatchHelper.ts           # Async error wrapper
    └── services/
        ├── redis.ts                # Redis client + helpers
        ├── stats.ts                # Atomic user stats updater
        ├── mailgun.ts              # Transactional email
        └── youtube.ts              # YouTube metadata fetch
```

---

## Security

- **Helmet** — sets secure HTTP headers
- **CORS** — restricted to `ALLOWED_ORIGINS` in production, open in development
- **Global rate limit** — 1000 requests / 15 min per IP
- **AI endpoint rate limits** — tighter limits on `/recipes/suggest` (10/15 min) and `/recipes/images` (5/15 min)
- **Admin routes** — protected by `x-api-key` header
- **User routes** — protected by JWT; tokens expire after 7 days
- **Password hashing** — bcrypt with cost factor 12

## Logging

Pino structured logging throughout:
- **Development** — `debug` level, pretty-printed via `pino-pretty`
- **Production** — `info` level, JSON output

## Background Jobs

Inngest handles async work that would block the request cycle:

| Function | Trigger | What it does |
|---|---|---|
| `update_influencer_food_youtube_details` | Influencer create | Fetches YouTube video title, thumbnail, and publish date for each food-video link; upserts `InfluencerFood` records |

- 3 automatic retries on failure
- Inspect and replay jobs in the Inngest dashboard
- Run `npm run inngest:start` in a separate terminal during development
