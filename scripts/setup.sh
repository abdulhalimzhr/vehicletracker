#!/bin/bash

set -e

echo "🔧 Setting up Vehicle Tracker Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ Docker version: $(docker --version)"

# Create environment files
echo "📝 Creating environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

cd ..

# Start database for initial setup
echo "🗄️  Starting database..."
docker-compose up -d postgres

# Wait for database
echo "⏳ Waiting for database to be ready..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done

# Setup database
echo "🗄️  Setting up database..."
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "  ./scripts/dev.sh          # Run with local Node.js"
echo "  ./scripts/dev-docker.sh   # Run everything with Docker"
echo ""
echo "Available URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3000"
echo "  API Docs: http://localhost:3000/api-docs"
echo "  Database Admin: http://localhost:8080"
echo ""
echo "Demo credentials:"
echo "  Email: admin@example.com"
echo "  Password: password123"