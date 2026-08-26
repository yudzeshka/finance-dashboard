# ─── Этап 1: сборка статики ──────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# VITE_*-переменные вшиваются в бандл на этапе сборки (Vite читает их из окружения).
# Значения по умолчанию — dev-поддомен Nhost; переопределяются через --build-arg.
ARG VITE_NHOST_SUBDOMAIN=fwbpueyfmtoabaoymuvu
ARG VITE_NHOST_REGION=eu-central-1
ENV VITE_NHOST_SUBDOMAIN=$VITE_NHOST_SUBDOMAIN \
    VITE_NHOST_REGION=$VITE_NHOST_REGION

# Сначала только манифесты зависимостей — чтобы слой npm ci кэшировался
COPY package.json package-lock.json ./
RUN npm ci

# Затем исходники и сборка
COPY . .
RUN npm run build

# ─── Этап 2: раздача через nginx ─────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
