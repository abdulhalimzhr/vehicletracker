# Vehicle Tracker Dashboard

Full-stack application for tracking vehicle status with real-time monitoring and reporting capabilities.

> Track vehicles, generate reports, and monitor fleet status in real-time!

## Preview

<img width="1906" height="969" alt="image" src="https://github.com/user-attachments/assets/e1d319cb-fdba-4edd-9e93-3f69d189efa9" />
<img width="1914" height="970" alt="image" src="https://github.com/user-attachments/assets/d0f3d8f7-77ec-438f-8e3d-e0ee77cc6f2f" />

## Tech Stack

**Backend:**

- Node.js + TypeScript + Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication
- Zod validation
- Swagger documentation
- Jest testing

**Frontend:**

- React + TypeScript + Vite
- TailwindCSS + Radix UI
- Zustand + React Query
- React Router v6

**DevOps:**

- Docker & Docker Compose
- GitHub Actions CI/CD
- Nginx reverse proxy with SSL/HTTPS
- Let's Encrypt automatic SSL certificates
- Automated database migrations and seeding
- Production deployment to VPS

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd vehicle-tracker

# One-time setup
npm run setup

# Start development servers
npm run dev
```

### Option 2: Docker Development

```bash
# Start everything with Docker
npm run dev:docker
```

### Option 3: Manual Setup

```bash
# Start database
docker-compose up -d postgres

# Backend setup
cd backend
npm install
npm run db:migrate
npm run db:seed  # Creates admin@example.com and user@example.com accounts
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Production Deployment

#### Docker Images

**Build & Push to Docker Hub:**

```bash
# Login to Docker Hub
docker login

# Build and tag images
docker build -t your-username/vehicle-tracker-backend:latest ./backend
docker build -t your-username/vehicle-tracker-frontend:latest ./frontend

# Push to Docker Hub
docker push your-username/vehicle-tracker-backend:latest
docker push your-username/vehicle-tracker-frontend:latest

# Or use the automated script
npm run docker:build
npm run docker:push
```

**Pull & Run from Docker Hub:**

```bash
# Pull images
docker pull your-username/vehicle-tracker-backend:latest
docker pull your-username/vehicle-tracker-frontend:latest

# Update docker-compose.prod.yml with your image names
# Then deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Local Deployment

```bash
# Build and deploy locally
docker-compose -f docker-compose.prod.yml up -d
```

#### VPS Deployment

**Prerequisites:**

- Ubuntu 20.04+ VPS with root access
- Domain pointed to VPS IP
- Docker Hub account (optional)

**GitHub Secrets Configuration (for CI/CD):**

Before the automated deployment works, you need to configure GitHub repository secrets:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these secrets:

| Secret Name       | Description                            | Example Value                            |
| ----------------- | -------------------------------------- | ---------------------------------------- |
| `DOCKER_USERNAME` | Your Docker Hub username               | `your-dockerhub-username`                |
| `DOCKER_PASSWORD` | Docker Hub access token (not password) | `dckr_pat_abc123...`                     |
| `VPS_HOST`        | Your VPS IP address or domain          | `192.168.1.100` or `your-domain.com`     |
| `VPS_USERNAME`    | VPS username                           | `root` or `ubuntu`                       |
| `VPS_SSH_KEY`     | Private SSH key content                | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

**To create Docker Hub access token:**

1. Go to [Docker Hub](https://hub.docker.com/) → Account Settings → Security
2. Click "New Access Token"
3. Name it "GitHub Actions" and select Read/Write/Delete permissions
4. Copy the generated token (use this as `DOCKER_PASSWORD`)

**To get SSH private key:**

```bash
# Generate SSH key pair (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy private key content (use this as VPS_SSH_KEY secret)
cat ~/.ssh/id_rsa

# Copy public key to VPS
ssh-copy-id user@your-vps-ip
```

**Step 1: Automated VPS Setup**

```bash
# On Ubuntu VPS, run automated setup script
curl -o setup-vps.sh https://raw.githubusercontent.com/your-repo/vehicle-tracker/main/deploy/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh your-domain.com your-docker-username
```

**Step 2: DNS Configuration**
Point domain to VPS IP:

```
A     your-domain.com      → YOUR_VPS_IP
A     www.your-domain.com  → YOUR_VPS_IP
```

**Step 3: Verify Deployment**

- Application: `https://your-domain.com`
- API Health: `https://your-domain.com/api/health`
- API Docs: `https://your-domain.com/api-docs`

**Automatic Features:**

- ✅ Database migrations run automatically
- ✅ Database seeding with demo data (admin/user accounts + sample vehicles)
- ✅ SSL certificates generated automatically with Let's Encrypt
- ✅ HTTP to HTTPS redirect
- ✅ Production environment variables configured

**Step 4: Service Management**

```bash
# Check status
sudo systemctl status vehicle-tracker

# View logs
sudo journalctl -u vehicle-tracker -f

# Restart service
sudo systemctl restart vehicle-tracker
```

**Manual VPS Setup (Alternative):**

