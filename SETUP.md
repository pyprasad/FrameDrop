# FrameDrop Setup Guide

Complete guide to get FrameDrop up and running on your machine.

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose
- 4GB+ RAM available

### Step 1: Clone and Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd FrameDrop

# Copy environment file
cp .env.example .env

# Review and update .env file with your settings
# The defaults will work for local development
```

### Step 2: Start All Services

```bash
# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

This will start:
- **PostgreSQL** (port 5432)
- **Redis** (port 6379)
- **MinIO** (ports 9000, 9001)
- **Backend API** (port 4000)
- **Frontend** (port 3000)

### Step 3: Initialize MinIO Storage

1. Open MinIO Console: http://localhost:9001
2. Login with:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. Create a bucket named `framedrop`
4. Set the bucket policy to public read (for downloads)

### Step 4: Run Database Migrations

```bash
# Run Prisma migrations
docker-compose exec backend npm run prisma:migrate

# (Optional) Generate Prisma Client
docker-compose exec backend npm run prisma:generate

# (Optional) Seed initial data
docker-compose exec backend npm run prisma:seed
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **MinIO Console**: http://localhost:9001

## Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Redis 7+
- MinIO or AWS S3 account

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Setup Services

**PostgreSQL:**
```bash
# Create database
createdb framedrop

# Or using psql
psql -U postgres
CREATE DATABASE framedrop;
\q
```

**Redis:**
```bash
# Start Redis server
redis-server

# Or with Homebrew (macOS)
brew services start redis
```

**MinIO:**
```bash
# Download and run MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server ./minio-data --console-address :9001
```

### Step 3: Configure Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Update database connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/framedrop

# Update Redis connection
REDIS_URL=redis://localhost:6379

# Update MinIO settings
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
S3_BUCKET=framedrop
```

### Step 4: Run Migrations

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### Step 5: Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Configuration

### Email Setup (SMTP)

For email notifications to work, configure SMTP in `.env`:

```env
# Gmail Example (use App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@framedrop.com
```

### SSO Configuration

#### SAML 2.0 Setup

1. Configure your Identity Provider (Okta, Azure AD, etc.)
2. Get the following from your IdP:
   - Entry Point URL
   - X.509 Certificate
   - Entity ID/Issuer

3. Update `.env`:
```env
ENABLE_SSO=true
SAML_ENTRY_POINT=https://your-idp.com/sso/saml
SAML_ISSUER=framedrop
SAML_CALLBACK_URL=http://localhost:4000/api/auth/saml/callback
SAML_CERT="-----BEGIN CERTIFICATE-----
...your certificate...
-----END CERTIFICATE-----"
```

#### OAuth 2.0 Setup

1. Register your app with OAuth provider (Google, Azure, etc.)
2. Get Client ID and Secret
3. Update `.env`:

```env
ENABLE_SSO=true
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_CALLBACK_URL=http://localhost:4000/api/auth/oauth/callback
OAUTH_AUTHORIZATION_URL=https://accounts.google.com/o/oauth2/v2/auth
OAUTH_TOKEN_URL=https://oauth2.googleapis.com/token
OAUTH_USER_INFO_URL=https://www.googleapis.com/oauth2/v3/userinfo
```

### AWS S3 (Instead of MinIO)

To use AWS S3 instead of MinIO:

```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your_aws_access_key
S3_SECRET_KEY=your_aws_secret_key
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_USE_SSL=true
```

## Production Deployment

### Environment Variables

Update these for production:

```env
NODE_ENV=production

# Strong JWT secret (use openssl rand -base64 32)
JWT_SECRET=your_super_secret_key_here

# Production database
DATABASE_URL=postgresql://user:pass@prod-db:5432/framedrop

# Production frontend URL
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Production SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Build for Production

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Deployment Platforms

**DigitalOcean/VPS:**
- Use docker-compose on a VPS
- Set up nginx reverse proxy
- Configure SSL with Let's Encrypt

**AWS/GCP/Azure:**
- Use managed PostgreSQL (RDS, Cloud SQL, etc.)
- Use managed Redis (ElastiCache, MemoryStore, etc.)
- Deploy containers to ECS/Cloud Run/Container Instances

**Platform as a Service:**
- Railway: Connect GitHub, auto-deploy
- Render: Docker deployment
- Fly.io: Global edge deployment

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### MinIO Connection Issues

```bash
# Check MinIO is running
docker-compose ps minio

# Verify bucket exists
# Open http://localhost:9001 and check

# Reset MinIO data
docker-compose down
rm -rf minio-data
docker-compose up -d minio
```

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait a few seconds and retry
# 2. Node modules not installed - rebuild container
# 3. Port 4000 in use - change port in docker-compose.yml
```

### Frontend Not Building

```bash
# Clear Next.js cache
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

## Testing

### Create Test User

```bash
# Using API
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test File Upload

1. Open http://localhost:3000
2. Drag and drop files
3. Add recipient email (optional)
4. Click "Send Files"
5. Copy the share link

### Test File Download

1. Open the share link
2. If password protected, enter password
3. Click "Download All Files"

## Monitoring

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:4000/api

# Database health (admin only)
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/admin/health
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Admin

```bash
# Open Prisma Studio
cd backend
npm run prisma:studio

# Access at http://localhost:5555
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET in production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Review and update .env file
- [ ] Disable debug mode in production

## Getting Help

- Check logs: `docker-compose logs`
- Review Prisma schema: `backend/prisma/schema.prisma`
- API Documentation: http://localhost:4000/api/docs
- GitHub Issues: [Create an issue]

## Next Steps

1. Set up your organization in the admin panel
2. Configure SSO for your team
3. Customize branding (logo, colors)
4. Set storage quotas
5. Configure email templates
6. Set up monitoring and backups

Happy transferring! 🚀
