#!/usr/bin/env bash
# ============================================================
# Sync base de données DEV → PROD
# Usage : bash scripts/sync-db-to-prod.sh
# ============================================================
set -euo pipefail

DUMP_FILE="/tmp/immo_ndombi_sync_$(date +%Y%m%d_%H%M%S).sql"
PROD_HOST="vps-ovh"

echo "╔══════════════════════════════════════════════════════╗"
echo "║   Sync DB dev → prod — Résidence NDOMBI              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  Cette opération ÉCRASE la base de données de production."
read -p "Confirmer ? (oui/non) : " CONFIRM
[ "$CONFIRM" != "oui" ] && echo "Annulé." && exit 0

echo ""
echo "▶ 1/4 — Dump de la base dev"
DB_PASS=$(grep DATABASE_PASSWORD /opt/immo-appart/backend/.env | cut -d= -f2)
PGPASSWORD="$DB_PASS" pg_dump \
  -h 127.0.0.1 -U ndombi_user -d immo_ndombi \
  --no-owner --no-privileges \
  -f "$DUMP_FILE"
echo "   Dump : $DUMP_FILE ($(du -sh "$DUMP_FILE" | cut -f1))"

echo ""
echo "▶ 2/4 — Envoi vers le VPS prod"
scp "$DUMP_FILE" "$PROD_HOST:/tmp/sync_dump.sql"

echo ""
echo "▶ 3/4 — Import sur le prod"
ssh "$PROD_HOST" '
  set -e
  echo "  Arrêt Strapi..."
  docker compose -f /opt/immo-appart/docker-compose.yml stop strapi nextjs

  echo "  Recréation DB..."
  docker exec ndombi-postgres dropdb -U ndombi_user --if-exists immo_ndombi
  docker exec ndombi-postgres createdb -U ndombi_user immo_ndombi

  echo "  Import..."
  docker exec -i ndombi-postgres psql -U ndombi_user -d immo_ndombi -q < /tmp/sync_dump.sql

  echo "  Démarrage Strapi..."
  docker compose -f /opt/immo-appart/docker-compose.yml start strapi
  sleep 15

  echo "  Génération nouveau token API..."
  ADMIN_JWT=$(curl -s -X POST http://localhost:1337/admin/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"admin@residencendombi.cg\",\"password\":\"Ndombi2025\!Dev\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)[\"data\"][\"token\"])")

  NEW_TOKEN=$(curl -s -X POST http://localhost:1337/admin/api-tokens \
    -H "Authorization: Bearer $ADMIN_JWT" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"prod-$(date +%Y%m%d)\",\"type\":\"full-access\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)[\"data\"][\"accessKey\"])")

  sed -i "s|STRAPI_API_TOKEN=.*|STRAPI_API_TOKEN=$NEW_TOKEN|" /opt/immo-appart/.env
  echo "  Token mis à jour"

  echo "  Rebuild Next.js..."
  docker compose -f /opt/immo-appart/docker-compose.yml build nextjs
  docker compose -f /opt/immo-appart/docker-compose.yml up -d nextjs

  rm -f /tmp/sync_dump.sql
  echo "  Nettoyage OK"
'

echo ""
echo "▶ 4/4 — Vérification"
sleep 20
HTTP=$(curl -sk -o /dev/null -w "%{http_code}" https://residencendombi.lvaclean.cg/)
echo "   Site : HTTP $HTTP"

rm -f "$DUMP_FILE"
echo ""
echo "✅ Sync terminée !"
