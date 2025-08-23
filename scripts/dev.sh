#!/bin/bash

set -e

echo "🚀 Starting Vehicle Tracker Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    docker-compose down
    kill $(jobs -p) 2>/dev/null || true
}

trap cleanup EXIT

# Start database and services
echo "📦 Starting database and services..."
docker-compose up -d postgres adminer

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done

# Setup backend environment if not exists
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
fi

# Ensure the backend .env uses localhost for local development
echo "📝 Configuring backend for local development..."
cat > backend/.env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vehicle_tracker"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
NODE_ENV="development"
PORT=3000
EOF

# Setup frontend environment if not exists
if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

# Install dependencies and setup database
echo "📚 Installing backend dependencies..."
(cd backend && npm install)

echo "🗄️  Setting up database..."
(cd backend && npm run db:generate && npm run db:migrate && npm run db:seed)

echo "📚 Installing frontend dependencies..."
(cd frontend && npm install)

# Get the root directory
ROOT_DIR=$(pwd)

# Start backend and frontend in parallel
echo "🎯 Starting backend and frontend servers..."
echo "Backend will be available at: http://localhost:3000"
echo "Frontend will be available at: http://localhost:5173"
echo "Database admin will be available at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"

# Start backend in background
(cd "$ROOT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

# Start frontend in background
(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID