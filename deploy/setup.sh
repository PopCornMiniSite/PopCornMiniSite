#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

print_banner() {
  echo ""
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║        PopCorn Mini — Setup              ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo ""
}

check_prereqs() {
  local missing=0

  command -v node  >/dev/null 2>&1 && echo "  ✓ node $(node --version)"    || { echo "  ✗ node — install from https://nodejs.org";  missing=1; }
  command -v npm   >/dev/null 2>&1 && echo "  ✓ npm $(npm --version)"      || { echo "  ✗ npm";                                    missing=1; }
  command -v go    >/dev/null 2>&1 && echo "  ✓ go $(go version | awk '{print $3}')"  || { echo "  ✗ go — install from https://go.dev";      missing=1; }
  command -v python3 >/dev/null 2>&1 && echo "  ✓ python3 $(python3 --version | awk '{print $2}')" || { echo "  ✗ python3"; missing=1; }
  command -v docker >/dev/null 2>&1 && echo "  ✓ docker $(docker --version | awk '{print $3}')"   || { echo "  ✗ docker — install from https://docker.com"; missing=1; }

  if [ $missing -ne 0 ]; then
    echo ""
    echo "  Install missing prerequisites and re-run this script."
    exit 1
  fi
}

setup_frontend() {
  echo ""
  echo "  → Installing frontend dependencies..."
  npm install
}

setup_archive_bot() {
  echo ""
  echo "  → Installing archive-bot Python dependencies..."
  if [ -d .venv ]; then
    echo "  Virtual environment already exists, activating..."
    source .venv/bin/activate
  else
    python3 -m venv .venv
    source .venv/bin/activate
  fi
  pip install --upgrade pip -q
  pip install -r archive-bot/requirements.txt -q
}

copy_env_files() {
  local copied=0

  if [ ! -f stream-bot/fsb.env ]; then
    cp tg-filestreambot/fsb.sample.env stream-bot/fsb.env
    echo "  ✎ Created stream-bot/fsb.env — edit with your credentials"
    copied=1
  else
    echo "  ✓ stream-bot/fsb.env exists"
  fi

  if [ ! -f archive-bot/.env ]; then
    cp archive-bot/.env.example archive-bot/.env
    echo "  ✎ Created archive-bot/.env — edit with your credentials"
    copied=1
  else
    echo "  ✓ archive-bot/.env exists"
  fi

  if [ ! -f frontend/.env ]; then
    if [ -f frontend/.env.example ]; then
      cp frontend/.env.example frontend/.env
    else
      cat > frontend/.env <<EOF
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STREAM_BOT_URL=http://localhost:8080
VITE_TMDB_API_KEY=your_tmdb_api_key
EOF
      echo "  ✎ Created frontend/.env — edit with your credentials"
    fi
    copied=1
  else
    echo "  ✓ frontend/.env exists"
  fi

  if [ $copied -ne 0 ]; then
    echo ""
    echo "  ⚠  Fill in the created .env files before running the project."
  fi
}

create_directories() {
  mkdir -p logs data
  echo "  ✓ Created logs/ and data/ directories"
}

run_database_migrations() {
  echo ""
  echo "  → Database migrations:"

  if command -v supabase >/dev/null 2>&1; then
    echo "    Running Supabase migrations..."
    (cd supabase && supabase db push 2>/dev/null) && echo "    ✓ Supabase up to date" || echo "    ⚠  Supabase CLI not linked — run 'supabase link' first"
  else
    echo "    ⚠  Supabase CLI not found — install with: npm install -g supabase"
  fi

  if [ -n "${TURSO_DB_URL:-}" ] || [ -f archive-bot/.env ]; then
    echo "    Turso schema is applied automatically at archive-bot startup"
  else
    echo "    ⚠  Set TURSO_DB_URL in archive-bot/.env for Turso"
  fi
}

print_success() {
  echo ""
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║   Setup Complete 🍿                      ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo ""
  echo "  Start development:"
  echo "    npm run dev:frontend     — Vite dev server  → http://localhost:5173"
  echo "    npm run dev:stream       — TG-FileStreamBot → http://localhost:8080"
  echo "    npm run dev:archive      — Archive Bot"
  echo ""
  echo "  Production:"
  echo "    docker compose -f deploy/docker-compose.yml up -d"
  echo ""
  echo "  Deploy:"
  echo "    npm run deploy:frontend  → Vercel"
  echo "    npm run deploy:stream    → Hugging Face Spaces"
  echo "    npm run deploy:archive   → Hugging Face Spaces"
  echo ""
}

print_banner
check_prereqs
setup_frontend
setup_archive_bot
copy_env_files
create_directories
run_database_migrations
print_success
