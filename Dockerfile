FROM node:22 AS builder

LABEL maintainer="info@redpencil.io"

ARG SHOW_APP_VERSION_HASH=false

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build


FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
