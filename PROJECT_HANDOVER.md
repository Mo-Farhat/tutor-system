# Strive Academy - Project Handover Document

> **Handover Date:** January 10, 2026  
> **Project:** Strive Academy - Tutoring Platform  
> **Repository:** Single monorepo containing `backend/` and `frontend/`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Third-Party Services](#third-party-services)
7. [Deployment Architecture](#deployment-architecture)
8. [Fresh Deployment Guide](#fresh-deployment-guide)
9. [Important Scripts & Commands](#important-scripts--commands)
10. [Post-Handover Actions](#post-handover-actions)

---

## Project Overview

- **Student Dashboard** - Session booking, package management, lesson history
- **Tutor Dashboard** - Calendar, earnings, student management, availability toggle
- **Admin Dashboard** - User management, tier configuration, finance overview, tutor approvals
- **Payment System** - Stripe integration with Connect for tutor payouts
- **Authentication** - JWT-based auth with role-based access (student, tutor, admin)

---

## Technology Stack

| Layer               | Technology                                                  |
| ------------------- | ----------------------------------------------------------- |
| **Frontend**        | React 19, React Router 7, Material UI 7, Bootstrap 5, Axios |
| **Backend**         | Node.js, Express,   Prisma ORM                              |
| **Database**        | PostgreSQL                                                  |
| **Process Manager** | PM2 (backend)                                               |
| **Web Server**      | Nginx (frontend static files)                               |
| **File Storage**    | AWS S3                                                      |
| **Email**           | Nodemailer with Gmail SMTP                                  |
| **Payments**        | Stripe (with Stripe Connect for tutor payouts)              |

---

## Repository Structure

```
striveacademy/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Migration history
│   │   
│   ├── scripts/
│   │   ├── createAdmin.js       # Admin account creation
│   │  
│   ├── src/
│   │   ├── server.js            # Entry point
│   │   ├── routes/              # API routes
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── models/              # Prisma client wrapper
│   │   └── middleware/          # Auth, error handling
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API service layer
│   │   ├── contexts/            # React contexts
│   │   └── css/                 # Stylesheets
│   ├── build/                   # Production build output
│   ├── .env.example
│   └── package.json
├── pm2.config.cjs               # PM2 configuration
└── .github/workflows/           # CI/CD pipeline (excluded from handover)
```

---

## Environment Configuration

### Backend `.env`

Create `/backend/.env` based on `.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://striveacademics.com.au

# Database Configuration
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/strive_dev"

# JWT Configuration
JWT_SECRET=<your-secure-jwt-secret>
JWT_REFRESH_SECRET=<your-secure-refresh-secret>

# Stripe Configuration (Live Mode)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
AWS_REGION=<aws-region>
AWS_S3_BUCKET=<bucket-name>

# Google Places API (for google reviews)
GOOGLE_PLACES_API_KEY=<api-key>
```

### Frontend `.env`

Create `/frontend/.env` based on `.env.example`:

```env
REACT_APP_BACKEND_URL=https://striveacademics.com.au
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Database Setup

### Database Info

| Property      | Value                   |
| ------------- | ----------------------- |
| DBMS          | PostgreSQL              |
| Database Name | `strive_dev`            |
| ORM           | Prisma                  |
| Location      | Same VPS as application |

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# View database in browser
npx prisma studio

# Reset database (CAUTION: destroys all data)
npx prisma migrate reset
```

### Seed Data

```bash
# Create admin account
node scripts/createAdmin.js
```

> [!WARNING] > **No automated backups are currently configured.** It is strongly recommended to set up automated PostgreSQL backups using `pg_dump` with a cron job or a managed backup service.

---

## Third-Party Services

### Stripe (Payment Processing)

| Property         | Details                                  |
| ---------------- | ---------------------------------------- |
| Mode             | **LIVE**                                 |
| Features Used    | Payments, Stripe Connect (tutor payouts) |
| Webhook Endpoint | `/api/stripe/webhook`                    |
| Developer Access | `mfarhat0104@gmail.com` (to be revoked)  |

**Action Required:** Revoke developer access for `mfarhat0104@gmail.com` after handover.

### AWS S3 (File Storage)

| Property      | Details                                |
| ------------- | -------------------------------------- |
| Purpose       | Tutor document uploads, profile images |
| Account Owner | Client                                 |

### Gmail SMTP (Email)

| Property | Details                             |
| -------- | ----------------------------------- |
| Service  | Gmail with App Password             |
| Purpose  | Transactional emails, notifications |

### Google Places API

| Property      | Details                                    |
| ------------- | ------------------------------------------ |
| Purpose       | Location autocomplete for profiles         |
| Account Owner | Client                                     |
| Note          | Developer did not have access to configure |

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Hostinger VPS                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Nginx                             │  │
│  │  ┌─────────────────┐    ┌─────────────────────────┐   │  │
│  │  │ Frontend (443)  │    │ Backend Proxy (443)     │   │  │
│  │  │ /build static   │    │ → localhost:3001        │   │  │
│  │  └─────────────────┘    └─────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 PM2 Process Manager                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Backend (Node.js) - Port 3001                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │              Database: strive_dev                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

SSL: Let's Encrypt (Certbot)
```

---

## Fresh Deployment Guide

### Prerequisites

- Root or sudo access
- Domain pointed to server IP

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE strive_dev;
CREATE USER striveuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE strive_dev TO striveuser;
\q
```

### Step 3: Clone Repository

```bash
cd /var/www
git clone <repository-url> striveacademy
cd striveacademy
```

### Step 4: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Configure all environment variables

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Seed initial data
node prisma/seed-subjects.js
node prisma/seed-tiers.js
node scripts/createAdmin.js
```

### Step 5: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Configure backend URL and Stripe key

# Build for production
npm run build
```

### Step 6: Configure PM2

```bash
cd /var/www/striveacademy

# Start backend with PM2
pm2 start pm2.config.cjs

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Step 7: Configure Nginx

Create `/etc/nginx/sites-available/striveacademy`:

```nginx
# Frontend
server {
    listen 80;
    server_name striveacademics.com.au www.striveacademics.com.au;

    root /var/www/striveacademy/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 80;
    server_name api.striveacademics.com.au;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and obtain SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/striveacademy /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Obtain SSL certificates
sudo certbot --nginx -d striveacademics.com.au -d www.striveacademics.com.au -d api.striveacademics.com.au
```

### Step 8: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://striveacademics.com.au/api/stripe/webhook`
3. Select events to listen for (payment_intent.succeeded, etc.)
4. Copy webhook secret to backend `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Important Scripts & Commands

### Backend Operations

```bash
cd /var/www/striveacademy/backend

# Start/restart with PM2
pm2 restart my-backend

# View logs
pm2 logs my-backend

# Monitor processes
pm2 monit

# Check status
pm2 status
```

### Frontend Operations

```bash
cd /var/www/striveacademy/frontend

# Rebuild after changes
npm run build

# Nginx will automatically serve new build files
```

### Database Operations

```bash
cd /var/www/striveacademy/backend

# Open Prisma Studio (database GUI)
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Deploy migrations in production
npx prisma migrate deploy
```

### Manual Backup (Recommended)

```bash
# Backup database
pg_dump -U striveuser strive_dev > backup_$(date +%Y%m%d).sql

# Restore database
psql -U striveuser strive_dev < backup_YYYYMMDD.sql
```

---

## Post-Handover Actions

> [!IMPORTANT]
> Complete these actions after handover

### Security Actions

- [ ] Revoke Stripe developer access for `mfarhat0104@gmail.com`
- [ ] Change all passwords and secrets in `.env` files
- [ ] Regenerate JWT secrets
- [ ] Review and update AWS IAM permissions if needed

### Recommended Improvements

- [ ] Set up automated PostgreSQL backups (daily `pg_dump` via cron)
- [ ] Configure error monitoring (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Enable PM2 log rotation
- [ ] Review and optimize Nginx caching

### SSL Certificate Renewal

Let's Encrypt certificates auto-renew via Certbot. Verify with:

```bash
sudo certbot renew --dry-run
```

---

## Support Documentation

Additional documentation available in the repository:

| File                                     | Description                                        |
| ---------------------------------------- | -------------------------------------------------- |
| `backend/README.md`                      | Backend API documentation, tutor verification flow |
| `backend/DEPLOYMENT_CHECKLIST.md`        | CORS configuration and deployment steps            |
| `backend/CORS_SETUP.md`                  | Detailed CORS troubleshooting                      |
| `frontend/AUTHENTICATION_INTEGRATION.md` | Auth flow documentation                            |
| `frontend/README.md`                     | Frontend setup instructions                        |

---


