# ─── Этап 1: сборка — компилируем TypeScript в один JS-файл ───
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY mock-server ./mock-server
# Бандлим server.ts + schema.ts в один ESM-файл (graphql-yoga оставляем внешним)
RUN mkdir -p dist && npx esbuild mock-server/server.ts \
    --bundle --platform=node --format=esm \
    --external:graphql-yoga --external:graphql \
    --outfile=dist/server.mjs

# ─── Этап 2: рантайм — Node + собранный код + только нужные зависимости ───
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist/server.mjs ./dist/server.mjs
# Только graphql-yoga (+ его peer graphql), без react/antd/vite/...
RUN npm install graphql-yoga@5 graphql@16

EXPOSE 4000
CMD ["node", "dist/server.mjs"]
