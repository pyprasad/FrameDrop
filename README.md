# FrameDrop - Enterprise File Transfer Platform

A complete WeTransfer clone with enterprise SSO capabilities, built with modern, open-source technologies.

## 🚀 Features

### Core Features
- ✅ Large file transfers (up to 10GB+)
- ✅ Resumable uploads with TUS protocol
- ✅ Drag & drop interface
- ✅ Email or shareable link transfers
- ✅ Download tracking and analytics
- ✅ Automatic transfer expiration
- ✅ Password-protected transfers
- ✅ Multiple file uploads

### Enterprise SSO Features
- ✅ SAML 2.0 authentication
- ✅ OAuth 2.0 / OpenID Connect
- ✅ Multi-provider support (Okta, Azure AD, Google Workspace, etc.)
- ✅ User provisioning and management
- ✅ Role-based access control (Admin, User, Guest)
- ✅ Team/Organization management

### Enterprise Management
- ✅ Admin dashboard with analytics
- ✅ User and team management
- ✅ Storage quotas and limits
- ✅ Transfer audit logs
- ✅ Custom branding (logo, colors)
- ✅ Data retention policies
- ✅ Email notifications
- ✅ RESTful API with documentation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Uppy** - File upload with TUS support

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - ORM for PostgreSQL
- **Passport.js** - Authentication (SAML, OAuth)
- **Bull** - Job queue for background tasks

### Infrastructure
- **PostgreSQL 16** - Database
- **Redis 7** - Caching and job queue
- **MinIO** - S3-compatible object storage (or AWS S3)
- **Docker** - Containerization

## 📋 Prerequisites

- Node.js 18+ or Docker
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)
- MinIO or AWS S3 account

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd FrameDrop
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up -d
```

4. Initialize MinIO bucket:
```bash
# Access MinIO console at http://localhost:9001
# Login: minioadmin / minioadmin123
# Create a bucket named "framedrop"
```

5. Run database migrations:
```bash
docker-compose exec backend npm run prisma:migrate
```

6. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MinIO Console: http://localhost:9001

### Option 2: Local Development

1. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. Set up PostgreSQL and Redis locally

3. Copy and configure `.env` file

4. Run migrations:
```bash
cd backend
npm run prisma:migrate
```

5. Start services:
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔐 SSO Configuration

### SAML 2.0 Setup

1. Configure your Identity Provider (IdP):
   - Set ACS URL: `http://your-domain.com/auth/saml/callback`
   - Set Entity ID: `framedrop`

2. Update `.env` with SAML credentials:
```env
SAML_ENTRY_POINT=https://your-idp.com/sso/saml
SAML_ISSUER=framedrop
SAML_CALLBACK_URL=http://localhost:4000/auth/saml/callback
SAML_CERT=your_idp_certificate
```

### OAuth 2.0 Setup

1. Register your application with OAuth provider

2. Update `.env` with OAuth credentials:
```env
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_CALLBACK_URL=http://localhost:4000/auth/oauth/callback
```

## 📚 API Documentation

Once the backend is running, access the Swagger documentation at:
```
http://localhost:4000/api/docs
```

## 🏗️ Project Structure

```
FrameDrop/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication & SSO
│   │   ├── transfers/      # File transfer logic
│   │   ├── users/          # User management
│   │   ├── organizations/  # Organization/team management
│   │   ├── storage/        # S3/MinIO integration
│   │   ├── email/          # Email notifications
│   │   └── admin/          # Admin dashboard API
│   └── prisma/             # Database schema & migrations
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/               # Utilities
└── docker-compose.yml     # Docker services
```

## 🔧 Configuration

### Storage Options

**MinIO (Self-hosted, Free):**
- Included in docker-compose.yml
- S3-compatible API
- Perfect for on-premise deployments

**AWS S3:**
```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your_aws_access_key
S3_SECRET_KEY=your_aws_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1
S3_USE_SSL=true
```

### Email Providers

Supports any SMTP provider:
- Gmail (with App Password)
- SendGrid
- Mailgun
- Amazon SES
- Postmark

## 🔒 Security Features

- Encrypted file storage
- Secure download tokens
- Password-protected transfers
- Transfer access logs
- Rate limiting
- CORS protection
- XSS protection
- SQL injection prevention

## 📊 Monitoring & Logs

- Application logs in `logs/` directory
- Transfer audit logs in database
- User activity tracking
- Storage usage metrics

## 🚀 Production Deployment

### Environment Variables

Update `.env` for production:
- Change all default passwords
- Use strong JWT_SECRET
- Configure production database
- Set up production S3/MinIO
- Configure production SMTP

### Deployment Options

1. **Docker + VPS** (DigitalOcean, Linode, Hetzner)
2. **Kubernetes** (EKS, GKE, AKS)
3. **Platform as a Service** (Railway, Render, Fly.io)

## 💰 Cost Optimization

- **MinIO**: Free self-hosted alternative to AWS S3
- **PostgreSQL**: Free and open-source
- **Redis**: Free and open-source
- **Hosting**: Start with $5-10/month VPS
- **Scale as needed**: Add more storage/compute

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: [Wiki]

## 🗺️ Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] Real-time transfer progress for recipients
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Webhook support for integrations
- [ ] Multi-language support
- [ ] Dark mode
- [ ] API rate limiting per organization

---

**Built with ❤️ using open-source technologies**
