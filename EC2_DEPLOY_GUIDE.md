# PropMarket — Manual Build & EC2 Deployment Guide
## Build Outside Docker → Docker Packages the Artifact → Run on AWS EC2

This guide follows a clean, stage-separated workflow:

```
YOUR MACHINE                         EC2 INSTANCE
─────────────────────────────────    ───────────────────────────────
[1] mvn package  → target/*.jar      [5] Install Docker
[2] npm build    → build/ folder     [6] Install PostgreSQL
[3] docker build (backend image)     [7] Create DB + user
[4] docker build (frontend image)    [8] docker run (3 containers)
    docker push  → DockerHub             Open http://<PUBLIC-IP>
```

**Rule:** Docker never compiles. It only packages what you already built.
**Why:** Each step becomes one Jenkins stage later. Clean, traceable, fast.

---

## PART A — Your Local Machine Setup

### A1. Prerequisites — Install These First

```bash
# Check what you already have:
java -version          # need 17+
mvn -version           # need 3.8+
node -version          # need 18+
npm -version           # need 9+
docker -version        # need 20+
```

**Install links:**
- Java 17: https://adoptium.net  (download Eclipse Temurin 17)
- Maven:   https://maven.apache.org/download.cgi
- Node 18: https://nodejs.org (LTS version)
- Docker:  https://docs.docker.com/get-docker

**Add Maven to PATH after install (Linux/macOS):**
```bash
# Add to ~/.bashrc or ~/.zshrc
export M2_HOME=/opt/apache-maven-3.9.5
export PATH=$M2_HOME/bin:$PATH

# Reload
source ~/.bashrc
```

**On Windows — add to System Environment Variables:**
```
Variable: M2_HOME    Value: C:\apache-maven-3.9.5
Variable: Path       Add:   C:\apache-maven-3.9.5\bin
```

---

### A2. Get the Project

```bash
# Extract the tar.gz you downloaded
tar -xzf realestate-app.tar.gz
cd realestate-app

# Confirm the folders exist
ls
# backend/   frontend/   database/   docker-compose.yml   README.md
```

---

## PART B — Build the Backend JAR

### B1. Go into the backend folder

```bash
cd realestate-app/backend
```

### B2. Download all dependencies (first time only)

```bash
mvn dependency:resolve
```

This downloads Spring Boot, JPA, JWT, Lombok etc. from Maven Central.
Takes 2–4 minutes first time. Subsequent runs are instant (cached).

Watch for at the end:
```
[INFO] BUILD SUCCESS
```

### B3. Compile and package into a JAR

```bash
mvn clean package -DskipTests
```

What this does step by step:
- `clean`   → deletes any old build files in `target/`
- `package` → compiles Java, runs processors, packages into a single fat JAR
- `-DskipTests` → skips unit tests (run them separately with `mvn test`)

When it finishes you will see:
```
[INFO] BUILD SUCCESS
[INFO] Total time: 35.xxx s
```

### B4. Confirm the JAR was created

```bash
ls -lh target/realestate-backend-1.0.0.jar
```

Expected output:
```
-rw-r--r-- 1 user group 52M May 20 10:00 target/realestate-backend-1.0.0.jar
```

The JAR is roughly 50–60 MB (it includes Spring Boot + all libraries inside).

---

## PART C — Build the Frontend Static Files

### C1. Go into the frontend folder

```bash
# If you are in backend/ first go up one level
cd ../frontend

# Or from project root:
cd realestate-app/frontend
```

### C2. Install all npm packages

```bash
npm install
```

This reads `package.json` and downloads React, Axios, React Router etc.
Creates a `node_modules/` folder (~300 MB). Takes 1–3 minutes first time.

You will see:
```
added 1432 packages in 47s
```

### C3. Set the API URL for production

The React app needs to know the backend URL. For EC2 we use `/api` (relative path)
so that Nginx can proxy it — this is already set correctly.

Confirm in `frontend/package.json` — this line should be there:
```json
"proxy": "http://localhost:8080"
```
That proxy line is only used during local `npm start`. In production (docker build),
the Nginx config handles the proxy. Nothing to change.

### C4. Build the production static files

```bash
npm run build
```

What this does:
- Compiles JSX to plain JavaScript
- Minifies and bundles all files
- Generates optimised HTML/CSS/JS in the `build/` folder

When done you will see:
```
The build folder is ready to be deployed.
```

### C5. Confirm the build folder was created

