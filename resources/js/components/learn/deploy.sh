#!/bin/bash

# Move to project folder
cd /var/www/elearning

# Pull the latest code
echo "Pulling the latest code..."
git pull

# Install dependencies
echo "Installing dependencies..."
composer install --no-dev
yarn

# Build the project
echo "Building the project..."
yarn build

# Optimize the project
echo "Optimizing the project..."
php artisan o:c
php artisan route:cache
php artisan view:cache
