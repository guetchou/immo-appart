#!/usr/bin/env bash
# ============================================================
# Bootstrap VPS OVH production — Résidence NDOMBI
# Serveur : 5.196.22.149 (Nginx, partagé avec d'autres projets)
# Usage   : bash setup-prod.sh
# ============================================================
set -euo pipefail

REPO="https://github.com/guetchou/immo-appart.git"
APP_DIR="/opt/immo-appart"
DB_NAME="immo_ndombi"
DB_USER="ndombi_user"
NEXT_PORT="3001"
STRAPI_PORT="1337"
DOMAIN="residencendombi.lvaclean.cg"

echo "╔══════════════════════════════════════════════════════╗"
echo "║     Setup VPS Production — Résidence NDOMBI          ║"
echo "║     Serveur : 5.196.22.149 (Nginx)                   ║"
echo "╚══════════════════════════════════════════════════════╝"

# ── Vérifications préalables ──────────────────────────────
if ! command -v nginx &>/dev/null; then
  echo "❌ Nginx non trouvé — ce script requiert Nginx"
  exit 1
fi
echo "✔ Nginx $(nginx -v 2>&1 | grep -o '[0-9.]*$') détecté"

# ── 1. Dépendances système ────────────────────────────────
echo ""
echo "▶ 1/8 — Dépendances"
apt-get update -qq
apt-get install -y -qq git curl wget gnupg2 ca-certificates \
  postgresql postgresql-contrib certbot python3-certbot-nginx

# ── 2. Node.js 22 ─────────────────────────────────────────
echo ""
echo "▶ 2/8 — Node.js 22"
NODE_VER=$(node -e "process.stdout.write(process.version.split('.')[0].slice(1))" 2>/dev/null || echo "0")
if [ "$NODE_VER" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  echo "   Node.js installé : $(node -v)"
else
  echo "   Node.js déjà OK : $(node -v)"
fi
npm install -g pm2 2>/dev/null || true

# ── 3. PostgreSQL ─────────────────────────────────────────
echo ""
echo "▶ 3/8 — PostgreSQL"
systemctl enable postgresql && systemctl start postgresql

CREDS_FILE="/root/.ndombi-credentials"
if [ ! -f "$CREDS_FILE" ]; then
  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')
  printf "DB_PASSWORD=%s\n" "$DB_PASS" > "$CREDS_FILE"
  chmod 600 "$CREDS_FILE"
else
  source "$CREDS_FILE"
  DB_PASS="$DB_PASSWORD"
fi

sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
echo "   PostgreSQL OK — DB: $DB_NAME"

# ── 4. Clone ──────────────────────────────────────────────
echo ""
echo "▶ 4/8 — Code source"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin main
  echo "   Dépôt mis à jour"
else
  git clone "$REPO" "$APP_DIR"
  echo "   Dépôt cloné"
fi

# ── 5. Variables d'environnement ──────────────────────────
echo ""
echo "▶ 5/8 — Variables d'environnement"
source "$CREDS_FILE"

if [ ! -f "$APP_DIR/backend/.env" ]; then
  cat > "$APP_DIR/backend/.env" << ENVEOF
HOST=0.0.0.0
PORT=$STRAPI_PORT
APP_KEYS=$(openssl rand -base64 16),$(openssl rand -base64 16),$(openssl rand -base64 16),$(openssl rand -base64 16)
API_TOKEN_SALT=$(openssl rand -base64 32)
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=$DB_NAME
DATABASE_USERNAME=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_SSL=false
NODE_ENV=production
ENVEOF
  echo "   backend/.env créé"
fi

if [ ! -f "$APP_DIR/frontend/.env.production" ]; then
  cat > "$APP_DIR/frontend/.env.production" << ENVEOF
NEXT_PUBLIC_STRAPI_URL=http://5.196.22.149:$STRAPI_PORT
STRAPI_API_TOKEN=REMPLACER_APRES_CREATION_TOKEN_STRAPI
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
PREVIEW_SECRET=$(openssl rand -hex 32)
REVALIDATION_SECRET=$(openssl rand -hex 32)
FROM_EMAIL=reservations@residencendombi.cg
OWNER_EMAIL=residencendombi@gmail.com
ENVEOF
  echo "   frontend/.env.production créé"
  echo "   ⚠️  STRAPI_API_TOKEN à renseigner après le 1er démarrage Strapi"
fi

# ── 6. Installation npm ───────────────────────────────────
echo ""
echo "▶ 6/8 — npm install"
cd "$APP_DIR/backend"  && npm ci --omit=dev
cd "$APP_DIR/frontend" && npm ci --omit=dev

# ── 7. Build ──────────────────────────────────────────────
echo ""
echo "▶ 7/8 — Build"
echo "   → Strapi..."
cd "$APP_DIR/backend" && NODE_ENV=production npm run build
echo "   → Next.js..."
cd "$APP_DIR/frontend" && NODE_ENV=production npm run build

# ── 8. PM2 ───────────────────────────────────────────────
echo ""
echo "▶ 8/8 — PM2"

# Adapter ecosystem.config.js pour ce serveur
cat > "$APP_DIR/ecosystem.config.js" << 'PMEOF'
module.exports = {
  apps: [
    {
      name:        'ndombi-strapi',
      cwd:         '/opt/immo-appart/backend',
      script:      'npm',
      args:        'run start',
      env: { NODE_ENV: 'production', PORT: '1337' },
      instances:   1,
      autorestart: true,
      watch:       false,
      max_memory_restart: '800M',
      error_file:  '/var/log/pm2/ndombi-strapi-error.log',
      out_file:    '/var/log/pm2/ndombi-strapi-out.log',
    },
    {
      name:        'ndombi-nextjs',
      cwd:         '/opt/immo-appart/frontend',
      script:      'npm',
      args:        'run start -- -p 3001',
      env: { NODE_ENV: 'production', PORT: '3001' },
      instances:   1,
      autorestart: true,
      watch:       false,
      max_memory_restart: '600M',
      error_file:  '/var/log/pm2/ndombi-nextjs-error.log',
      out_file:    '/var/log/pm2/ndombi-nextjs-out.log',
    },
  ],
}
PMEOF

mkdir -p /var/log/pm2

# Démarrer ou redémarrer les apps ndombi (pas les autres PM2)
if pm2 list | grep -q "ndombi-"; then
  pm2 restart ndombi-strapi 2>/dev/null || true
  pm2 restart ndombi-nextjs 2>/dev/null || true
else
  pm2 start "$APP_DIR/ecosystem.config.js"
fi
pm2 save
systemctl enable pm2-root 2>/dev/null || pm2 startup systemd -u root --hp /root 2>/dev/null || true

# ── Nginx vhost (ne touche pas les configs existantes) ────
NGINX_CONF="/etc/nginx/sites-available/ndombi.conf"

# Sauvegarde si déjà existant
[ -f "$NGINX_CONF" ] && cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%Y%m%d_%H%M%S)"