```bash
ls build/
# index.html   static/   asset-manifest.json   ...

ls build/static/js/
# main.xxxxxxxx.js   (your compiled React app, ~500KB)
```

---

## PART D — Build Docker Images (No Compilation Inside Docker)

At this point you have:
- `backend/target/realestate-backend-1.0.0.jar` ← built by Maven
- `frontend/build/` ← built by npm

Docker will only **copy** these into the image. No compiling.

### D1. Build the Backend Docker Image

```bash
cd realestate-app/backend

docker build -t realestate-backend:1.0 .
```

What happens inside the Dockerfile:
1. Pulls `eclipse-temurin:17-jre-alpine` (Java runtime, ~85 MB)
2. Creates `/app/uploads` directory
3. Creates a non-root user `appuser`
4. Copies `target/realestate-backend-1.0.0.jar` → `app.jar`
5. Sets entrypoint to `java -jar app.jar`

Expected output (fast, ~30 seconds):
```
[+] Building 28.5s
 => FROM eclipse-temurin:17-jre-alpine
 => COPY target/realestate-backend-1.0.0.jar app.jar
 => exporting to image
Successfully built abc123def456
Successfully tagged realestate-backend:1.0
```

Confirm the image:
```bash
docker images | grep realestate-backend
# realestate-backend   1.0   abc123def456   30 seconds ago   185MB
```

### D2. Build the Frontend Docker Image

```bash
cd realestate-app/frontend

docker build -t realestate-frontend:1.0 .
```

What happens inside the Dockerfile:
1. Pulls `nginx:1.25-alpine` (~40 MB)
2. Copies `nginx.conf` → `/etc/nginx/conf.d/default.conf`
3. Copies `build/` folder → `/usr/share/nginx/html`
4. Sets correct file permissions

Expected output (very fast, ~15 seconds):
```
[+] Building 12.3s
 => FROM nginx:1.25-alpine
 => COPY nginx.conf /etc/nginx/conf.d/default.conf
 => COPY build/ /usr/share/nginx/html
 => exporting to image
Successfully built 789xyz
Successfully tagged realestate-frontend:1.0
```

Confirm the image:
```bash
docker images | grep realestate-frontend
# realestate-frontend   1.0   789xyz   15 seconds ago   48MB
```

### D3. Tag with version number (good habit before pushing)

```bash
# Also tag as latest for convenience
docker tag realestate-backend:1.0  realestate-backend:latest
docker tag realestate-frontend:1.0 realestate-frontend:latest
```

### D4. Push Images to DockerHub

First, create a free account at https://hub.docker.com  
Then:

```bash
# Login to DockerHub
docker login
# Enter your DockerHub username and password

# Replace "yourusername" with your actual DockerHub username
DHUSER=yourusername

# Tag backend with your DockerHub username
docker tag realestate-backend:1.0 $DHUSER/realestate-backend:1.0
docker tag realestate-backend:1.0 $DHUSER/realestate-backend:latest

# Tag frontend with your DockerHub username
docker tag realestate-frontend:1.0 $DHUSER/realestate-frontend:1.0
docker tag realestate-frontend:1.0 $DHUSER/realestate-frontend:latest

# Push both
docker push $DHUSER/realestate-backend:1.0
docker push $DHUSER/realestate-backend:latest
docker push $DHUSER/realestate-frontend:1.0
docker push $DHUSER/realestate-frontend:latest
```

You will see upload progress bars for each layer.

---

## PART E — AWS EC2 Instance Setup

### E1. Launch EC2 Instance

1. Log in to https://console.aws.amazon.com
2. Go to **EC2 → Launch Instance**
3. Choose:
   - **Name**: propmarket-server
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier eligible)
   - **Instance type**: t2.micro (Free Tier) or t2.small (recommended for Java)
   - **Key pair**: Create new → download `.pem` file → save it safely
4. **Security Group — open these ports:**

   | Type | Port | Source | Purpose |
   |------|------|--------|---------|
   | SSH | 22 | Your IP (or 0.0.0.0/0 for lab) | Terminal access |
   | HTTP | 80 | 0.0.0.0/0 | Frontend access |
   | Custom TCP | 8080 | 0.0.0.0/0 | Backend API (optional) |
   | Custom TCP | 5432 | Your IP only | PostgreSQL (optional) |

5. Click **Launch Instance**
6. Note the **Public IPv4 address** from the EC2 console (e.g. `54.123.45.67`)

### E2. Connect to EC2 via SSH

