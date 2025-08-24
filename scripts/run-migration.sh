#!/bin/bash
set -e

APP_DIR="/opt/vehicle-tracker"
cd "$APP_DIR"

echo "Running Prisma migration..."

# Source environment variables
set -a
source .env
set +a

echo "DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/vehicle_tracker"

# Wait for postgres to be ready
echo "Waiting for postgres to be ready..."
for i in {1..30}; do
    if docker compose -f docker-compose.prod.yml --env-file .env exec postgres pg_isready -U postgres; then
        echo "Postgres is ready!"
        break
    fi
    echo "Waiting for postgres... ($i/30)"
    sleep 2
done

# Run migration with explicit environment
echo "Running migration..."
docker compose -f docker-compose.prod.yml --env-file .env run --rm \
    -e DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/vehicle_tracker" \
    -e NODE_ENV="production" \
    backend npx prisma migrate deploy

echo "Migration completed successfully!"

# Run database seeding
echo "Running database seeding..."
docker compose -f docker-compose.prod.yml --env-file .env run --rm \
    -e DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/vehicle_tracker" \
    -e NODE_ENV="production" \
    backend npm run db:seed

echo "Database seeding completed successfully!"