cat > "$NGINX_CONF" << NGINXEOF
# Résidence NDOMBI — Next.js frontend
server {
    listen 80;
    server_name $DOMAIN residencendombi.cg www.residencendombi.cg;

    # Proxy vers Next.js
    location / {
        proxy_pass         http://127.0.0.1:$NEXT_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Next.js static assets — cache long
    location /_next/static/ {
        proxy_pass http://127.0.0.1:$NEXT_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    access_log /var/log/nginx/ndombi-access.log;
    error_log  /var/log/nginx/ndombi-error.log;
}
NGINXEOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/ndombi.conf
nginx -t && systemctl reload nginx
echo "   Nginx rechargé ✔"

# ── Vérifications finales ─────────────────────────────────
echo ""
sleep 5
STRAPI_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$STRAPI_PORT/api/navigation 2>/dev/null || echo "000")
NEXT_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$NEXT_PORT/ 2>/dev/null || echo "000")

echo "  Strapi  :$STRAPI_PORT → HTTP $STRAPI_OK"
echo "  Next.js :$NEXT_PORT → HTTP $NEXT_OK"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✅  Bootstrap terminé !                            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Site         : http://$DOMAIN"
echo "  IP directe   : http://5.196.22.149"
echo "  Strapi admin : http://5.196.22.149:$STRAPI_PORT/admin"
echo ""
echo "  Étapes suivantes :"
echo "  1. Créer le compte admin Strapi → http://5.196.22.149:$STRAPI_PORT/admin"
echo "  2. Créer un API Token (Full Access)"
echo "  3. nano $APP_DIR/frontend/.env.production"
echo "     → Remplacer STRAPI_API_TOKEN=REMPLACER_... par le vrai token"
echo "  4. pm2 restart ndombi-nextjs && pm2 save"
echo "  5. SSL : certbot --nginx -d $DOMAIN"
echo ""
echo "  Credentials DB : cat /root/.ndombi-credentials"