```bash
# Fix key permissions (required on Linux/macOS)
chmod 400 your-key.pem

# SSH into EC2
ssh -i your-key.pem ubuntu@54.123.45.67
# Replace 54.123.45.67 with your actual EC2 public IP
```

On Windows use PuTTY or Windows Terminal with OpenSSH.

---

## PART F — EC2 Server Setup

Run all commands below while SSH'd into your EC2 instance.

### F1. Update the system

```bash
sudo apt-get update -y
sudo apt-get upgrade -y
```

### F2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add ubuntu user to docker group (so you don't need sudo every time)
sudo usermod -aG docker ubuntu

# Apply group change — IMPORTANT: log out and back in
exit
```

SSH back in:
```bash
ssh -i your-key.pem ubuntu@54.123.45.67
```

Verify Docker works without sudo:
```bash
docker version
# Client: Docker Engine - Community
# Version: 24.x.x
```

### F3. Install PostgreSQL

```bash
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Confirm it is running
sudo systemctl status postgresql
# ● postgresql.service - PostgreSQL RDBMS
#    Active: active (running)
```

### F4. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql
```

Inside the psql prompt, type these commands:

```sql
-- Create user
CREATE USER realestate WITH PASSWORD 'realestate123';

-- Create database
CREATE DATABASE realestatedb OWNER realestate;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE realestatedb TO realestate;

-- Verify
\l
-- You should see realestatedb in the list

-- Exit
\q
```

### F5. Test DB connection

```bash
psql -U realestate -d realestatedb -h localhost -c "SELECT version();"
# PostgreSQL 14.x on x86_64-pc-linux-gnu ...
```

### F6. Create Docker network

```bash
docker network create realestate-network
```

This network lets the backend container reach the database,
and the frontend container reach the backend — by container name.

---

## PART G — Run the Application on EC2

### G1. Pull your images from DockerHub

```bash
DHUSER=yourusername    # your DockerHub username

docker pull $DHUSER/realestate-backend:1.0
docker pull $DHUSER/realestate-frontend:1.0

# Confirm
docker images
```

Alternatively, if you want to copy and build directly on EC2:
```bash
# Copy project files to EC2
scp -i your-key.pem -r realestate-app/ ubuntu@54.123.45.67:~/

# SSH in and build
ssh -i your-key.pem ubuntu@54.123.45.67
cd realestate-app/backend
docker build -t realestate-backend:1.0 .

cd ../frontend
docker build -t realestate-frontend:1.0 .
```

### G2. Run the Backend Container

```bash
EC2_PUBLIC_IP=54.123.45.67   # replace with your EC2 public IP

docker run -d \
  --name realestate-backend \
  --network realestate-network \
  --restart unless-stopped \
  -e DB_URL=jdbc:postgresql://172.17.0.1:5432/realestatedb \
  -e DB_USERNAME=realestate \
  -e DB_PASSWORD=realestate123 \
  -e JWT_SECRET=PropMarketJWTSecretKey2024VeryLongAndSecureForEC2 \
  -e UPLOAD_DIR=/app/uploads \
  -e CORS_ORIGINS=http://${EC2_PUBLIC_IP} \
  -v realestate-uploads:/app/uploads \
  -p 8080:8080 \
  realestate-backend:1.0
```

**Why `172.17.0.1` for the DB?**
PostgreSQL is installed directly on the EC2 host (not in a container).
`172.17.0.1` is the Docker bridge gateway — the host machine's IP as seen from inside a container.

**Allow PostgreSQL to accept connections from Docker bridge:**

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add this line at the end (before the existing lines):
host    realestatedb    realestate    172.17.0.0/16    md5

# Save and exit (Ctrl+X, Y, Enter)

# Also edit postgresql.conf to listen on all interfaces
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find and change this line:
listen_addresses = 'localhost'
# Change to:
listen_addresses = '*'

# Save, then restart PostgreSQL
sudo systemctl restart postgresql
```

Test backend is running:
```bash
docker logs realestate-backend -f
# Wait until you see: Started RealEstateApplication in 8.xxx seconds
# Press Ctrl+C to stop following logs
```

Test the API:
```bash
curl http://localhost:8080/api/listings/search
# {"success":true,"message":"Success","data":{"content":[],...}}
```

### G3. Run the Frontend Container

```bash
docker run -d \
  --name realestate-frontend \
  --network realestate-network \
  --restart unless-stopped \
  -p 80:80 \
  realestate-frontend:1.0
