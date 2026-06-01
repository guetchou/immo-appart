#!/usr/bin/env bash
# =============================================================
# setup-vps.sh — Setup one-time de immo-appart sur le VPS OVH
# À exécuter UNE SEULE FOIS en tant que root sur le VPS.
# Ne touche PAS aux autres projets existants.
# =============================================================
set -euo pipefail

REPO="https://github.com/guetchou/immo-appart.git"
DIR="/opt/immo-appart"

echo "→ Clonage du dépôt dans $DIR"
if [ -d "$DIR/.git" ]; then
  echo "  Déjà cloné, pull uniquement"
  git -C "$DIR" pull origin main
else
  git clone "$REPO" "$DIR"
fi

# ── Base de données ─────────────────────────────────────────
echo "→ Création de la base PostgreSQL de production"
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ndombi_user') THEN
    CREATE USER ndombi_user WITH PASSWORD 'NdombiSecurePROD2025!';
  END IF;
END$$;
SELECT 'CREATE DATABASE immo_ndombi_prod OWNER ndombi_user'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'immo_ndombi_prod')\gexec
GRANT ALL PRIVILEGES ON DATABASE immo_ndombi_prod TO ndombi_user;
SQL

# ── .env backend ────────────────────────────────────────────
echo "→ Création du .env backend (si absent)"
BACKEND_ENV="$DIR/backend/.env"
if [ ! -f "$BACKEND_ENV" ]; then
  APP_KEYS=$(node -e "const c=require('crypto');console.log([1,2,3,4].map(()=>c.randomBytes(16).toString('base64')).join(','))")
  API_TOKEN_SALT=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  ADMIN_JWT=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  TRANSFER_SALT=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

  cat > "$BACKEND_ENV" <<EOF
HOST=0.0.0.0
PORT=1337
APP_KEYS=$APP_KEYS
API_TOKEN_SALT=$API_TOKEN_SALT
ADMIN_JWT_SECRET=$ADMIN_JWT
JWT_SECRET=$JWT_SECRET
TRANSFER_TOKEN_SALT=$TRANSFER_SALT
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=immo_ndombi_prod
DATABASE_USERNAME=ndombi_user
DATABASE_PASSWORD=NdombiSecurePROD2025!
DATABASE_SSL=false
NODE_ENV=production
EOF
  echo "  .env backend créé"
else
  echo "  .env backend déjà présent — non modifié"
fi

# ── .env frontend ────────────────────────────────────────────
echo "→ Création du .env frontend (si absent)"
FRONTEND_ENV="$DIR/frontend/.env.local"
if [ ! -f "$FRONTEND_ENV" ]; then
  cat > "$FRONTEND_ENV" <<EOF
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=
NEXT_PUBLIC_SITE_URL=https://residencendombi.cg
NODE_ENV=production
EOF
  echo "  .env frontend créé"
else
  echo "  .env frontend déjà présent — non modifié"
fi

# ── Install & Build Backend ─────────────────────────────────
echo "→ Install backend"
cd "$DIR/backend"
npm ci --omit=dev
npm run build

# ── Install & Build Frontend ────────────────────────────────
echo "→ Install & build frontend"
cd "$DIR/frontend"
npm ci --omit=dev
npm run build

# ── PM2 ─────────────────────────────────────────────────────
echo "→ Démarrage avec PM2"
npm install -g pm2 2>/dev/null || true
pm2 start "$DIR/backend/ecosystem.config.js"  --env production
pm2 start "$DIR/frontend/ecosystem.config.js" --env production
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo ""
echo "✅ Setup terminé !"
echo "   Backend  → http://localhost:1337/admin"
echo "   Frontend → http://localhost:3000"
echo ""
echo "   Configurez ensuite Nginx (voir scripts/nginx-ndombi.conf)"
