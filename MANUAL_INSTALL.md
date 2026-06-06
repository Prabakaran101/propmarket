# 🛠️ PropMarket — Manual Installation Guide
## Run Frontend & Backend Directly (No Docker, No Prebuild)

This guide walks you through installing and running the **backend (Java/Spring Boot)**
and **frontend (React)** manually on your local machine, step by step.

---

## 📋 What You Will Need (Prerequisites)

Install these tools before starting:

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17 or higher | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org/download.cgi |
| Node.js | 18 or higher | https://nodejs.org |
| npm | comes with Node | — |
| PostgreSQL | 13 or higher | https://www.postgresql.org/download |
| Git | any | https://git-scm.com |

### Check if already installed

Open a terminal and run each line:

```bash
java -version
# Expected: openjdk version "17.x.x" or higher

mvn -version
# Expected: Apache Maven 3.x.x

node -version
# Expected: v18.x.x or higher

npm -version
# Expected: 9.x.x or higher

psql --version
# Expected: psql (PostgreSQL) 13.x or higher
```

If any command says "not found", install that tool first before continuing.

---

## 📂 Step 1 — Get the Project Files

If you downloaded the `.tar.gz` file:

```bash
# Extract it
tar -xzf realestate-app.tar.gz

# Go into the project folder
cd realestate-app

# Confirm structure
ls
# You should see: backend/   frontend/   database/   docker-compose.yml   README.md
```

If you are using Git:

```bash
git clone <your-repo-url>
cd realestate-app
```

---

## 🗄️ Step 2 — Set Up PostgreSQL Database

### 2A. Start PostgreSQL

**On Ubuntu/Debian Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On macOS (Homebrew):**
```bash
brew services start postgresql@15
```

**On Windows:**
Open the Start Menu → search "pgAdmin" or "PostgreSQL" → start the service.

### 2B. Create the Database and User

Open a PostgreSQL terminal:

```bash
# On Linux/macOS — log in as the postgres superuser
sudo -u postgres psql

# On Windows — open pgAdmin or run:
# psql -U postgres
```

Now type these SQL commands inside the psql prompt:

```sql
-- Create the database user
CREATE USER realestate WITH PASSWORD 'realestate123';

-- Create the database
CREATE DATABASE realestatedb OWNER realestate;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE realestatedb TO realestate;

-- Exit psql
\q
```

### 2C. Test the Connection

```bash
psql -U realestate -d realestatedb -h localhost

# You should see:
# psql (15.x)
# Type "help" for help.
# realestatedb=>

# Type \q to exit
\q
```

If you see "connection refused", make sure PostgreSQL is running.

---

## ⚙️ Step 3 — Configure the Backend

Open the file:
```
backend/src/main/resources/application.properties
```

It already has default values that match what you created in Step 2.
If you used different values, update these lines:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/realestatedb
spring.datasource.username=realestate
spring.datasource.password=realestate123
```

Also set where uploaded images will be saved on your machine:

```properties
# Linux/macOS:
file.upload.dir=/tmp/realestate-uploads

# Windows (use forward slashes or double backslashes):
file.upload.dir=C:/realestate-uploads
```

Create that folder now:

```bash
# Linux/macOS:
mkdir -p /tmp/realestate-uploads

# Windows (in Command Prompt or PowerShell):
mkdir C:\realestate-uploads
```

---

## 🚀 Step 4 — Install and Run the Backend

Open a **new terminal window** and go to the backend folder:

```bash
cd realestate-app/backend
```

### 4A. Download all Java dependencies

```bash
mvn dependency:resolve
```

This downloads all Spring Boot libraries from the internet.
It may take 2–5 minutes the first time.

You should see a lot of `[INFO]` lines and end with:
```
[INFO] BUILD SUCCESS
```

### 4B. Run the backend

```bash
mvn spring-boot:run
```

Wait for this line to appear (takes about 20–40 seconds):

```
Started RealEstateApplication in 8.xxx seconds
```

The backend is now running at: **http://localhost:8080**

### 4C. Test the backend is working

Open a second terminal and run:

```bash
curl http://localhost:8080/api/listings/search
```

You should get a JSON response like:
```json
{"success":true,"message":"Success","data":{"content":[],...}}
```

That means the backend is working correctly.

> ⚠️ Keep this terminal open. The backend must keep running while you use the app.

---

## 💻 Step 5 — Install and Run the Frontend

Open a **new terminal window** (keep the backend terminal running) and go to the frontend folder:

```bash
cd realestate-app/frontend
```

### 5A. Install Node.js packages

```bash
npm install
```

This installs React, Axios, React Router, and all other frontend libraries.
It creates a `node_modules/` folder. First run takes 1–3 minutes.

You should see something like:
```
added 1432 packages in 45s
```

### 5B. Configure the API URL

The frontend needs to know where the backend is.

Open the file `frontend/package.json` and confirm this line exists at the bottom:

```json
"proxy": "http://localhost:8080"
```

This tells React's dev server to forward all `/api/` requests to the backend.
It should already be there — just verify.

### 5C. Start the frontend

```bash
npm start
```

Wait for this output (takes 20–60 seconds):

```
Compiled successfully!

