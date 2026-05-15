# PopCorn Mini — Deployment

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    nginx (port 80/443)               │
│  / → static frontend (dist/)                        │
│  /stream/* → stream-bot:8080                        │
│  /api/archive/* → archive-bot:8081                  │
│  /api/* → Supabase                                  │
│  /realtime/* → Supabase WebSocket                    │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

| Tool     | Version      | Install                                      |
| -------- | ------------ | -------------------------------------------- |
| Node.js  | ≥ 20         | https://nodejs.org                           |
| Go       | ≥ 1.22       | https://go.dev                               |
| Python   | ≥ 3.11       | https://python.org                           |
| Docker   | ≥ 24         | https://docker.com                           |
| Supabase | latest (CLI) | `npm install -g supabase`                    |

## Environment Setup

Each component needs its own `.env` file:

### 1. Stream Bot (`stream-bot/fsb.env`)

```bash
cp tg-filestreambot/fsb.sample.env stream-bot/fsb.env
```

Required: `API_ID`, `API_HASH`, `BOT_TOKEN`, `LOG_CHANNEL`

### 2. Archive Bot (`archive-bot/.env`)

```bash
cp archive-bot/.env.example archive-bot/.env
```

Required: `API_ID`, `API_HASH`, `BOT_TOKEN`, `ADMIN_ID`, `TMDB_API_KEY`, `TURSO_DB_URL`, `LOG_CHANNEL_ID`

### 3. Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STREAM_BOT_URL=http://localhost:8080
VITE_TMDB_API_KEY=your-tmdb-api-key
```

## Running Locally

### With Docker Compose

```bash
docker compose -f deploy/docker-compose.yml up -d
```

### Without Docker (development)

```bash
# Terminal 1 — Stream Bot
npm run dev:stream

# Terminal 2 — Archive Bot
npm run dev:archive

# Terminal 3 — Frontend
npm run dev:frontend
```

## Database Migrations

### Supabase

```bash
supabase link --project-ref <ref>
supabase db push
```

The schema is in `supabase/schema.sql` — run it against your Supabase project.

### Turso

The archive bot applies its schema on startup. To run manually:

```bash
turso db shell <db-name> < turso/schema.sql
```

## Deploying to Hugging Face Spaces

### Stream Bot

1. Create a Space at https://huggingface.co/new-space with **Docker** SDK
2. Upload the `deploy/` folder (or point to your repo)
3. Set Space secrets:
   - `API_ID`, `API_HASH`, `BOT_TOKEN`, `LOG_CHANNEL`, `HASH_LENGTH`
   - `MULTI_TOKEN1` through `MULTI_TOKEN10` (optional)
4. The `huggingface.yml` configures the Docker build automatically
5. Space will build using `deploy/Dockerfile.stream`

### Archive Bot

1. Create a **Docker** Space
2. Set secrets for all `archive-bot/.env` values
3. The existing `archive-bot/Dockerfile` will be used

## Deploying Frontend to Vercel

```bash
npm run deploy:frontend
```

This runs `npx vercel --prod`. Alternatively:

1. Push to GitHub
2. Import repo at https://vercel.com/new
3. Set framework to **Vite**
4. Set environment variables (VITE_SUPABASE_URL, etc.)
5. Deploy

The `deploy/vercel.json` rewrites all non-asset routes to `/index.html` for SPA support.

## First-Time Setup Checklist

- [ ] Node.js, Go, Python 3, Docker installed
- [ ] Telegram API credentials obtained (my.telegram.org)
- [ ] Bot tokens created (t.me/BotFather)
- [ ] TMDB API key obtained (themoviedb.org)
- [ ] Supabase project created
- [ ] Turso database created
- [ ] `.env` files populated
- [ ] Supabase schema applied
- [ ] Frontend builds: `npm run build:frontend`
- [ ] Stream bot starts: `npm run dev:stream`
- [ ] Archive bot starts: `npm run dev:archive`

## Directory Structure

```
deploy/
├── docker-compose.yml   # Multi-service orchestration
├── Dockerfile.stream    # Stream bot Docker build
├── huggingface.yml      # HF Spaces configuration
├── nginx.conf           # Reverse proxy config
├── vercel.json          # Vercel deployment config
├── README.md            # This file
└── setup.sh             # Automated setup script
```
