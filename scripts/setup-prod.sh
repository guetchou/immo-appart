#!/usr/bin/env bash
# ============================================================
# Bootstrap VPS OVH production — Résidence NDOMBI
# Serveur : 5.196.22.149
# Usage   : bash setup-prod.sh
# ============================================================
set -euo pipefail

REPO="https://github.com/guetchou/immo-appart.git"
APP_DIR="/opt/immo-appart"
DB_NAME="immo_ndombi"
DB_USER="ndombi_user"
PROD_HOST="residencendombi.lvaclean.cg"

echo "╔══════════════════════════════════════════════════════╗"
echo "║     Setup VPS Production — Résidence NDOMBI          ║"
echo "╚══════════════════════════════════════════════════════╝"

# ── 1. Dépendances système ────────────────────────────────
echo ""
echo "▶ 1/8 — Mise à jour système & dépendances"
apt-get update -qq
apt-get install -y -qq git curl wget gnupg2 ca-certificates \
  apache2 postgresql postgresql-contrib lsb-release

# ── 2. Node.js 22 via nvm ─────────────────────────────────
echo ""
echo "▶ 2/8 — Node.js 22"
if ! command -v node &>/dev/null || [[ $(node -e "process.stdout.write(process.version.split('.')[0].slice(1))") -lt 22 ]]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install 22
  nvm alias default 22
  nvm use 22
else
  echo "   Node.js déjà installé : $(node -v)"
fi

# PM2 global
npm install -g pm2 2>/dev/null || true
echo "   PM2 : $(pm2 -v)"

# ── 3. PostgreSQL ─────────────────────────────────────────
echo ""
echo "▶ 3/8 — PostgreSQL"
systemctl enable postgresql && systemctl start postgresql

# Mot de passe sécurisé si pas encore créé
CREDS_FILE="/root/.ndombi-credentials"
if [ ! -f "$CREDS_FILE" ]; then
  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')
  echo "DB_PASSWORD=$DB_PASS" > "$CREDS_FILE"
  chmod 600 "$CREDS_FILE"
  echo "   Credentials sauvegardés dans $CREDS_FILE"
else
  source "$CREDS_FILE"
  DB_PASS="$DB_PASSWORD"
  echo "   Credentials existants chargés"
fi

# Créer DB et utilisateur si pas existants
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
echo "   PostgreSQL OK — DB: $DB_NAME"

# ── 4. Clone du dépôt ─────────────────────────────────────
echo ""
echo "▶ 4/8 — Clone du dépôt"
if [ -d "$APP_DIR/.git" ]; then
  echo "   Dépôt existant — pull"
  cd "$APP_DIR" && git pull origin main
else
  git clone "$REPO" "$APP_DIR"
fi

# ── 5. Variables d'environnement ──────────────────────────
echo ""
echo "▶ 5/8 — Fichiers .env"

source "$CREDS_FILE"

# Backend .env (si absent)
if [ ! -f "$APP_DIR/backend/.env" ]; then
  APP_KEY1=$(openssl rand -base64 16)
  APP_KEY2=$(openssl rand -base64 16)
  APP_KEY3=$(openssl rand -base64 16)
  APP_KEY4=$(openssl rand -base64 16)
  ADMIN_JWT=$(openssl rand -base64 32)
  JWT_SEC=$(openssl rand -base64 32)
  API_SALT=$(openssl rand -base64 32)
  TRANSFER_SALT=$(openssl rand -base64 32)

  cat > "$APP_DIR/backend/.env" << ENVEOF
HOST=0.0.0.0
PORT=1337
APP_KEYS=$APP_KEY1,$APP_KEY2,$APP_KEY3,$APP_KEY4
API_TOKEN_SALT=$API_SALT
ADMIN_JWT_SECRET=$ADMIN_JWT
TRANSFER_TOKEN_SALT=$TRANSFER_SALT
JWT_SECRET=$JWT_SEC
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
else
  echo "   backend/.env existant — conservé"
fi

