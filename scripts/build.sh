#!/bin/bash

set -e

echo "🏗️  Building Vehicle Tracker for Production..."

# Build backend
echo "🔧 Building backend..."
cd backend
npm run build
echo "✅ Backend built successfully"

# Build frontend
echo "🎨 Building frontend..."
cd ../frontend
npm run build
echo "✅ Frontend built successfully"

cd ..

# Build Docker images
echo "🐳 Building Docker images..."
docker build -t vehicle-tracker-backend:latest ./backend --target production
docker build -t vehicle-tracker-frontend:latest ./frontend --target production

echo "✅ Docker images built successfully"
echo ""
echo "Built artifacts:"
echo "  Backend: ./backend/dist/"
echo "  Frontend: ./frontend/dist/"
echo "  Docker images: vehicle-tracker-backend:latest, vehicle-tracker-frontend:latest"