```

Check it started:
```bash
docker logs realestate-frontend
# /docker-entrypoint.sh: Configuration complete; ready for start up
```

### G4. Verify all containers are running

```bash
docker ps
```

Expected output:
```
CONTAINER ID  IMAGE                      STATUS          PORTS
abc123        realestate-frontend:1.0    Up 1 minute     0.0.0.0:80->80/tcp
def456        realestate-backend:1.0     Up 2 minutes    0.0.0.0:8080->8080/tcp
```

### G5. Open the App in Your Browser

```
http://54.123.45.67
```

Replace `54.123.45.67` with your EC2 public IP.

You should see the PropMarket home page.

**Test the full flow:**
1. Click Register → create an account
2. Log in
3. Click + Post Ad → fill in a property → upload a photo → Submit
4. The listing should appear on the home page

---

## PART H — Useful Commands After Deployment

### View logs

```bash
# Backend logs (live)
docker logs realestate-backend -f

# Frontend logs
docker logs realestate-frontend -f

# Last 100 lines only
docker logs realestate-backend --tail 100
```

### Stop and start containers

```bash
# Stop
docker stop realestate-frontend
docker stop realestate-backend

# Start again
docker start realestate-backend
docker start realestate-frontend

# Restart (e.g. after config change)
docker restart realestate-backend
```

### Deploy a new version (update)

```bash
# --- On your local machine ---

# 1. Make code changes
# 2. Rebuild JAR
cd backend && mvn clean package -DskipTests

# 3. Rebuild image with new version tag
docker build -t realestate-backend:1.1 .
docker tag realestate-backend:1.1 yourusername/realestate-backend:1.1
docker push yourusername/realestate-backend:1.1

# --- On EC2 ---

# 4. Pull new image
docker pull yourusername/realestate-backend:1.1

# 5. Stop and remove old container
docker stop realestate-backend
docker rm realestate-backend

# 6. Run new container
docker run -d \
  --name realestate-backend \
  --network realestate-network \
  --restart unless-stopped \
  -e DB_URL=jdbc:postgresql://172.17.0.1:5432/realestatedb \
  -e DB_USERNAME=realestate \
  -e DB_PASSWORD=realestate123 \
  -e JWT_SECRET=PropMarketJWTSecretKey2024VeryLongAndSecureForEC2 \
  -e UPLOAD_DIR=/app/uploads \
  -e CORS_ORIGINS=http://54.123.45.67 \
  -v realestate-uploads:/app/uploads \
  -p 8080:8080 \
  yourusername/realestate-backend:1.1
```

### Check disk usage

```bash
docker images          # list all images
docker system df       # disk used by Docker
docker image prune     # remove unused images
```

---

## PART I — Jenkins Pipeline Mapping

Each manual step in this guide maps to one Jenkins stage:

```groovy
pipeline {
    agent any

    environment {
        VERSION  = "${env.BUILD_NUMBER}"
        DHUSER   = "yourusername"
        EC2_IP   = "54.123.45.67"
    }

    stages {
        // Maps to Part B
        stage('Build Backend JAR') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        // Maps to Part C
        stage('Build Frontend Static') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        // Maps to Part D1
        stage('Docker Build Backend') {
            steps {
                dir('backend') {
                    sh "docker build -t realestate-backend:${VERSION} ."
                }
            }
        }

        // Maps to Part D2
        stage('Docker Build Frontend') {
            steps {
                dir('frontend') {
                    sh "docker build -t realestate-frontend:${VERSION} ."
                }
            }
        }

        // Maps to Part D4
        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
                    sh "docker tag realestate-backend:${VERSION}  ${DHUSER}/realestate-backend:${VERSION}"
                    sh "docker tag realestate-frontend:${VERSION} ${DHUSER}/realestate-frontend:${VERSION}"
                    sh "docker push ${DHUSER}/realestate-backend:${VERSION}"
                    sh "docker push ${DHUSER}/realestate-frontend:${VERSION}"
                }
            }
        }

        // Maps to Part G2, G3
        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_IP} '
                            docker pull ${DHUSER}/realestate-backend:${VERSION}
                            docker stop realestate-backend || true
                            docker rm   realestate-backend || true
                            docker run -d \\
                              --name realestate-backend \\
                              --network realestate-network \\
                              --restart unless-stopped \\
                              -e DB_URL=jdbc:postgresql://172.17.0.1:5432/realestatedb \\
                              -e DB_USERNAME=realestate \\
                              -e DB_PASSWORD=realestate123 \\
                              -e JWT_SECRET=PropMarketJWT2024 \\
                              -e UPLOAD_DIR=/app/uploads \\
                              -e CORS_ORIGINS=http://${EC2_IP} \\
                              -v realestate-uploads:/app/uploads \\
                              -p 8080:8080 \\
                              ${DHUSER}/realestate-backend:${VERSION}

                            docker pull ${DHUSER}/realestate-frontend:${VERSION}
                            docker stop realestate-frontend || true
                            docker rm   realestate-frontend || true
                            docker run -d \\
                              --name realestate-frontend \\
                              --network realestate-network \\
                              --restart unless-stopped \\
                              -p 80:80 \\
                              ${DHUSER}/realestate-frontend:${VERSION}
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
```

---

## PART J — Troubleshooting on EC2

### Frontend loads but API calls fail (502 Bad Gateway)

```bash
# Check backend is running
docker ps | grep backend

