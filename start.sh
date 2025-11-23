#!/bin/bash

echo "🚀 Starting FrameDrop..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Copy .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
fi

# Start all services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check if backend is running
if docker-compose ps | grep -q "framedrop-backend.*Up"; then
    echo "✅ Backend is running"
else
    echo "⚠️  Backend is not running yet, checking logs..."
    docker-compose logs backend | tail -20
fi

# Check if frontend is running
if docker-compose ps | grep -q "framedrop-frontend.*Up"; then
    echo "✅ Frontend is running"
else
    echo "⚠️  Frontend is not running yet, checking logs..."
    docker-compose logs frontend | tail -20
fi

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "================================================"
echo "🎉 FrameDrop is starting up!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Setup MinIO (Storage):"
echo "   - Open: http://localhost:9001"
echo "   - Login: minioadmin / minioadmin123"
echo "   - Create a bucket named: framedrop"
echo ""
echo "2. Initialize Database:"
echo "   docker-compose exec backend npm run prisma:migrate"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:4000"
echo "   - API Docs: http://localhost:4000/api/docs"
echo "   - MinIO Console: http://localhost:9001"
echo ""
echo "4. View logs:"
echo "   docker-compose logs -f"
echo ""
echo "5. Stop services:"
echo "   docker-compose down"
echo ""
echo "================================================"
echo ""
