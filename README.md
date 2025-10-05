# Food Center API

A backend API for a food discovery platform that highlights the richness and diversity of African cuisine. It showcases foods across Africa and provides video recipes from top food influencers. Users can browse, search, and filter foods by country or region, and filter recipe videos by influencer.

### Status

Currently in planning phase. Initial scaffolding for API, models, and upload is present.

## Tech Stack

- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- Zod (validation)
- Multer (file uploads)
- Cloudinary (media hosting)
- Helmet + CORS (security)

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB database (Atlas or local)
- Cloudinary account (for media uploads)

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

Cloudinary is configured in `config/cloudinary/index.ts`, and MongoDB is initialized in `config/db/index.ts`.

### Running the project

- Development (nodemon + ts-node):

```bash
npm run dev
```

- Build TypeScript:

```bash
npm run build
```

The server starts on port `3000` by default. Base path for APIs: `/api/v1`.

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
│     └─ schemas/food.ts          # Zod schemas for validation
├─ src/
│  ├─ routes/
│  │  └─ index.ts                 # Aggregates module routes under /api/v1
│  └─ modules/
│     ├─ food/
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
│     └─ upload/
│        ├─ route.ts
│        ├─ controller/
│        │  ├─ controller.ts
│        │  └─ Icontroller.ts
│        └─ middleware.ts
└─ tsconfig.json
```

## API

Base URL: `http://localhost:3000/api/v1`

### Foods

- GET `/foods`
  - Query: `page` (number, default 1), `limit` (number, default 10)
  - Response: `{ data: Food[], totalpages, page, totalItems }`
- GET `/foods/:id`
  - Get a single food by ID
- POST `/foods`
  - Body: JSON matching `Food` schema (validated server-side)
  - Creates a new food
- PUT `/foods/:id`
  - Body: Partial `Food` fields
  - Updates a food
- DELETE `/foods/:id`
  - Deletes a food
- GET `/foods/:id/influencers`
  - List influencers associated with a food
- GET `/foods/:id/videos`
  - List recipe videos associated with a food

Note: Filtering by country/region and text search are part of the product vision and may be implemented via query params on `/foods` (e.g., `?country=NG&region=West&search=jollof`) in upcoming iterations.

### Uploads

- POST `/upload`
  - Form-data: single file under field name `imageUrl`
  - Uploads to Cloudinary and returns upload information

## Data Models (high level)

- `Food` – Core entity for a dish, with fields such as name, country, region, description, image, etc.
- `Influencer` – Creator or chef with profile and channel links
- `InfluencerFood` – Mapping of `Food` to `Influencer` with video metadata (e.g., URL, platform)

See `config/db/models/*` for actual schemas.

## Validation

- Zod schemas in `config/zod/schemas/food.ts`
- Request validation middleware in `src/modules/food/middleware/middleware.ts`

## Security & Middleware

- `helmet` and `cors` enabled globally
- `express.json` and `express.urlencoded` enabled

## Scripts

- `dev` – start development server with `nodemon` and `ts-node`
- `build` – compile TypeScript to `dist`

## Contributing

1. Fork and clone the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Set up `.env`
5. Run locally: `npm run dev`
6. Open a PR with a clear description and screenshots where relevant

## Roadmap

- Food list filtering by country/region
- Full-text search across food names/descriptions
- Influencer-based filtering on food detail
- Pagination and sorting improvements
- Authentication for admin curation
- Rate limiting and request logging

## License

ISC
