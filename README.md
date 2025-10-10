# Food Center API

A comprehensive backend API for a food discovery platform that highlights the richness and diversity of African cuisine. It showcases foods across Africa and provides video recipes from top food influencers. Users can browse, search, and filter foods by country or region, and discover recipe videos from their favorite influencers.

### Status

✅ **Active Development** - Core features implemented with background processing and video integration

## Tech Stack

- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- Zod (validation)
- Multer (file uploads)
- Cloudinary (media hosting)
- Helmet + CORS (security)
- **Inngest** (background job processing)
- **Redis** (caching)
- **YouTube API** (video metadata extraction)
- **ESLint** (code quality)

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB database (Atlas or local)
- Cloudinary account (for media uploads)
- Redis server (for caching)
- Google YouTube API key (for video metadata)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example` in the project root.

Required variables:

- `MONGODB_URI` – MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` – Cloudinary cloud name
- `CLOUDINARY_API_KEY` – Cloudinary API key
- `CLOUDINARY_API_SECRET` – Cloudinary API secret
- `REDIS_URL` – Redis connection string
- `GOOGLE_YOUTUBE_API_KEY` – YouTube API key for video metadata

Cloudinary is configured in `config/cloudinary/index.ts`, MongoDB is initialized in `config/db/index.ts`, and Redis is configured in `utils/services/redis.ts`.

### Running the project

- Development (nodemon + ts-node):

```bash
npm run dev
```

- Build TypeScript:

```bash
npm run build
```

- Start Inngest Dev Server (for background jobs):

```bash
npm run inngest:start
```

- Run ESLint:

```bash
npm run lint
```

The server starts on port `3000` by default. Base path for APIs: `/api/v1`. Inngest dev server runs on port `8288`.

## Project Structure

```
/ (repo root)
├─ index.ts                       # App bootstrap, middleware, route mounting
├─ config/
│  ├─ db/                         # DB connection and Mongoose models
│  │  ├─ index.ts
│  │  └─ models/
│  │     ├─ FoodModel.ts
│  │     ├─ InfluencerModel.ts
│  │     └─ InfluencerFoodModel.ts
│  ├─ cloudinary/
│  │  └─ index.ts                 # Cloudinary configuration
│  └─ zod/
│     └─ schemas/
│        ├─ food.ts               # Food validation schemas
│        └─ influencer.ts         # Influencer validation schemas
├─ inngest/                       # Background job processing
│  ├─ index.ts                   # Inngest client configuration
│  └─ functions/
│     └─ index.ts                # Background job functions
├─ src/
│  ├─ routes/
│  │  └─ index.ts                 # Aggregates module routes under /api/v1
│  └─ modules/
│     ├─ food/                   # Food management module
│     │  ├─ route.ts
│     │  ├─ controller/
│     │  │  ├─ controller.ts
│     │  │  └─ Icontroller.ts
│     │  ├─ middleware/
│     │  │  ├─ middleware.ts
│     │  │  └─ Imiddleware.ts
│     │  └─ service/
│     │     ├─ service.ts
│     │     └─ Iservice.ts
│     ├─ influencer/             # Influencer management module
│     │  ├─ route.ts
│     │  ├─ controller/
│     │  │  ├─ controller.ts
│     │  │  └─ Icontroller.ts
│     │  ├─ middleware/
│     │  │  ├─ middleware.ts
│     │  │  └─ Imiddleware.ts
│     │  └─ service/
│     │     ├─ service.ts
│     │     └─ Iservice.ts
│     └─ upload/                 # File upload module
│        ├─ route.ts
│        ├─ controller/
│        │  ├─ controller.ts
│        │  └─ Icontroller.ts
│        └─ middleware.ts
├─ utils/
│  ├─ services/
│  │  ├─ helpers.ts              # Utility functions (YouTube ID extraction)
│  │  ├─ redis.ts                # Redis client and operations
│  │  └─ youtube.ts              # YouTube API integration
│  ├─ tryCatchHelper.ts          # Error handling wrapper
│  └─ types/
│     └─ InfluencerTypes.ts      # TypeScript type definitions
├─ eslint.config.mts            # ESLint configuration
└─ tsconfig.json
```