# Frontend .env.production (si absent)
if [ ! -f "$APP_DIR/frontend/.env.production" ]; then
  # Token API Strapi — sera généré après le 1er démarrage
  cat > "$APP_DIR/frontend/.env.production" << ENVEOF
NEXT_PUBLIC_STRAPI_URL=http://5.196.22.149:1337
STRAPI_API_TOKEN=REMPLACER_APRES_CREATION_TOKEN_STRAPI
NEXT_PUBLIC_SITE_URL=https://$PROD_HOST
PREVIEW_SECRET=$(openssl rand -hex 32)
REVALIDATION_SECRET=$(openssl rand -hex 32)
FROM_EMAIL=reservations@residencendombi.cg
OWNER_EMAIL=residencendombi@gmail.com
ENVEOF
  echo "   frontend/.env.production créé"
  echo "   ⚠️  Mettre à jour STRAPI_API_TOKEN après le 1er démarrage Strapi"
else
  echo "   frontend/.env.production existant — conservé"
fi

# ── 6. Installation des dépendances ───────────────────────
echo ""
echo "▶ 6/8 — Installation des dépendances"
cd "$APP_DIR/backend"  && npm ci --omit=dev
cd "$APP_DIR/frontend" && npm ci --omit=dev

# ── 7. Build ──────────────────────────────────────────────
echo ""
echo "▶ 7/8 — Build"
echo "   → Strapi..."
cd "$APP_DIR/backend"  && NODE_ENV=production npm run build
echo "   → Next.js..."
cd "$APP_DIR/frontend" && NODE_ENV=production npm run build

# ── 8. PM2 + Apache ───────────────────────────────────────
echo ""
echo "▶ 8/8 — PM2 & Apache"

# Mettre à jour l'IP dans ecosystem.config.js
sed -i "s/160\.113\.0\.124/5.196.22.149/g" "$APP_DIR/ecosystem.config.js" 2>/dev/null || true

# Démarrer PM2
pm2 start "$APP_DIR/ecosystem.config.js" 2>/dev/null || pm2 restart "$APP_DIR/ecosystem.config.js"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
systemctl enable pm2-root 2>/dev/null || true

# Apache — modules requis
a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl 2>/dev/null || true

# VirtualHost
cat > /etc/apache2/sites-available/ndombi.conf << 'APACHEEOF'
<VirtualHost *:80>
    ServerName residencendombi.lvaclean.cg
    ServerAlias residencendombi.cg www.residencendombi.cg
    ServerAdmin admin@residencendombi.cg

    ProxyPreserveHost On
    ProxyPass        / http://127.0.0.1:3001/
    ProxyPassReverse / http://127.0.0.1:3001/

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) ws://127.0.0.1:3001/$1 [P,L]

    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"

    ErrorLog  /var/log/apache2/ndombi-error.log
    CustomLog /var/log/apache2/ndombi-access.log combined
</VirtualHost>
APACHEEOF

a2ensite ndombi.conf 2>/dev/null || true
# Désactiver le default si présent
a2dissite 000-default.conf 2>/dev/null || true
apache2ctl configtest && systemctl reload apache2

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✅  Setup terminé !                                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Site   : http://5.196.22.149"
echo "  Domaine: http://residencendombi.lvaclean.cg (après DNS)"
echo "  Strapi : http://5.196.22.149:1337/admin"
echo ""
echo "  Prochaines étapes :"
echo "  1. Ouvrir http://5.196.22.149:1337/admin"
echo "     → Créer le compte admin Strapi"
echo "     → Créer un API Token (Settings → API Tokens → Full access)"
echo "     → Copier le token dans /opt/immo-appart/frontend/.env.production"
echo "         STRAPI_API_TOKEN=xxx"
echo "     → pm2 restart ndombi-nextjs && pm2 save"
echo ""
echo "  2. SSL (après DNS pointé vers 5.196.22.149) :"
echo "     apt install certbot python3-certbot-apache -y"
echo "     certbot --apache -d residencendombi.lvaclean.cg"
echo ""
echo "  Credentials DB : cat /root/.ndombi-credentials"