You can now view realestate-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Your browser should automatically open to **http://localhost:3000**

If it does not open automatically, open your browser and go to:
**http://localhost:3000**

---

## ✅ Step 6 — Verify Everything Works

You should now have:

| What | Terminal | URL |
|------|----------|-----|
| PostgreSQL | running as service | port 5432 |
| Backend (Spring Boot) | Terminal 1 | http://localhost:8080 |
| Frontend (React) | Terminal 2 | http://localhost:3000 |

### Test the full flow:

1. Open **http://localhost:3000** in your browser
2. Click **Register** and create an account
3. Log in with your credentials
4. Click **+ Post Ad** and fill in a property listing
5. Upload a photo and submit
6. You should see your listing appear on the home page

---

## 🧪 Step 7 — Test Backend APIs Manually

You can test the API directly using curl or Postman:

### Register a user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "phone": "9876543210"
  }'
```

### Login and get JWT token:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

Copy the `token` value from the response. Use it in the next request.

### Get your profile (replace YOUR_TOKEN):
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search listings:
```bash
curl "http://localhost:8080/api/listings/search?city=Mumbai&listingType=RENT"
```

---

## 🔁 Step 8 — How to Stop and Restart

### Stop the backend:
In Terminal 1, press `Ctrl + C`

### Stop the frontend:
In Terminal 2, press `Ctrl + C`

### Restart both (next time):

```bash
# Terminal 1 — Backend
cd realestate-app/backend
mvn spring-boot:run

# Terminal 2 — Frontend
cd realestate-app/frontend
npm start
```

> PostgreSQL usually starts automatically with your system.
> If not, run the start command from Step 2A.

---

## 📦 Step 9 — Build Production JAR and Static Files

When you want to build final deployable files (not for development):

### Build the backend JAR:

```bash
cd realestate-app/backend
mvn clean package -DskipTests
```

The output file will be at:
```
backend/target/realestate-backend-1.0.0.jar
```

Run the JAR directly (no Maven needed):
```bash
java -jar backend/target/realestate-backend-1.0.0.jar
```

### Build the frontend static files:

```bash
cd realestate-app/frontend
npm run build
```

The output will be at:
```
frontend/build/
```

These static files can be served by any web server (Nginx, Apache, etc.).

---

## 🐳 Step 10 — Build Docker Images Manually (Without docker-compose)

If you want to build Docker images yourself without using `docker-compose up --build`:

### Build backend image:
```bash
cd realestate-app/backend

# Build the image and tag it
docker build -t realestate-backend:1.0 .

# Confirm it was created
docker images | grep realestate-backend
```

### Build frontend image:
```bash
cd realestate-app/frontend

# Build the image and tag it
docker build -t realestate-frontend:1.0 .

# Confirm it was created
docker images | grep realestate-frontend
```

### Run each container manually (without docker-compose):

```bash
# Step 1 — Create a shared network
docker network create realestate-network

# Step 2 — Run PostgreSQL
docker run -d \
  --name realestate-db \
  --network realestate-network \
  -e POSTGRES_DB=realestatedb \
  -e POSTGRES_USER=realestate \
  -e POSTGRES_PASSWORD=realestate123 \
  -v realestate-pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

# Wait 10 seconds for PostgreSQL to start
sleep 10

# Step 3 — Run Backend
docker run -d \
  --name realestate-backend \
  --network realestate-network \
  -e DB_URL=jdbc:postgresql://realestate-db:5432/realestatedb \
  -e DB_USERNAME=realestate \
  -e DB_PASSWORD=realestate123 \
  -e JWT_SECRET=PropMarketJWTSecretKey2024VeryLongAndSecure \
  -e UPLOAD_DIR=/app/uploads \
  -v realestate-uploads:/app/uploads \
  -p 8080:8080 \
  realestate-backend:1.0

# Wait 60 seconds for Spring Boot to start fully
sleep 60

# Step 4 — Run Frontend
docker run -d \
  --name realestate-frontend \
  --network realestate-network \
  -p 80:80 \
  realestate-frontend:1.0

# Step 5 — Check all 3 containers are running
docker ps

# Step 6 — Open browser at http://localhost
```

### Useful Docker commands during manual run:

```bash
# See logs of backend
docker logs realestate-backend -f

# See logs of frontend
docker logs realestate-frontend -f

# See logs of database
docker logs realestate-db -f

# Stop all containers
docker stop realestate-frontend realestate-backend realestate-db

# Remove all containers
docker rm realestate-frontend realestate-backend realestate-db

