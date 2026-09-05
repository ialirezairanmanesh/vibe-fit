# Multi-stage production build compatible with Google Cloud Run, AI Studio, and Docker Compose
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache wget

COPY package.json package-lock.json* bun.lock* ./

ENV CI=true

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run build

# Runtime container
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache wget

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]

