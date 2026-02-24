#!/bin/bash

# NeuroCloak Setup Script
# This script sets up the development environment for NeuroCloak

set -e

echo "🚀 Setting up NeuroCloak Cognitive Digital Twin Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p ssl
mkdir -p data/mongodb
mkdir -p data/redis

# Copy environment files
echo "⚙️ Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
    echo "⚠️  Please edit .env with your configuration before running the application"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from .env.example"
fi

# Build and start services
echo "🐳 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Show logs
echo "📋 Showing recent logs..."
echo ""
echo "=== Backend Logs ==="
docker-compose logs --tail=20 backend

echo ""
echo "=== Frontend Logs ==="
docker-compose logs --tail=20 frontend

echo ""
echo "✅ NeuroCloak is now running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000/api/v1"
echo "📚 API Docs: http://localhost:8000/api/docs/"
echo ""
echo "📖 To view logs: docker-compose logs -f [service_name]"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@neurocloak.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the default credentials in production!"