# Remove the network
docker network rm realestate-network

# Remove volumes (DELETES ALL DATA)
docker volume rm realestate-pgdata realestate-uploads
```

### Tag and push images to DockerHub:

```bash
# Login to DockerHub
docker login

# Tag backend image with your username
docker tag realestate-backend:1.0 your-dockerhub-username/realestate-backend:1.0
docker tag realestate-backend:1.0 your-dockerhub-username/realestate-backend:latest

# Tag frontend image with your username
docker tag realestate-frontend:1.0 your-dockerhub-username/realestate-frontend:1.0
docker tag realestate-frontend:1.0 your-dockerhub-username/realestate-frontend:latest

# Push both images
docker push your-dockerhub-username/realestate-backend:1.0
docker push your-dockerhub-username/realestate-backend:latest
docker push your-dockerhub-username/realestate-frontend:1.0
docker push your-dockerhub-username/realestate-frontend:latest
```

---

## 🔧 Common Problems and Fixes

### Problem: `mvn spring-boot:run` fails with "Port 8080 already in use"
```bash
# Find and kill the process using port 8080
# On Linux/macOS:
lsof -ti:8080 | xargs kill -9

# On Windows (PowerShell):
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### Problem: `npm start` fails with "Port 3000 already in use"
```bash
# On Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Or run on a different port:
PORT=3001 npm start
```

### Problem: Backend says "Connection refused" for PostgreSQL
```bash
# Make sure PostgreSQL is running:
sudo systemctl status postgresql       # Linux
brew services list | grep postgresql   # macOS

# Restart if needed:
sudo systemctl restart postgresql      # Linux
brew services restart postgresql@15   # macOS
```

### Problem: `mvn` command not found
```bash
# Download Maven from https://maven.apache.org/download.cgi
# Extract it, then add to PATH:
export PATH=$PATH:/path/to/apache-maven-3.9.x/bin

# Add this line to ~/.bashrc or ~/.zshrc to make it permanent
```

### Problem: `java` command not found or wrong version
```bash
# Install JDK 17 from https://adoptium.net
# Then set JAVA_HOME:
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64   # Linux example
export PATH=$JAVA_HOME/bin:$PATH
```

### Problem: Frontend shows blank page or "Network Error"
Make sure the backend is running first. The proxy in `package.json` only works when
`http://localhost:8080` is reachable. Start the backend before the frontend.

### Problem: Images not uploading
Make sure the upload directory exists and is writable:
```bash
mkdir -p /tmp/realestate-uploads
chmod 755 /tmp/realestate-uploads
```
Then update `application.properties`:
```properties
file.upload.dir=/tmp/realestate-uploads
```

---

## 📁 Folder Reference

```
realestate-app/
├── backend/
│   ├── pom.xml                        ← Maven dependencies (like package.json for Java)
│   ├── Dockerfile                     ← For building Docker image
│   └── src/main/
│       ├── java/com/realestate/       ← All Java source code
│       └── resources/
│           └── application.properties ← DB URL, JWT secret, upload path
│
├── frontend/
│   ├── package.json                   ← npm dependencies + proxy config
│   ├── Dockerfile                     ← For building Docker image
│   ├── nginx.conf                     ← Used inside Docker image only
│   └── src/
│       ├── App.js                     ← Main router
│       ├── index.js                   ← React entry point
│       ├── index.css                  ← Global styles
│       ├── context/AuthContext.js     ← JWT login state
│       ├── services/api.js            ← All API calls (Axios)
│       ├── components/                ← Reusable components
│       └── pages/                     ← One file per screen
│
├── database/
│   └── init.sql                       ← Run once to set up indexes
│
├── docker-compose.yml                 ← Runs all 3 tiers with one command
├── Jenkinsfile                        ← Jenkins CI/CD pipeline
└── .github/workflows/ci-cd.yml       ← GitHub Actions CI/CD
```

---

## 🏁 Quick Reference Summary

```
MANUAL (LOCAL) DEVELOPMENT:
─────────────────────────────────────────────────
[1] Start PostgreSQL service
[2] Create user + database in psql
[3] Edit application.properties (DB + upload path)
[4] Terminal 1: cd backend && mvn spring-boot:run
[5] Terminal 2: cd frontend && npm install && npm start
[6] Open http://localhost:3000

MANUAL DOCKER (BUILD IMAGES YOURSELF):
─────────────────────────────────────────────────
[1] cd backend  && docker build -t realestate-backend:1.0 .
[2] cd frontend && docker build -t realestate-frontend:1.0 .
[3] docker network create realestate-network
[4] Run DB container → Run Backend container → Run Frontend container
[5] Open http://localhost:80

AUTOMATED DOCKER (ONE COMMAND):
─────────────────────────────────────────────────
docker-compose up --build -d
Open http://localhost
```
