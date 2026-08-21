#!/bin/sh
set -e

cd /var/www/html

# Ensure writable runtime dirs exist
mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/tmp \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

if [ ! -L public/storage ]; then
    php artisan storage:link --force || true
fi

if [ "${APP_ENV:-production}" = "production" ] || [ "${CACHE_CONFIG:-1}" = "1" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache || true
fi

if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

exec /usr/bin/supervisord -c /etc/supervisord.conf
