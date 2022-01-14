FROM madnificent/ember:3.28.5 as builder

LABEL maintainer="info@redpencil.io"

ARG SHOW_APP_VERSION_HASH=false

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN ember build -prod


FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
