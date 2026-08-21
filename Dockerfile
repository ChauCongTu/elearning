# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Composer vendor (BuildKit cache)
# -----------------------------------------------------------------------------
FROM composer:2 AS vendor

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MAX_PARALLEL_HTTP=4

COPY composer.json composer.lock ./
# Do not COPY host vendor — CI has no vendor/, and host packages may be the wrong arch (amd64 vs arm64).

RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache \
    composer install \
        --no-dev \
        --no-interaction \
        --no-scripts \
        --prefer-dist \
        --optimize-autoloader \
        --ignore-platform-reqs \
        --no-progress \
    || (sleep 20 && COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
        --no-dev --no-interaction --no-scripts --prefer-dist \
        --optimize-autoloader --ignore-platform-reqs --no-progress) \
    || (sleep 60 && COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
        --no-dev --no-interaction --no-scripts --prefer-dist \
        --optimize-autoloader --ignore-platform-reqs --no-progress)

COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes
COPY artisan ./

RUN composer dump-autoload --optimize --no-dev --no-scripts --classmap-authoritative

# -----------------------------------------------------------------------------
# Stage 2: Frontend (Bun binary + PHP CLI Alpine for Wayfinder)
# -----------------------------------------------------------------------------
FROM oven/bun:1-alpine AS bun

FROM php:8.3-cli-alpine AS frontend

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

RUN apk add --no-cache icu-libs libzip oniguruma \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install -j$(nproc) intl mbstring zip \
    && apk del .build-deps

WORKDIR /app

COPY --from=vendor /app/vendor ./vendor
COPY package.json bun.lock vite.config.ts tsconfig.json ./
COPY resources ./resources
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes
COPY public ./public
COPY artisan composer.json composer.lock ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    printf '%s\n' \
        'APP_KEY=base64:dGVtcG9yYXJ5LWtleS1mb3ItZG9ja2VyLWJ1aWxkLTEyMzQ1Ng==' \
        'APP_ENV=production' \
        'APP_DEBUG=false' \
        'DB_CONNECTION=sqlite' \
        'DB_DATABASE=:memory:' \
        > .env \
    && mkdir -p \
        bootstrap/cache \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/framework/tmp \
        storage/logs \
        storage/app/public \
        resources/js/actions \
        resources/js/routes \
        resources/js/wayfinder \
    && rm -f bootstrap/cache/*.php \
    && php artisan package:discover --ansi \
    && bun install \
    && php artisan wayfinder:generate --with-form \
    && bun run build \
    && rm -rf node_modules .env /tmp/*

# -----------------------------------------------------------------------------
# Stage 3: Runtime — PHP-FPM Alpine + Nginx + Supervisor
# -----------------------------------------------------------------------------
FROM php:8.3-fpm-alpine AS runtime

RUN apk add --no-cache \
        nginx \
        supervisor \
        curl \
        icu-libs \
        libpng \
        libjpeg-turbo \
        freetype \
        libzip \
        oniguruma \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        zip \
    && apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/* \
    && rm -f /etc/nginx/http.d/default.conf \
    && rm -f /usr/local/etc/php-fpm.d/zz-docker.conf

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY artisan composer.json composer.lock ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY public ./public
COPY resources/views ./resources/views
COPY resources/certificates ./resources/certificates
COPY routes ./routes
COPY --from=frontend /app/public/build ./public/build

COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/framework/tmp \
        storage/logs \
        bootstrap/cache \
        /run/nginx \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    CACHE_CONFIG=1 \
    RUN_MIGRATIONS=0

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://127.0.0.1/up || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
