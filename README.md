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
- **Pino** (logging with pino-pretty)
- **Express Rate Limit** (API rate limiting)
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

Create a `.env` file in the project root with the following variables:

**Required variables:**

- `MONGODB_URI` – MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` – Cloudinary cloud name
- `CLOUDINARY_API_KEY` – Cloudinary API key
- `CLOUDINARY_API_SECRET` – Cloudinary API secret
- `REDIS_URL` – Redis connection string
- `GOOGLE_YOUTUBE_API_KEY` – YouTube API key for video metadata

**Optional variables:**

- `NODE_ENV` – Environment mode (`development` or `production`, defaults to `development`)
  - Set to `development` for debug-level logging and development features
  - Set to `production` for info-level logging

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
│  ├─ logger.ts                  # Pino logger configuration
│  └─ types/
│     ├─ FoodTypes.ts            # Food type definitions
│     └─ InfluencerTypes.ts      # Influencer type definitions
├─ eslint.config.mts            # ESLint configuration
└─ tsconfig.json
```

## API

Base URL: `http://localhost:3000/api/v1`

### Foods

- **GET `/foods`** (Paginated)
  - Query parameters:
    - `page` (number, default: 1) - Page number
    - `limit` (number, default: 10) - Items per page
    - `search` (string, optional) - Search by food name
    - `country` (string, optional) - Filter by country
    - `region` (string, optional) - Filter by region
  - Response: `{ foods: Food[], totalpages: number, page: number, totalItems: number }`
  - Cached in Redis for performance

- **GET `/foods/all/items/nonpaginated`** (Non-paginated)
  - Returns all foods without pagination (useful for dropdowns/selects)
  - Response: `Food[]`
  - Cached in Redis

- **GET `/foods/:id`**
  - Get a single food by MongoDB ObjectId
  - Response: `Food` object
  - Returns 404 if food doesn't exist

- **POST `/foods`**
  - Body: JSON object with required fields:
    - `name` (string, min 1 char) - Food name
    - `country` (string, min 1 char) - Country of origin
    - `region` (string, min 1 char) - Region within country
    - `culturalStory` (string, min 1 char) - Cultural background story
    - `description` (string, min 1 char) - Food description
    - `imageUrl` (string, min 1 char) - Image URL (use `/upload` endpoint)
    - `ingredients` (string[], min 1 item) - Array of ingredient names
  - Validates uniqueness of food name
  - Response: Created `Food` object (201 status)
  - Invalidates related Redis cache

- **PUT `/foods/:id`**
  - Body: Partial JSON object with any `Food` fields
  - Updates existing food
  - Validates food exists before update
  - Response: Updated `Food` object
  - Invalidates related Redis cache

- **DELETE `/foods/:id`**
  - Deletes a food by ID
  - Also deletes associated `InfluencerFood` relationships
  - Validates food exists before deletion
  - Response: Success message
  - Invalidates related Redis cache

- **GET `/foods/:id/influencers`**
  - List all influencers associated with a specific food
  - Response: Array of influencer objects

- **GET `/foods/:id/videos`**
  - List all recipe videos associated with a specific food
  - Response: Array of video objects with metadata (title, thumbnail, URL, publish date)

### Influencers

- **GET `/influencers`**
  - List all influencers (non-paginated)
  - Response: Array of `Influencer` objects
  - Cached in Redis

- **GET `/influencers/:id`**
  - Get a single influencer by MongoDB ObjectId
  - Response: `Influencer` object with populated data
  - Returns 404 if influencer doesn't exist
  - Cached in Redis

- **POST `/influencers`**
  - Body: JSON object with required and optional fields:
    - `name` (string, min 1 char, required) - Influencer name
    - `description` (string, min 1 char, required) - Influencer description
    - `imageUrl` (string, optional) - Profile image URL
    - `instagram`, `youtube`, `tiktok`, `facebook`, `twitter`, `snapchat`, `linkedin`, `website` (string, optional) - Social media links
    - `foodLinks` (array, required) - Array of objects with:
      - `foodId` (string, min 1 char) - MongoDB ObjectId of existing food
      - `videoUrls` (string[], min 1 item) - Array of YouTube video URLs
  - Validates uniqueness of influencer name
  - Validates that all foodIds exist
  - Creates influencer and triggers Inngest background job to process YouTube videos
  - Background job extracts video metadata (title, thumbnail, publish date) and creates `InfluencerFood` records
  - Response: Created `Influencer` object (201 status)
  - Invalidates related Redis cache

- **PUT `/influencers/:id`**
  - Body: Partial JSON object with any `Influencer` fields
  - Updates existing influencer
  - Validates influencer exists before update
  - Response: Updated `Influencer` object
  - Invalidates related Redis cache

- **DELETE `/influencers/:id`**
  - Deletes an influencer by ID
  - Also deletes associated `InfluencerFood` relationships
  - Validates influencer exists before deletion
  - Response: Success message
  - Invalidates related Redis cache

### Uploads

- **POST `/upload`**
  - Content-Type: `multipart/form-data`
  - Body: Form data with field name `imageUrl` containing a single image file
  - Uploads image to Cloudinary
  - Response: Cloudinary upload information including:
    - `secure_url` - HTTPS URL for the uploaded image
    - `public_id` - Cloudinary public ID
    - `format`, `width`, `height`, `bytes` - Image metadata
  - Use the returned `secure_url` as the `imageUrl` field when creating foods or influencers

## Background Jobs (Inngest)

The platform uses **Inngest** for asynchronous background job processing:

