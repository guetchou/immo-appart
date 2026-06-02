FROM node:20-alpine AS builder
WORKDIR /opt/app

# Dépendances de compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Image finale — prod uniquement
FROM node:20-alpine AS runner
WORKDIR /opt/app

RUN apk add --no-cache dumb-init

COPY --from=builder /opt/app/package*.json ./
COPY --from=builder /opt/app/dist         ./dist
COPY --from=builder /opt/app/config       ./config
COPY --from=builder /opt/app/src          ./src
COPY --from=builder /opt/app/public       ./public
COPY --from=builder /opt/app/node_modules ./node_modules

RUN mkdir -p public/uploads && chown -R node:node /opt/app

USER node
EXPOSE 1337
ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