# Check backend logs
docker logs realestate-backend --tail 50

# Check backend is reachable from inside frontend container
docker exec realestate-frontend wget -qO- http://realestate-backend:8080/api/listings/search
```

### Backend fails to connect to PostgreSQL

```bash
# Check pg_hba.conf has the 172.17.0.0/16 line
sudo cat /etc/postgresql/14/main/pg_hba.conf | grep realestate

# Check PostgreSQL is listening
sudo ss -tlnp | grep 5432

# Test connection from inside the backend container
docker exec realestate-backend \
  wget -qO- "http://localhost:8080/actuator/health"
```

### Port 80 already in use

```bash
sudo ss -tlnp | grep :80
# Find the PID and kill it, or stop the process
sudo systemctl stop apache2    # if Apache is running
sudo systemctl stop nginx      # if host Nginx is running
```

### EC2 Security Group not open

Go to EC2 Console → Security Groups → Inbound Rules.
Make sure port 80 and 8080 are open to `0.0.0.0/0`.

---

## Quick Reference — Full Command List in Order

```bash
# ── LOCAL MACHINE ──────────────────────────────────────────

# 1. Build JAR
cd realestate-app/backend
mvn clean package -DskipTests

# 2. Build React static files
cd ../frontend
npm install && npm run build

# 3. Build Docker images
cd ../backend  && docker build -t realestate-backend:1.0  .
cd ../frontend && docker build -t realestate-frontend:1.0 .

# 4. Push to DockerHub
docker login
docker tag realestate-backend:1.0  yourusername/realestate-backend:1.0
docker tag realestate-frontend:1.0 yourusername/realestate-frontend:1.0
docker push yourusername/realestate-backend:1.0
docker push yourusername/realestate-frontend:1.0

# ── EC2 INSTANCE (SSH) ──────────────────────────────────────

# 5. Install Docker + PostgreSQL
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu && exit   # log back in after this

sudo apt-get install -y postgresql
sudo systemctl start postgresql

# 6. Create DB
sudo -u postgres psql -c "CREATE USER realestate WITH PASSWORD 'realestate123';"
sudo -u postgres psql -c "CREATE DATABASE realestatedb OWNER realestate;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestatedb TO realestate;"

# 7. Allow Docker to reach PostgreSQL
echo "host realestatedb realestate 172.17.0.0/16 md5" \
  | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" \
  /etc/postgresql/14/main/postgresql.conf
sudo systemctl restart postgresql

# 8. Create Docker network
docker network create realestate-network

# 9. Run backend
docker pull yourusername/realestate-backend:1.0
docker run -d \
  --name realestate-backend \
  --network realestate-network \
  --restart unless-stopped \
  -e DB_URL=jdbc:postgresql://172.17.0.1:5432/realestatedb \
  -e DB_USERNAME=realestate \
  -e DB_PASSWORD=realestate123 \
  -e JWT_SECRET=PropMarketJWTSecretKey2024VeryLongAndSecureForEC2 \
  -e CORS_ORIGINS=http://YOUR-EC2-PUBLIC-IP \
  -v realestate-uploads:/app/uploads \
  -p 8080:8080 \
  yourusername/realestate-backend:1.0

# Wait ~60 seconds then check
docker logs realestate-backend --tail 20

# 10. Run frontend
docker pull yourusername/realestate-frontend:1.0
docker run -d \
  --name realestate-frontend \
  --network realestate-network \
  --restart unless-stopped \
  -p 80:80 \
  yourusername/realestate-frontend:1.0

# 11. Open browser
# http://YOUR-EC2-PUBLIC-IP
```