- **Inngest Endpoint**: `/api/inngest` - Webhook endpoint for Inngest to trigger functions
- **YouTube Video Processing**: 
  - Triggered automatically when an influencer is created with `foodLinks` containing YouTube URLs
  - Background job (`update_influencer_food_youtube_details`) processes videos asynchronously:
    1. Validates that all food IDs exist in the database
    2. Retrieves the created influencer by name
    3. For each food-video combination:
       - Extracts YouTube video ID from URL
       - Calls YouTube API to fetch metadata (title, thumbnail, publish date)
       - Creates `InfluencerFood` record with video metadata
  - **Error Handling**: 
    - Automatic retry logic (3 retries) for transient failures
    - Graceful error handling with step-by-step execution
    - Failed jobs can be inspected in Inngest dashboard
- **Development**: Run `npm run inngest:start` to start Inngest dev server (port 8288)
- **Production**: Configure Inngest sync URL in your Inngest dashboard

## Data Models

### Food Model
Core entity representing a dish from African cuisine:
- `name` (String, required) - Food name (must be unique)
- `country` (String, required) - Country of origin
- `region` (String, required) - Region within the country
- `culturalStory` (String, required) - Cultural background and history
- `description` (String, required) - Food description
- `imageUrl` (String, required) - URL to food image (Cloudinary)
- `ingredients` (String[], required) - Array of ingredient names
- `createdAt` (Date, auto) - Creation timestamp
- `updatedAt` (Date, auto) - Last update timestamp

### Influencer Model
Represents a food content creator or chef:
- `name` (String, required) - Influencer name (must be unique)
- `description` (String, required) - Influencer bio/description
- `imageUrl` (String, optional) - Profile image URL
- `instagram`, `youtube`, `tiktok`, `facebook`, `twitter`, `snapchat`, `linkedin`, `website` (String, optional) - Social media links
- `createdAt` (Date, auto) - Creation timestamp
- `updatedAt` (Date, auto) - Last update timestamp

### InfluencerFood Model
Junction table linking foods to influencers with video metadata:
- `influencer` (ObjectId, ref: Influencer, required) - Reference to influencer
- `food` (ObjectId, ref: Food, required) - Reference to food
- `videoUrl` (String, required) - YouTube video URL
- `videoId` (String, required) - Extracted YouTube video ID
- `videoTitle` (String, required) - Video title from YouTube API
- `videoThumbnailUrl` (String, required) - Video thumbnail URL from YouTube API
- `videoPublishedAt` (Date, required) - Video publish date from YouTube API
- `createdAt` (Date, auto) - Creation timestamp
- `updatedAt` (Date, auto) - Last update timestamp

See `config/db/models/*` for actual Mongoose schemas and `utils/types/*.ts` for TypeScript type definitions.

## Validation

- **Zod schemas** in `config/zod/schemas/` for request validation:
  - `food.ts` - Validates food creation/update requests
  - `influencer.ts` - Validates influencer creation/update requests
- **Request validation middleware** in respective module middleware files:
  - Validates request body against Zod schemas before processing
  - Returns 400 status with validation errors if invalid
- **Business logic validation**:
  - Uniqueness checks for food names and influencer names
  - Existence checks before update/delete operations
  - Food ID validation when creating influencer-food relationships
- **TypeScript interfaces** in `utils/types/` for type safety:
  - `FoodTypes.ts` - Food type definitions
  - `InfluencerTypes.ts` - Influencer and InfluencerFood type definitions

## Caching & Performance

- **Redis Integration**: 
  - Caching layer for frequently accessed data
  - Cache keys include: `foods:*`, `influencers:*`, `influencers:unpaginated`
  - Default TTL: 10 seconds (configurable in `utils/services/redis.ts`)
  - Cache invalidation on create/update/delete operations
  - Automatic cache refresh on cache miss

- **Background Processing**: 
  - Heavy operations (YouTube API calls) handled asynchronously via Inngest
  - Prevents blocking of API requests during video metadata extraction
  - Automatic retry logic (3 retries) for failed jobs

- **Error Handling**: 
  - Comprehensive error handling with `tryCatchHelper` wrapper
  - Structured error responses
  - Pino logger integration for error tracking

## Security & Middleware

- `helmet` and `cors` enabled globally
- `express.json` and `express.urlencoded` enabled
- **Rate limiting** enabled globally (100 requests per 15 minutes per IP)
- **Pino logger** for structured logging with environment-based log levels

## Logging

The application uses **Pino** for structured logging:

- **Development mode** (`NODE_ENV=development`): Debug-level logging with `pino-pretty` for readable console output
- **Production mode** (`NODE_ENV=production`): Info-level logging for performance
- Logs include contextual information (request IDs, operation details, error stacks)
- Logger is available via `utils/logger.ts` and used throughout controllers and services
- Structured logging format enables easy parsing and analysis

## Scripts

- `dev` – start development server with `nodemon` and `ts-node` (auto-reload on file changes)
- `build` – compile TypeScript to `dist` directory
- `inngest:start` – start Inngest dev server for background job processing (runs on port 8288)
- `lint` – run ESLint for code quality checks
- `lint:fix` – run ESLint and automatically fix fixable issues

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
- ✅ **Pino structured logging** with environment-based levels
- ✅ **API rate limiting** (100 requests per 15 minutes)

## Roadmap

- 🔄 Authentication for admin curation
- 🔄 Advanced search and filtering
- 🔄 Video thumbnail optimization
- 🔄 API documentation with Swagger
- 🔄 Unit and integration tests
- 🔄 Docker containerization
- 🔄 CI/CD pipeline setup
- 🔄 Request logging middleware
- 🔄 Health check endpoints

## License

ISC
