#!/bin/bash

set -e

echo "🐳 Starting Vehicle Tracker with Docker (Development Mode)..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo "🧹 Stopping all containers..."
    docker-compose down
}

trap cleanup EXIT

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

# Start all services
echo "🚀 Starting all services with Docker..."
docker-compose up --build

echo "✅ All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3000"
echo "API Docs: http://localhost:3000/api-docs"
echo "Database Admin: http://localhost:8080"