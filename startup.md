# MCOTS Startup Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Java 17+ (for development)
- Python 3.9+ (for development)

## Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd MCOTS
   cp example.env .env
   ```

2. **Configure environment**
   Edit `.env` file:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   MONGODB_DB_NAME=mcots_db
   ```

3. **Run with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Access application**
   - Frontend: http://localhost:5173
   - Map Service API: http://localhost:8080
   - Intelligence Service API: http://localhost:8084
   - MongoDB: localhost:27017

## Development Mode

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Map Service
```bash
cd backend/map-service
./mvnw spring-boot:run
```

### Intelligence Service
```bash
cd backend/intelligence-service
poetry install
poetry run uvicorn main:app --reload --port 8084
```

## API Endpoints
- `GET /api/v1/map/units` - Get units
- `POST /api/v1/map/units` - Create unit
- `POST /api/v1/analyze` - Battle analysis

## Troubleshooting
- Ensure ports 5173, 8080, 8084, 27017 are available
- Check Docker logs: `docker-compose logs <service-name>`
- Verify GROQ_API_KEY is valid