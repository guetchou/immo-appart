FROM node:20-alpine
WORKDIR /opt/app

# Dépendances de compilation native
RUN apk add --no-cache python3 make g++ dumb-init

# Dépendances npm
COPY package*.json ./
RUN npm ci

# Code source complet
COPY . .

# Supprimer les schema.json qui entrent en conflit avec schema.ts
# (esbuild compile les .ts → .js dans dist/, les .json créent un doublon)
RUN find src/api -name "schema.json" -delete 2>/dev/null || true

# Build Strapi (compile TypeScript → dist/)
RUN npm run build

# Dossier uploads
RUN mkdir -p public/uploads && chown -R node:node /opt/app

USER node
EXPOSE 1337
ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