## API

Base URL: `http://localhost:3000/api/v1`

### Foods

- GET `/foods`
  - Query: `page` (number, default 1), `limit` (number, default 10), `search` (string), `country` (string), `region` (string)
  - Response: `{ foods: Food[], totalpages, page, totalItems }`
- GET `/foods`
  - Non-paginated version for dropdowns/selects
- GET `/foods/:id`
  - Get a single food by ID
- POST `/foods`
  - Body: JSON matching `Food` schema (validated server-side)
  - Creates a new food
- PUT `/foods/:id`
  - Body: Partial `Food` fields
  - Updates a food
- DELETE `/foods/:id`
  - Deletes a food and associated influencer relationships
- GET `/foods/:id/influencers`
  - List influencers associated with a food
- GET `/foods/:id/videos`
  - List recipe videos associated with a food

### Influencers

- GET `/influencers`
  - List all influencers
- GET `/influencers/:id`
  - Get a single influencer by ID
- POST `/influencers`
  - Body: JSON with influencer data and associated food links
  - Creates a new influencer and triggers background job to process YouTube videos
- PUT `/influencers/:id`
  - Body: Partial influencer fields
  - Updates an influencer
- DELETE `/influencers/:id`
  - Deletes an influencer

### Uploads

- POST `/upload`
  - Form-data: single file under field name `imageUrl`
  - Uploads to Cloudinary and returns upload information

## Background Jobs (Inngest)

The platform uses Inngest for background job processing:

- **YouTube Video Processing**: When an influencer is created with food links containing YouTube URLs, a background job automatically:
  - Extracts video metadata (title, thumbnail, publish date)
  - Creates `InfluencerFood` records linking foods to influencers
  - Handles errors gracefully with retry logic

## Data Models (high level)

- `Food` – Core entity for a dish, with fields such as name, country, region, description, image, etc.
- `Influencer` – Creator or chef with profile and social media links
- `InfluencerFood` – Mapping of `Food` to `Influencer` with video metadata (URL, title, thumbnail, publish date)

See `config/db/models/*` for actual schemas and `utils/types/InfluencerTypes.ts` for TypeScript definitions.

## Validation

- Zod schemas in `config/zod/schemas/` for both food and influencer validation
- Request validation middleware in respective module middleware files
- TypeScript interfaces in `utils/types/InfluencerTypes.ts`

## Caching & Performance

- **Redis Integration**: Caching layer for improved performance
- **Background Processing**: Heavy operations (YouTube API calls) handled asynchronously
- **Error Handling**: Comprehensive error handling with try-catch wrappers

## Security & Middleware

- `helmet` and `cors` enabled globally
- `express.json` and `express.urlencoded` enabled

## Scripts

- `dev` – start development server with `nodemon` and `ts-node`
- `build` – compile TypeScript to `dist`
- `inngest:start` – start Inngest dev server for background job processing
- `lint` – run ESLint for code quality checks

## Contributing

1. Fork and clone the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Set up `.env`
5. Run locally: `npm run dev`
6. Open a PR with a clear description and screenshots where relevant

## Features Implemented ✅

- ✅ Food CRUD operations with pagination
- ✅ Food filtering by country/region and text search
- ✅ Influencer CRUD operations
- ✅ YouTube video metadata extraction
- ✅ Background job processing with Inngest
- ✅ Redis caching integration
- ✅ File uploads to Cloudinary
- ✅ Comprehensive error handling
- ✅ TypeScript type safety
- ✅ ESLint code quality checks

## Roadmap

- 🔄 Authentication for admin curation
- 🔄 Rate limiting and request logging
- 🔄 Advanced search and filtering
- 🔄 Video thumbnail optimization
- 🔄 API documentation with Swagger
- 🔄 Unit and integration tests
- 🔄 Docker containerization
- 🔄 CI/CD pipeline setup

## License

ISC
