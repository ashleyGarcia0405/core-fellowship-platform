# webCORE Fellowship Platform

A modern full-stack platform built with a microservices architecture, featuring a React frontend, Spring Boot backend services, and MongoDB database.

## Architecture Overview

```
┌─────────────────────┐
│  Vite + React       │  Port 5173
│  (TypeScript)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  API Gateway        │  Port 8080
│  (Spring Boot)      │  JWT validation & routing
└──────────┬──────────┘
           │
           ├──────────────────────────┐
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│ Identity Service     │   │ Applications Service │
│ Port 8082            │   │ Port 8083            │
│ Auth & User Mgmt     │   │ Student & Startups   │
└──────────┬───────────┘   └──────────┬───────────┘
           │                          │
           └──────────┬───────────────┘
                      ▼
           ┌─────────────────────┐
           │  MongoDB + UI       │  Ports 27017, 8081
           │  (Docker Compose)   │
           └─────────────────────┘
```

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **ESLint** - Code linting

### Backend
- **Spring Boot 3.4.1** - Application framework
- **Java 21** - Language runtime
- **Spring Web** - REST APIs
- **Spring Security** - Authentication/Authorization
- **Spring Data MongoDB** - Database integration
- **Gradle 9.2.1** - Build tool (Kotlin DSL)

### Infrastructure
- **Docker Compose** - Local development environment
- **MongoDB 7** - NoSQL database
- **Mongo Express** - Database UI

## Repository Structure

```
core-fellowship/
├── .env                      # Environment variables (root)
├── .gitignore               # Git ignore patterns
├── docker-compose.yml       # Infrastructure definition
├── Makefile                 # Centralized commands
├── README.md                # This file
│
├── contracts/               # API contracts & schemas
│   ├── openapi/            # OpenAPI/Swagger specs
│   └── proto/              # Protocol buffers (future)
│
├── docs/                    # Documentation
│
├── infra/                   # Infrastructure configs
│   └── compose/            # Additional compose files
│
├── scripts/                 # Utility scripts
│   └── dev.sh              # Quick dev environment setup
│
├── services/                # Java microservices (Gradle multi-module)
│   ├── build.gradle.kts    # Root build configuration
│   ├── settings.gradle.kts # Module definitions
│   ├── gradle/             # Gradle wrapper
│   ├── gradlew             # Gradle wrapper script (Unix)
│   ├── gradlew.bat         # Gradle wrapper script (Windows)
│   │
│   ├── api-gateway/        # API Gateway service
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/edu/columbia/corefellowship/gateway/
│   │   │       │   ├── GatewayApplication.java
│   │   │       │   ├── HealthController.java
│   │   │       │   ├── IdentityProxyController.java
│   │   │       │   └── SecurityConfig.java
│   │   │       └── resources/
│   │   │           └── application.yml
│   │   └── build.gradle.kts
│   │
│   └── identity-service/   # Identity/Auth service
│       ├── src/
│       │   └── main/
│       │       ├── java/edu/columbia/corefellowship/identity/
│       │       │   ├── IdentityApplication.java
│       │       │   ├── HealthController.java
│       │       │   └── SecurityConfig.java
│       │       └── resources/
│       │           └── application.yml
│       └── build.gradle.kts
│
├── shared/                  # Shared libraries (future)
│
└── web/                     # Frontend applications
    └── portal/             # Main web portal
        ├── src/
        │   ├── App.tsx     # Root component
        │   ├── main.tsx    # Entry point
        │   ├── lib/
        │   │   └── api.ts  # API client
        │   └── index.css   # Global styles
        ├── .env            # Vite environment variables
        ├── package.json    # Node dependencies
        ├── vite.config.ts  # Vite configuration
        ├── tailwind.config.js
        └── tsconfig.json
```

## Prerequisites

### Required
- **Docker** (for MongoDB)
- **Java 21** ([Amazon Corretto](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/downloads-list.html) or OpenJDK)
- **Node.js 18+** and npm
- **Git**