```bash
# 1. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 2. Clone repository
git clone <repository-url>
cd vehicle-tracker

# 3. Setup environment
cp .env.example .env.production
# Edit .env.production with production configuration

# 4. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 5. Setup Nginx & SSL
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## API Documentation

**Development**: `http://localhost:3000/api-docs`  
**Production**: `https://vehicletracker.abdulhalimzhr.com/api-docs`

## Deployment Status

✅ **Current Production Deployment**:

- **URL**: [https://vehicletracker.abdulhalimzhr.com](https://vehicletracker.abdulhalimzhr.com)
- **Status**: Live and operational
- **SSL**: Let's Encrypt certificate (auto-renewal enabled)
- **Database**: PostgreSQL with automated migrations and seeding
- **CI/CD**: GitHub Actions with automated deployment on push to `master`

### Deployment Features

- **Automatic SSL**: Let's Encrypt certificates with auto-renewal
- **Database Management**: Automated migrations and seeding on deployment
- **Health Monitoring**: Container health checks for all services
- **Zero-Downtime**: Rolling updates with Docker Compose
- **Environment Detection**: Frontend automatically detects API URL based on environment

### Troubleshooting

**If deployment fails:**

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs backend

# Restart services
docker compose -f docker-compose.prod.yml restart
```

**If SSL issues occur:**

```bash
# Check SSL certificates
openssl x509 -in /opt/vehicle-tracker/nginx/ssl/fullchain.pem -text -noout

# Regenerate SSL certificates
sudo /opt/vehicle-tracker/scripts/setup-ssl.sh your-domain.com
```

## Live Demo

🌐 **Production URL**: [https://vehicletracker.abdulhalimzhr.com](https://vehicletracker.abdulhalimzhr.com)

## Demo Credentials

**Admin User:**

- Email: `admin@example.com`
- Password: `password123`
- Role: ADMIN (full access - can CRUD vehicles)

**Regular User:**

- Email: `user@example.com`
- Password: `password123`
- Role: USER (read-only access)

> **Note**: Demo data is automatically seeded on deployment, including sample vehicles and trip history.

## Key Features

- 🔐 **Authentication & Authorization**: JWT with role-based access control
- 🚗 **Vehicle Management**: CRUD vehicles with status tracking
- 📊 **Reporting**: Generate Excel reports with date filters
- 📱 **Responsive Design**: Modern UI with TailwindCSS + Radix UI
- 🛡️ **Security**: Input validation, CORS protection, security headers
- 🔄 **Real-time**: Real-time data with React Query
- 📈 **Monitoring**: Health checks and comprehensive logging
- 🚀 **Production Ready**: Automated CI/CD with Docker, SSL, and database management
- 🌐 **Live Demo**: Deployed at [vehicletracker.abdulhalimzhr.com](https://vehicletracker.abdulhalimzhr.com)

## Architecture

```
├── backend/          # Node.js API server
├── frontend/         # React application
├── database/         # PostgreSQL migrations & seeds
├── docker/           # Docker configurations
├── .github/          # CI/CD workflows
└── nginx/            # Reverse proxy config
```

## Available Scripts

```bash
npm run setup      # One-time setup (install deps, create env files, setup DB)
npm run dev        # Start development servers (backend + frontend)
npm run dev:docker # Start everything with Docker
npm run test       # Run all tests
npm run build      # Build for production
npm start:prod     # Start production environment
```

## Testing

### Test Coverage Results

**Backend Coverage:**

```
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   13.1  |   10.86  |  16.12  |  13.43  |
services/           |   36.36 |   14.81  |  38.46  |  37.5   |
  authService.ts    |   61.9  |     75   |  66.66  |  61.9   |
  vehicleService.ts |     50  |   9.09   |  42.85  |    50   |
```

**Frontend Coverage:**

```
File           | % Stmts | % Branch | % Funcs | % Lines |
---------------|---------|----------|---------|---------|
All files      |   65.41 |       90 |   26.31 |   65.41 |
components/ui/ |     100 |      100 |     100 |     100 |
  Button.tsx   |     100 |      100 |     100 |     100 |
stores/        |     100 |      100 |     100 |     100 |
  authStore.ts |     100 |      100 |     100 |     100 |
```

### Test Suites

**Backend Tests (7 tests):**

- ✅ AuthService: User registration, login, token validation
- ✅ VehicleService: CRUD operations, pagination, error handling

**Frontend Tests (33 tests):**

- ✅ AuthStore: State management, persistence, authentication flow
- ✅ Button Component: All variants, sizes, interactions, accessibility
- ✅ Utils: Utility functions, class name merging
- ✅ API Configuration: Service method exports and configuration

### Running Tests

```bash
# Run all tests with coverage
npm run test

# Backend tests only
cd backend && npm run test:coverage

# Frontend tests only
cd frontend && npm run test:coverage

# Watch mode for development
cd backend && npm run test:watch
cd frontend && npm run test:watch
```

### Test Structure

```
├── backend/tests/
│   ├── setup.ts              # Test configuration
│   ├── services/              # Service layer tests
│   └── routes/                # API endpoint tests
├── frontend/tests/
│   ├── setup.ts              # Test configuration
│   ├── components/           # Component tests
│   ├── stores/               # State management tests
│   └── lib/                  # Utility tests
```
