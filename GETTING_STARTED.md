# Getting Started with FrameDrop

Welcome to FrameDrop! This guide will walk you through setting up and using your enterprise file transfer platform.

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [First Transfer](#first-transfer)
3. [User Authentication](#user-authentication)
4. [Enterprise SSO Setup](#enterprise-sso-setup)
5. [Admin Guide](#admin-guide)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Docker Desktop installed
- 4GB+ RAM available
- Ports 3000, 4000, 5432, 6379, 9000, 9001 available

### Installation (5 Minutes)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd FrameDrop

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# Wait 30 seconds for services to initialize...

# 4. Setup MinIO storage
# Open http://localhost:9001 in your browser
# Login: minioadmin / minioadmin123
# Click "Create Bucket" → Name it "framedrop" → Create

# 5. Initialize database
docker-compose exec backend npm run prisma:migrate

# 6. Done! Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/api/docs
```

### Verify Installation

```bash
# Check all services are running
docker-compose ps

# You should see all services as "Up"
# ✓ framedrop-postgres
# ✓ framedrop-redis
# ✓ framedrop-minio
# ✓ framedrop-backend
# ✓ framedrop-frontend
```

---

## First Transfer

### Without Authentication (Anonymous)

1. Open http://localhost:3000
2. Drag and drop files or click to browse
3. (Optional) Add recipient emails
4. (Optional) Add a message
5. Click "Send Files"
6. Copy and share the generated link

### With Authentication (Recommended)

1. Open http://localhost:3000
2. Click "Get Started" or "Sign in"
3. Create an account or sign in
4. Upload files from dashboard or homepage
5. Track downloads and analytics

---

## User Authentication

### Creating an Account

1. Go to http://localhost:3000/register
2. Fill in your details:
   - Email
   - Password (minimum 8 characters)
   - First & Last Name (optional)
3. Click "Create account"
4. You'll be automatically logged in

### Signing In

**Local Authentication:**
```
http://localhost:3000/login
```

**SSO Authentication:**
- Click "Sign in with SSO (SAML)" for SAML 2.0
- Click "Sign in with OAuth" for OAuth 2.0
- Configure SSO in `.env` first (see below)

### Password Requirements

- Minimum 8 characters
- Mix of uppercase and lowercase recommended
- Numbers and special characters recommended
- Password strength indicator shows real-time feedback

---

## Enterprise SSO Setup

### SAML 2.0 Configuration

#### Step 1: Configure Your Identity Provider

**For Okta:**
1. Log in to Okta Admin Console
2. Applications → Create App Integration
3. Choose SAML 2.0
4. Configure:
   - Single sign on URL: `http://localhost:4000/api/auth/saml/callback`
   - Audience URI: `framedrop`
   - Name ID format: EmailAddress

**For Azure AD:**
1. Azure Portal → Azure Active Directory
2. Enterprise applications → New application
3. Create your own application
4. Set up single sign-on → SAML
5. Configure:
   - Identifier (Entity ID): `framedrop`
   - Reply URL: `http://localhost:4000/api/auth/saml/callback`

#### Step 2: Update .env File

```env
# Enable SSO
ENABLE_SSO=true

# SAML Configuration
SAML_ENTRY_POINT=https://your-idp.com/sso/saml
SAML_ISSUER=framedrop
SAML_CALLBACK_URL=http://localhost:4000/api/auth/saml/callback

# Get certificate from your IdP (metadata XML)
SAML_CERT="-----BEGIN CERTIFICATE-----
MIIDpDCCAoygAwIBAgIGAW...
-----END CERTIFICATE-----"
```

#### Step 3: Restart Backend

```bash
docker-compose restart backend
```

#### Step 4: Test SSO Login

1. Go to http://localhost:3000/login
2. Click "Sign in with SSO (SAML)"
3. You'll be redirected to your IdP
4. Sign in and get redirected back

### OAuth 2.0 Configuration

#### For Google OAuth:

1. Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Configure:
   - Authorized redirect URIs: `http://localhost:4000/api/auth/oauth/callback`

4. Update `.env`:
```env
ENABLE_SSO=true
OAUTH_CLIENT_ID=your_google_client_id
OAUTH_CLIENT_SECRET=your_google_client_secret
OAUTH_CALLBACK_URL=http://localhost:4000/api/auth/oauth/callback
OAUTH_AUTHORIZATION_URL=https://accounts.google.com/o/oauth2/v2/auth
OAUTH_TOKEN_URL=https://oauth2.googleapis.com/token
OAUTH_USER_INFO_URL=https://www.googleapis.com/oauth2/v3/userinfo
```

---

## Admin Guide

### Creating Your First Admin User

Option 1: Directly in Database (PostgreSQL)
```bash
# Access database
docker-compose exec postgres psql -U framedrop -d framedrop

# Update a user to admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';

# Or super admin
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';

# Exit
\q
```

Option 2: Via Prisma Studio
```bash
cd backend
npm run prisma:studio

# Opens at http://localhost:5555
# Navigate to User table
# Edit user role to ADMIN or SUPER_ADMIN
```

### Admin Dashboard

Access: http://localhost:3000/admin

**Features:**
- System overview and statistics
- User management
- Transfer monitoring
- Audit logs
- Analytics
- Health checks

### User Roles

- **SUPER_ADMIN**: Full platform access, can manage organizations
- **ADMIN**: Organization admin, can manage users and settings
- **USER**: Regular user, can create transfers
- **GUEST**: Limited access (can only download)

### Creating an Organization

1. Sign in as SUPER_ADMIN
2. Go to Admin Dashboard
3. Click "Organizations"
4. Click "Create Organization"
5. Fill in:
   - Name
   - Slug (URL-friendly name)
   - Tier (FREE, PRO, BUSINESS, ENTERPRISE)
   - Storage limit

### Organization Settings

Admins can configure:
- **Branding**: Logo, primary color
- **Storage Limits**: Per user and organization
- **Transfer Limits**: Max file size, expiry days
- **SSO**: Organization-specific SSO
- **Features**: Password protection, download limits

---

## Best Practices

### Security

1. **Change Default Passwords**
   ```bash
   # Update .env with strong passwords
   JWT_SECRET=<use: openssl rand -base64 32>
   POSTGRES_PASSWORD=<strong password>
   ```

2. **Enable HTTPS in Production**
   - Use nginx reverse proxy
   - Configure Let's Encrypt SSL
   - Update FRONTEND_URL and BACKEND_URL

3. **Configure Email**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=<your sendgrid api key>
   ```

### Storage Management

1. **Set Appropriate Quotas**
   - Free tier: 2GB per user
   - Pro tier: 10GB per user
   - Enterprise: Custom limits

2. **Cleanup Expired Transfers**
   ```bash
   # Setup cron job to run daily
   docker-compose exec backend node -e "
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();

   async function cleanup() {
     await prisma.transfer.updateMany({
       where: { expiresAt: { lt: new Date() }, status: 'ACTIVE' },
       data: { status: 'EXPIRED' }
     });
   }
   cleanup();
   "
   ```

3. **Monitor Storage Usage**
   - Check admin dashboard regularly
   - Set up alerts for storage limits
   - Review largest transfers

### Performance

1. **Redis Caching**
   - Already configured
   - Handles job queue for email notifications
   - Caches frequently accessed data

2. **Database Optimization**
   ```bash
   # Run periodic vacuum
   docker-compose exec postgres psql -U framedrop -d framedrop -c "VACUUM ANALYZE;"
   ```

3. **File Upload Optimization**
   - Files are chunked automatically
   - Resumable uploads supported
   - Progress tracking included

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs backend

# Restart all services
docker-compose restart

# Complete reset
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
docker-compose exec postgres pg_isready -U framedrop

# View logs
docker-compose logs postgres

# Recreate database
docker-compose down postgres
docker-compose up -d postgres
docker-compose exec backend npm run prisma:migrate
```

### MinIO / Storage Issues

```bash
# Check MinIO is running
docker-compose ps minio

# Access MinIO console
# http://localhost:9001

# Verify bucket exists
# Login and check for "framedrop" bucket

# Check MinIO logs
docker-compose logs minio
```

### Upload Failures

1. **Check file size limit**
   - Default: 10GB
   - Update in `.env`: `MAX_FILE_SIZE`

2. **Check storage quota**
   - View in admin dashboard
   - Increase user/org limits

3. **Check MinIO bucket**
   - Verify bucket exists
   - Check bucket permissions
   - Ensure public read access for downloads

### Email Not Sending

```bash
# Check email configuration in .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Test email manually
docker-compose exec backend node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.sendMail({
  from: 'test@framedrop.com',
  to: 'recipient@example.com',
  subject: 'Test',
  text: 'Test email'
});
"
```

### SSO Not Working

1. **Verify SSO enabled**
   ```env
   ENABLE_SSO=true
   ```

2. **Check SSO configuration**
   - Verify callback URLs match
   - Check certificate format
   - Ensure no extra whitespace

3. **Test SSO endpoint**
   ```bash
   curl http://localhost:4000/api/auth/saml
   # Should redirect to IdP
   ```

4. **Check backend logs**
   ```bash
   docker-compose logs backend | grep -i saml
   ```

### Frontend Build Issues

```bash
# Clear cache and rebuild
cd frontend
rm -rf .next node_modules
npm install
npm run build

# Or with Docker
docker-compose build frontend
docker-compose up -d frontend
```

---

## Getting Help

### Documentation

- **API Docs**: http://localhost:4000/api/docs (Swagger)
- **Setup Guide**: See SETUP.md
- **README**: See README.md

### Common Commands

```bash
# View all services status
docker-compose ps

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Access database
docker-compose exec postgres psql -U framedrop -d framedrop

# Access backend shell
docker-compose exec backend sh

# Run migrations
docker-compose exec backend npm run prisma:migrate

# Open Prisma Studio
cd backend && npm run prisma:studio
```

### Health Checks

```bash
# Backend health
curl http://localhost:4000/api

# Database health (requires admin auth)
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/admin/health

# MinIO health
curl http://localhost:9000/minio/health/live
```

---

## Next Steps

1. **Configure Email**: Set up SMTP for notifications
2. **Setup SSO**: Enable enterprise authentication
3. **Customize Branding**: Add your logo and colors
4. **Set Quotas**: Define storage limits
5. **Deploy to Production**: See SETUP.md for deployment guide
6. **Monitor Usage**: Use admin dashboard
7. **Set up Backups**: Configure automated backups
8. **Enable HTTPS**: Set up SSL certificates

---

**Need more help?** Check the full documentation or create an issue on GitHub.

Happy transferring! 🚀
