FROM --platform=$BUILDPLATFORM oven/bun:1.3.14-alpine AS builder

WORKDIR /app

RUN apk upgrade --no-cache libcrypto3 libssl3

COPY bun.lock package.json ./
COPY apps/web/package.json ./apps/web/

RUN bun install --frozen-lockfile

COPY apps/web ./apps/web

RUN bun run --cwd apps/web build

FROM nginx:1.31.0-alpine AS runner
ARG BUILD_VERSION=0.1.0
ARG BUILD_REVISION=development
ARG BUILD_TIME=unknown

RUN apk upgrade --no-cache libxml2 libcrypto3 libssl3 libexpat

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN short_revision="$(printf '%s' "$BUILD_REVISION" | cut -c1-12)" \
    && printf '{"service":"typetype","version":"%s","revision":"%s","shortRevision":"%s","buildTime":"%s"}\n' \
        "$BUILD_VERSION" "$BUILD_REVISION" "$short_revision" "$BUILD_TIME" \
        > /usr/share/nginx/html/version.json \
    && printf '{"service":"web","version":"%s","revision":"%s","shortRevision":"%s","buildTime":"%s"}\n' \
        "$BUILD_VERSION" "$BUILD_REVISION" "$short_revision" "$BUILD_TIME" \
        > /usr/share/nginx/html/version-web.json

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
