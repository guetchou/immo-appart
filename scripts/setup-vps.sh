#!/usr/bin/env bash
# =============================================================
# setup-vps.sh — Setup one-time de immo-appart sur le VPS OVH
# À exécuter UNE SEULE FOIS en tant que root sur le VPS.
# Ne touche PAS aux autres projets existants.
#
# Usage :
#   export DB_PASSWORD="votre-mot-de-passe-fort"
#   bash scripts/setup-vps.sh
#
# Si DB_PASSWORD n'est pas défini, un mot de passe aléatoire
# est généré et affiché UNE SEULE FOIS dans le terminal.
# =============================================================
set -euo pipefail

REPO="https://github.com/guetchou/immo-appart.git"
DIR="/opt/immo-appart"
CREDS_FILE="/root/.ndombi-credentials"

# ── Génération / récupération du mot de passe DB ────────────
if [ -f "$CREDS_FILE" ]; then
  # Déjà initialisé — lire les valeurs existantes
  source "$CREDS_FILE"
  echo "→ Credentials existants chargés depuis $CREDS_FILE"
else
  # Première exécution — générer un mot de passe sécurisé
  DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32 | tr -d '=+/' | head -c 32)}"

  # Stocker de façon sécurisée (root uniquement)
  cat > "$CREDS_FILE" <<CREDS
DB_PASSWORD="$DB_PASSWORD"
CREDS
  chmod 600 "$CREDS_FILE"

  echo "→ Nouveau mot de passe DB généré et stocké dans $CREDS_FILE (chmod 600)"
  echo "  CONSERVEZ CE FICHIER EN LIEU SÛR."
fi

# ── Clonage du dépôt ────────────────────────────────────────
echo "→ Clonage du dépôt dans $DIR"
if [ -d "$DIR/.git" ]; then
  echo "  Déjà cloné — pull uniquement"
  git -C "$DIR" pull origin main
else
  git clone "$REPO" "$DIR"
fi

# ── Base de données ─────────────────────────────────────────
echo "→ Création de la base PostgreSQL de production"
sudo -u postgres psql -v pw="$DB_PASSWORD" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ndombi_user') THEN
    EXECUTE format('CREATE USER ndombi_user WITH PASSWORD %L', :'pw');
  ELSE
    EXECUTE format('ALTER USER ndombi_user WITH PASSWORD %L', :'pw');
  END IF;
END$$;
SELECT 'CREATE DATABASE immo_ndombi_prod OWNER ndombi_user'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'immo_ndombi_prod')\gexec
GRANT ALL PRIVILEGES ON DATABASE immo_ndombi_prod TO ndombi_user;
SQL

# ── Génération des secrets Strapi ────────────────────────────
APP_KEYS=$(node -e "const c=require('crypto');console.log([1,2,3,4].map(()=>c.randomBytes(16).toString('base64')).join(','))")
API_TOKEN_SALT=$(node    -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ADMIN_JWT=$(node          -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=$(node         -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
TRANSFER_SALT=$(node      -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# ── .env backend ────────────────────────────────────────────
BACKEND_ENV="$DIR/backend/.env"
if [ ! -f "$BACKEND_ENV" ]; then
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
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_SSL=false
NODE_ENV=production
EOF
  chmod 600 "$BACKEND_ENV"
  echo "  .env backend créé (chmod 600)"
else
  echo "  .env backend déjà présent — non modifié"
fi

# ── .env frontend ────────────────────────────────────────────
FRONTEND_ENV="$DIR/frontend/.env.local"
if [ ! -f "$FRONTEND_ENV" ]; then
  cat > "$FRONTEND_ENV" <<EOF
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=
NEXT_PUBLIC_SITE_URL=https://residencendombi.cg
NODE_ENV=production
EOF
  chmod 600 "$FRONTEND_ENV"
  echo "  .env frontend créé (chmod 600)"
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
cd "$DIR/backend"
pm2 start ecosystem.config.js --env production || pm2 restart ndombi-backend
cd "$DIR/frontend"
pm2 start ecosystem.config.js --env production || pm2 restart ndombi-frontend
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | grep "sudo\|systemctl" | bash || true

echo ""
echo "✅ Setup terminé !"
echo "   Backend  → http://localhost:1337/admin"
echo "   Frontend → http://localhost:3000"
echo ""
echo "   Configurez Nginx : cp scripts/nginx-ndombi.conf /etc/nginx/sites-available/residencendombi.cg"
echo "   Puis : ln -s /etc/nginx/sites-available/residencendombi.cg /etc/nginx/sites-enabled/"
echo "   Puis : nginx -t && systemctl reload nginx"
