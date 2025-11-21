# MCOTS - Military Combat Operations Tactical System

MCOTS is a tactical military simulation system that provides real-time battle analysis and strategic planning capabilities.

## Architecture

The system consists of:
- **Frontend**: React-based web interface for map visualization and tactical planning
- **Map Service**: Spring Boot service for managing units, obstacles, and battlefield data
- **Intelligence Service**: FastAPI service with AI-powered battle analysis using Groq AI

## Services

### Frontend
- Interactive map interface using Leaflet
- User authentication and role-based access
- Real-time unit and obstacle management
- Battle visualization and analysis

### Auth Service (Spring Boot)
- User registration and login
- JWT token management
- Role-based access control (ADMIN, OPERATOR, VIEWER)

### Map Service (Spring Boot)
- RESTful API for battlefield data management
- MongoDB integration for data persistence
- JWT authentication for all endpoints
- WebSocket support for real-time updates

### Intelligence Service (FastAPI)
- AI-powered tactical analysis using Groq AI
- Battle outcome prediction and strategic recommendations
- Replaces the previous battle-service with enhanced AI capabilities

## Getting Started

1. Clone the repository
2. Copy `example.env` to `.env` and configure your environment variables
3. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Environment Variables

Required configuration variables:
- `GROQ_API_KEY`: Your Groq AI API key for intelligence analysis
- `JWT_SECRET`: Secret key for JWT token signing
- `AUTH_SERVICE_PORT`: Port for auth service (default: 8081)
- `INTELLIGENCE_SERVICE_PORT`: Port for intelligence service (default: 8084)
- `MAP_SERVICE_PORT`: Port for map service (default: 8080)
- `FRONTEND_PORT`: Port for frontend (default: 5173)
- `MONGODB_PORT`: Port for MongoDB (default: 27017)
- `MONGODB_DB_NAME`: MongoDB database name

## Development

Each service can be run independently for development:
- Frontend: `cd frontend && npm run dev`
- Map Service: `cd backend/map-service && ./mvnw spring-boot:run`
- Intelligence Service: `cd backend/intelligence-service && poetry run uvicorn main:app --reload`

## API Endpoints

### Auth Service
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/test` - Health check

### Intelligence Service
- `GET /api/v1/test` - Health check and AI connectivity test
- `POST /api/v1/analyze` - Battle analysis with AI-powered recommendations

### Map Service (JWT Required)
- `GET /api/v1/map/units` - Get user's units (all units for ADMIN)
- `POST /api/v1/map/units` - Create new unit for current user
- `GET /api/v1/map/obstacles` - Get all obstacles
- `POST /api/v1/map/obstacles` - Create new obstacle
- `GET /api/v1/map/test` - Health check (no auth required)

## Recent Updates

- **Authentication System**: Added complete user authentication with JWT tokens and role-based access control
- **User Management**: Users can register, login, and manage their own military units
- **Security Enhancement**: All API endpoints now require authentication except health checks
- **Intelligence Service Integration**: Replaced battle-service with AI-powered intelligence-service using Groq AI
- **Enhanced Battle Analysis**: Improved tactical analysis with natural language processing
- **Streamlined Architecture**: Removed dependency on Azure OpenAI, now using Groq for better performance
- **Docker Optimization**: Cleaned up unused containers and optimized resource usage

## User Roles

- **ADMIN**: Full access to all units and system operations
- **OPERATOR**: Can create and manage their own units
- **VIEWER**: Read-only access to their own units
