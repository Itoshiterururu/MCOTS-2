# MCOTS Authentication System

## Overview
MCOTS now includes a complete authentication system with JWT tokens and role-based access control.

## Services
- **auth-service:8081** - User registration, login, JWT tokens
- **map-service:8080** - Map data with JWT validation
- **intelligence-service:8084** - AI analysis
- **frontend:5173** - React interface with auth

## User Roles
- **ADMIN** - Full access to all units and operations
- **OPERATOR** - Can create/edit own units
- **VIEWER** - Read-only access to own units

## Quick Start

1. Start services:
```bash
docker-compose up --build
```

2. Access frontend: http://localhost:5173
3. Register new account or login
4. Create and manage military units

## API Endpoints

### Auth Service (8081)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/test` - Health check

### Map Service (8080) - Requires JWT
- `GET /api/v1/map/units` - Get user's units (or all for ADMIN)
- `POST /api/v1/map/units` - Create unit for current user
- `GET /api/v1/map/test` - Health check (no auth required)

## Environment Variables
```
AUTH_SERVICE_PORT=8081
JWT_SECRET=myVerySecretKeyForMCOTSAuthService123456789
```

## Testing
Run authentication tests:
```bash
./test-auth.sh
```

## Security Features
- JWT tokens with expiration
- Password hashing with BCrypt
- Role-based access control
- Automatic logout on token expiry
- CORS protection