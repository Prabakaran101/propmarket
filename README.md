# 🏠 PropMarket - Real Estate Marketplace

A full-stack, OLX-style real estate platform built with **Java Spring Boot**, **React**, and **PostgreSQL** — packaged for **Docker** and ready for **Jenkins/GitHub Actions CI/CD** and future **Kubernetes** deployment.

---

## 🏗️ Architecture (3-Tier)

```
┌─────────────────────────────────────────────┐
│  TIER 3 — Frontend                          │
│  React 18 + React Router + Axios            │
│  Served via Nginx (Port 80)                 │
│  Nginx proxies /api/* → Backend             │
└─────────────────────┬───────────────────────┘
                      │ HTTP (Docker Network)
┌─────────────────────▼───────────────────────┐
│  TIER 2 — Backend API                       │
│  Java 17 + Spring Boot 3.2                  │
│  Spring Security + JWT Auth                 │
│  REST API (Port 8080)                       │
│  File uploads → /app/uploads volume         │
└─────────────────────┬───────────────────────┘
                      │ JDBC
┌─────────────────────▼───────────────────────┐
│  TIER 1 — Database                          │
│  PostgreSQL 15                              │
│  Port 5432 (internal)                       │
│  Persisted via Docker Volume                │
└─────────────────────────────────────────────┘
```

---

## ✨ Features

- **Authentication**: Register, Login, JWT tokens, Profile management
- **Listings**: Post ads for Buy / Sell / Rent properties
- **Property Types**: House, Apartment, Villa, Plot, Commercial, PG
- **Image Upload**: Up to 10 photos per listing (JPEG, PNG, WebP — 10MB each)
- **Search & Filter**: By type, city, property type, price range, bedrooms, keyword
- **Listing Management**: Edit, activate/deactivate, mark sold/rented, delete
- **Responsive UI**: Works on desktop and mobile
- **Owner Contact**: Show phone/email (login required), WhatsApp button

---

## 🚀 Quick Start — Docker (3 Commands)

### Prerequisites
- Docker 20+ and Docker Compose 2+

```bash
# 1. Clone / enter project directory
cd realestate-app

# 2. Build and start all 3 services
docker-compose up --build -d

# 3. Check all services are healthy
docker-compose ps
```

**Open in browser: http://localhost**

> ⏳ First build takes ~5-8 minutes (Maven dependencies + npm install).
> Subsequent builds are faster thanks to Docker layer caching.

---

## 🔍 Service URLs

| Service  | URL                          | Description                  |
|----------|------------------------------|------------------------------|
| Frontend | http://localhost             | React app (via Nginx)        |
| Backend  | http://localhost:8080/api    | Spring Boot REST API         |
| Database | localhost:5432               | PostgreSQL (internal)        |

---

## 📁 Project Structure

```
realestate-app/
├── backend/                      # Spring Boot API
│   ├── src/main/java/com/realestate/
│   │   ├── RealEstateApplication.java
│   │   ├── config/               # Security, CORS, JPA
│   │   ├── controller/           # REST endpoints
│   │   ├── dto/                  # Request/Response DTOs
│   │   ├── model/                # JPA Entities
│   │   ├── repository/           # Spring Data JPA
│   │   ├── security/             # JWT utils & filter
│   │   └── service/              # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                     # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── listings/         # ListingCard
│   │   │   └── common/           # Navbar, ProtectedRoute
│   │   ├── context/              # AuthContext (JWT state)
│   │   ├── pages/                # All page components
│   │   ├── services/             # Axios API layer
│   │   ├── App.js                # Router + routes
│   │   └── index.css             # Global styles
│   ├── public/index.html
│   ├── nginx.conf                # Nginx reverse proxy config
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── init.sql                  # PostgreSQL init + indexes
│
├── .github/workflows/
│   └── ci-cd.yml                 # GitHub Actions pipeline
│
├── Jenkinsfile                   # Jenkins pipeline
├── docker-compose.yml            # 3-tier orchestration
└── README.md
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| POST   | /api/auth/register    | No   | Register new user     |
| POST   | /api/auth/login       | No   | Login, returns JWT    |
| GET    | /api/auth/me          | Yes  | Get current user      |
| PUT    | /api/auth/profile     | Yes  | Update profile        |
| POST   | /api/auth/profile/image | Yes | Upload profile photo |

### Listings
| Method | Endpoint                   | Auth | Description            |
|--------|----------------------------|------|------------------------|
| GET    | /api/listings/search       | No   | Search with filters    |
| GET    | /api/listings/{id}         | No   | Get listing details    |
| POST   | /api/listings              | Yes  | Create listing         |
| PUT    | /api/listings/{id}         | Yes  | Update listing         |
| DELETE | /api/listings/{id}         | Yes  | Delete listing         |
| PATCH  | /api/listings/{id}/status  | Yes  | Change status          |
| GET    | /api/listings/my           | Yes  | My listings            |
| DELETE | /api/listings/images/{id}  | Yes  | Delete image           |

---

## ⚙️ Environment Variables

### Backend
| Variable        | Default                              | Description       |
|-----------------|--------------------------------------|-------------------|
| DB_URL          | jdbc:postgresql://db:5432/realestatedb | PostgreSQL URL  |
| DB_USERNAME     | realestate                           | DB user           |
| DB_PASSWORD     | realestate123                        | DB password       |
| JWT_SECRET      | (long string)                        | JWT signing key   |
| UPLOAD_DIR      | /app/uploads                         | Image storage dir |
| CORS_ORIGINS    | http://localhost                     | CORS whitelist    |

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start with fresh build
docker-compose up --build -d

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all
docker-compose down

# Stop and remove volumes (DELETES ALL DATA)
docker-compose down -v

# Restart one service
docker-compose restart backend

# Check health
docker-compose ps
```

---

## 🔧 Jenkins Setup

1. Create a new **Pipeline** job in Jenkins
2. Point to your Git repository
3. Set **Script Path** to `Jenkinsfile`
4. Add these **Credentials** in Jenkins:
   - `docker-hub-credentials` — DockerHub username/password
5. Run the pipeline

---

## 🤖 GitHub Actions Setup

1. Go to your repo → Settings → Secrets
2. Add these secrets:
   - `DOCKERHUB_USERNAME` — your DockerHub username
   - `DOCKERHUB_TOKEN` — DockerHub access token
   - `DEPLOY_HOST` — your server IP (for deploy stage)
   - `DEPLOY_USER` — SSH username
   - `DEPLOY_SSH_KEY` — private SSH key

---

## ☸️ Kubernetes-Ready Notes

For future Kubernetes deployment, each service maps to:
- **Deployment** + **Service** per tier
- **PersistentVolumeClaim** for uploads & postgres data
- **ConfigMap** for non-secret config
- **Secret** for DB passwords, JWT secret
- **Ingress** for routing (replaces Nginx proxy)

The Docker images built here are immediately usable in Kubernetes manifests.

---

## 🛠️ Local Development (Without Docker)

### Backend
```bash
cd backend
# Start PostgreSQL locally (or use Docker just for DB)
docker run -d -p 5432:5432 -e POSTGRES_DB=realestatedb \
  -e POSTGRES_USER=realestate -e POSTGRES_PASSWORD=realestate123 postgres:15-alpine

mvn spring-boot:run
# API available at http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm start
# App available at http://localhost:3000
# Proxies /api/* → http://localhost:8080 (via package.json proxy)
```

---

## 📝 License

MIT — Free to use for learning and production projects.