### Optional but Recommended
- **make** (comes with macOS/Linux, [install for Windows](https://gnuwin32.sourceforge.net/packages/make.htm))
- **curl** (for testing APIs)
- **jq** (for JSON formatting)

### Verify Installation

```bash
docker --version          # Should be 20.x or higher
java -version             # Should be 21.x
node --version            # Should be v18.x or higher
npm --version             # Should be 9.x or higher
```

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd core-fellowship

# Verify environment file exists
cat .env
```

### 2. Start Infrastructure

```bash
# Using make (recommended)
make up

# Or using docker compose directly
docker compose up -d

# Verify services are running
docker compose ps
```

**Infrastructure Access:**
- MongoDB: `mongodb://root:example@localhost:27017`
- Mongo Express UI: http://localhost:8081

### 3. Build Services

```bash
make services-build

# Or manually
cd services && ./gradlew build
```

### 4. Install Web Dependencies

```bash
make web-install

# Or manually
cd web/portal && npm install
```

### 5. Run Everything

Open **5 separate terminal windows:**

#### Terminal 1: Infrastructure (if not already running)
```bash
make up
```

#### Terminal 2: API Gateway
```bash
make gateway-run

# Or manually
cd services/api-gateway && ../gradlew bootRun
```

**Wait for startup message:**
```
Started GatewayApplication in X.XXX seconds
```

#### Terminal 3: Identity Service
```bash
make identity-run

# Or manually
cd services/identity-service && ../gradlew bootRun
```

**Wait for startup message:**
```
Started IdentityApplication in X.XXX seconds
```

#### Terminal 4: Applications Service
```bash
make applications-run

# Or manually
cd services/applications-service && ../gradlew bootRun
```

**Wait for startup message:**
```
Started ApplicationsServiceApplication in X.XXX seconds
```

#### Terminal 5: Web Application
```bash
make web-dev

# Or manually
cd web/portal && npm run dev -- --host
```

### 6. Verify Everything Works

```bash
# Test API Gateway
curl http://localhost:8080/health
# Expected: {"status":"ok","service":"api-gateway"}

# Test Identity Service
curl http://localhost:8082/health
# Expected: {"status":"ok","service":"identity-service"}

# Test Gateway → Identity routing
curl http://localhost:8080/v1/identity/health
# Expected: {"status":"ok","service":"identity-service"}

# Open web app
open http://localhost:5173

## Available Commands

### Makefile Commands

```bash
make help           # Show all available commands
make up             # Start infrastructure (MongoDB + Mongo Express)
make down           # Stop infrastructure
make logs           # Tail infrastructure logs
make clean          # Stop infrastructure and remove volumes

make web-install    # Install web dependencies
make web-dev        # Run web app (Vite dev server)

make services-build    # Build all Java services
make gateway-run       # Run API gateway
make identity-run      # Run identity service
make applications-run  # Run applications service
```

### Gradle Commands

```bash
# From services/ directory

./gradlew build                            # Build all services
./gradlew clean build                      # Clean and build
./gradlew :api-gateway:bootRun            # Run gateway
./gradlew :identity-service:bootRun       # Run identity service
./gradlew :applications-service:bootRun   # Run applications service
./gradlew test                             # Run all tests
./gradlew :api-gateway:test               # Run gateway tests only
```

### Docker Commands

```bash
docker compose up -d              # Start infrastructure
docker compose down               # Stop infrastructure
docker compose down -v            # Stop and remove volumes
docker compose ps                 # List running containers
docker compose logs -f            # Follow all logs
docker compose logs -f mongo      # Follow MongoDB logs
docker compose restart mongo      # Restart MongoDB
```

### NPM Commands

```bash
# From web/portal/ directory

npm install                # Install dependencies
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

## Development Workflow

### Adding a New Service

1. **Add module to Gradle**

Edit `services/settings.gradle.kts`:
```kotlin
include("new-service")
```

2. **Create service directory**
```bash
mkdir -p services/new-service/src/main/java/edu/columbia/corefellowship/newservice
mkdir -p services/new-service/src/main/resources
```

3. **Create build file** at `services/new-service/build.gradle.kts`:
```kotlin
plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    java
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}
```

4. **Add main application class and controllers**

5. **Add Makefile target** in root `Makefile`:
```makefile
new-service-run:
	cd services/new-service && ../gradlew bootRun
```

### Making Changes

#### Frontend Changes
- Edit files in `web/portal/src/`
- Vite will hot-reload automatically
- Check browser console for errors

#### Backend Changes
- Edit Java files in `services/*/src/`
- Restart the service (Ctrl+C, then `make <service>-run`)
- For faster iteration, use Spring DevTools (add to dependencies)

### Running Tests

```bash
# All tests
cd services && ./gradlew test

# Specific service
cd services && ./gradlew :api-gateway:test

# Frontend tests (when added)
cd web/portal && npm test
```

## Debugging

### Debug Java Services (IntelliJ IDEA)

1. **Open project:**
   - Open `services/` directory in IntelliJ
   - Wait for Gradle import to complete

2. **Create Run Configuration:**
   - Run → Edit Configurations
   - Add → Gradle
   - Gradle project: `:api-gateway`
   - Tasks: `bootRun`
   - Click Debug icon

3. **Set breakpoints** and debug normally

### Debug Java Services (VS Code)

1. **Install Java Extension Pack**

2. **Create `.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug Gateway",
      "request": "launch",
      "mainClass": "edu.columbia.corefellowship.gateway.GatewayApplication",
      "projectName": "api-gateway"
    }
  ]
}
```

3. **Set breakpoints** and press F5

### Debug Java Services (Command Line)

```bash
cd services

# Enable remote debugging on port 5005
./gradlew :api-gateway:bootRun --debug-jvm

# In another terminal, attach debugger or use jdb
jdb -attach localhost:5005
```

### Debug Frontend (Browser DevTools)

1. **Open browser DevTools** (F12)
2. **Sources tab** → see original TypeScript files (source maps enabled)
3. **Set breakpoints** in browser
4. **Console tab** for logs

### Debug Frontend (VS Code)

1. **Install Debugger for Chrome/Edge extension**

2. **Create `.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Vite",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/web/portal"
    }
  ]
}
```

3. **Start Vite dev server**, then press F5

### View Logs

**Backend logs:**
```bash
# Gateway service (in terminal where it's running)
# Or redirect to file:
make gateway-run > gateway.log 2>&1

# Identity service
make identity-run > identity.log 2>&1

# View with tail
tail -f gateway.log
```

**MongoDB logs:**
```bash
docker compose logs -f mongo
```

**Web logs:**
- Check browser console (F12)
- Check terminal where `npm run dev` is running

## Troubleshooting

### Port Already in Use

**Problem:** `Port 8080 is already in use`

**Solution:**
```bash
# Find process using port
lsof -i :8080          # macOS/Linux
netstat -ano | findstr :8080   # Windows

# Kill the process
kill -9 <PID>          # macOS/Linux
taskkill /F /PID <PID> # Windows
```

### MongoDB Connection Failed

**Problem:** `MongoSocketException: Connection refused`

**Solution:**
```bash
# Check if MongoDB is running
docker compose ps

# Restart MongoDB
docker compose restart mongo

# Check logs
docker compose logs mongo

# Verify connection
docker exec -it cfp-mongo mongosh -u root -p example
```

### Gradle Build Failed

**Problem:** `Could not resolve dependencies`

**Solution:**
```bash
cd services

# Clean and rebuild
./gradlew clean build --refresh-dependencies

# Check Java version
java -version  # Should be 21

# Clear Gradle cache (last resort)
rm -rf ~/.gradle/caches
./gradlew clean build
```

### Web App Won't Start

**Problem:** `npm ERR!` or dependency issues

**Solution:**
```bash
cd web/portal

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install
```

### CORS Errors in Browser

**Problem:** `Access-Control-Allow-Origin` errors

**Solution:**
- Make sure you're accessing via `http://localhost:5173` (not 127.0.0.1)
- Check that Vite proxy is configured in `vite.config.ts`
- Ensure you're calling `/api/*` paths, not direct service URLs
- Clear browser cache and reload

### Spring Security 401 Unauthorized

**Problem:** Health endpoints return 401

**Solution:**
- Verify `SecurityConfig.java` exists in both services
- Check that `/health` is in the `permitAll()` list
- Rebuild: `cd services && ./gradlew clean build`
- Restart the service

## Environment Variables

### Root `.env` (Infrastructure & Services)

```bash
# Web
WEB_PORT=3000

# Gateway
GATEWAY_PORT=8080

# Services
IDENTITY_PORT=8082

# Mongo
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=root
MONGO_PASS=example
MONGO_AUTH_DB=admin

# JWT (dev-only; rotate later)
JWT_ISSUER=core-fellowship-local
JWT_AUDIENCE=core-fellowship
JWT_SECRET=dev_super_secret_change_me
```

### Web `.env` (Vite - `web/portal/.env`)

```bash
VITE_API_BASE=http://localhost:8080
```

**Note:** Vite environment variables must be prefixed with `VITE_` to be exposed to the browser.

## API Documentation

### Current Endpoints

#### API Gateway (http://localhost:8080)

**GET /health**
- Returns gateway health status
- Response: `{"status":"ok","service":"api-gateway"}`

**GET /v1/identity/health**
- Proxies to identity service health endpoint
- Response: `{"status":"ok","service":"identity-service"}`

#### Identity Service (http://localhost:8082)

**GET /health**
- Returns identity service health status
- Response: `{"status":"ok","service":"identity-service"}`

### OpenAPI Specification

View the full API contract at:
```bash
cat contracts/openapi/gateway.yaml
```

## Database

### MongoDB Access

**Connection String:**
```
mongodb://root:example@localhost:27017/?authSource=admin
```

**Mongo Express UI:**
http://localhost:8081

**CLI Access:**
```bash
docker exec -it cfp-mongo mongosh -u root -p example --authenticationDatabase admin

# List databases
show dbs

# Use identity database
use identity

# List collections
show collections
```

### Database Schema

**Identity database** is auto-created by the identity-service on first connection.

Collections will be created by Spring Data MongoDB as entities are defined.

## Production Considerations

This is a **development setup**. Before deploying to production:

### Security
- [ ] Change all default passwords in `.env`
- [ ] Generate proper JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Enable Spring Security authentication
- [ ] Review SecurityConfig for production settings
- [ ] Add rate limiting
- [ ] Configure firewall rules

### Performance
- [ ] Enable Spring Boot production profile
- [ ] Configure connection pooling
- [ ] Add caching (Redis)
- [ ] Enable Vite production build optimizations
- [ ] Configure CDN for static assets

### Monitoring
- [ ] Add logging framework (ELK stack, Splunk)
- [ ] Configure health checks
- [ ] Add metrics (Prometheus, Grafana)
- [ ] Set up alerting
- [ ] Add distributed tracing (Jaeger, Zipkin)

### Infrastructure
- [ ] Replace Docker Compose with Kubernetes
- [ ] Set up CI/CD pipelines
- [ ] Configure auto-scaling
- [ ] Set up database backups
- [ ] Configure disaster recovery

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "feat: add user authentication"`
4. Push and create a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Check this README
- Review troubleshooting section
- Check application logs
- Create an issue in the repository

---

**Last Updated:** 2026-01-11
**Maintained By:** CORE Fellowship Team