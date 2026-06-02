FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables injectées au build (NEXT_PUBLIC_ baked dans le bundle JS)
ARG NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
ARG NEXT_PUBLIC_SITE_URL=https://residencendombi.lvaclean.cg
ARG STRAPI_API_TOKEN
ARG PREVIEW_SECRET
ARG REVALIDATION_SECRET

ENV NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV STRAPI_API_TOKEN=$STRAPI_API_TOKEN
ENV PREVIEW_SECRET=$PREVIEW_SECRET
ENV REVALIDATION_SECRET=$REVALIDATION_SECRET
ENV NODE_ENV=production

RUN npm run build

# ── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=3001

# Ne copier que le nécessaire pour l'exécution
COPY --from=builder /app/public        ./public
COPY --from=builder /app/.next         ./.next
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/package.json  ./package.json

RUN chown -R node:node /app
USER node

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start", "--", "-p", "3001"]
