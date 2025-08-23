#!/bin/bash

set -e

echo "🧪 Running Vehicle Tracker Tests..."

# Start test database
echo "🗄️  Starting test database..."
docker-compose up -d postgres

# Wait for database
echo "⏳ Waiting for database to be ready..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done

# Run backend tests
echo "🔧 Running backend tests..."
cd backend
npm test

# Run frontend tests (if they exist)
echo "🎨 Running frontend tests..."
cd ../frontend
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    npm test
else
    echo "⚠️  No frontend tests configured"
fi

cd ..

echo "✅ All tests completed!"