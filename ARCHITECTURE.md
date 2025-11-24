# MCOTS - Military Command Operations Tactical System
## Complete Architecture & Interaction Guide

---

## 1. System Overview

MCOTS is a microservices-based military tactical simulation system with:
- **Frontend**: React + Leaflet map interface
- **Backend**: 3 microservices (Auth, Map, Intelligence)
- **Database**: MongoDB
- **Communication**: REST APIs + WebSocket

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                    http://localhost:5173                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                         │
│                         Port: 5173                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Components:                                                  │   │
│  │  - UkraineMap (Leaflet)    - Sidebar (unit selection)       │   │
│  │  - RightSidebar (actions)  - ScriptManager                   │   │
│  │  - BattleResultsModal      - BattleStatsDashboard            │   │
│  │  - AuthPage                - Header                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Services:                                                    │   │
│  │  - authService.js    (login, register, token management)     │   │
│  │  - api.js           (all API calls to backend)               │   │
│  │  - apiHelpers.js    (fetch wrapper with auth headers)        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                      │                      │
          │ JWT Token            │ JWT Token            │ No Auth
          ▼                      ▼                      ▼
┌──────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ AUTH-SERVICE │      │   MAP-SERVICE    │      │INTELLIGENCE-SVC  │
│  Port: 8081  │      │   Port: 8080     │      │   Port: 8084     │
│  (Java/Spring)│      │  (Java/Spring)   │      │  (Python/FastAPI)│
└──────────────┘      └──────────────────┘      └──────────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │       MONGODB          │
                    │      Port: 27017       │
                    │  DB: military_simulation│
                    └────────────────────────┘
```

---

## 2. Service Details

### 2.1 Frontend (React + Vite)
**Port:** 5173

**Purpose:** User interface for tactical map operations

**Key Files:**
```
frontend/src/
├── App.jsx                    # Main application, state management
├── components/
│   ├── UkraineMap.jsx        # Leaflet map with units, obstacles
│   ├── Sidebar/
│   │   ├── index.jsx         # Left sidebar - unit/obstacle selection
│   │   └── RightSidebar.jsx  # Right sidebar - actions, battle trigger
│   ├── Scripts/
│   │   └── ScriptManager.jsx # Automated script management
│   ├── Auth/
│   │   └── AuthPage.jsx      # Login/Register forms
│   └── Communications/
│       └── BattleResultsModal.jsx  # Battle analysis display
├── services/
│   ├── authService.js        # Authentication (login, token)
│   ├── api.js                # All API calls
│   └── apiHelpers.js         # Fetch wrapper with JWT
└── enums/
    ├── ApiUrl.jsx            # Service URLs
    ├── UnitType.js           # Unit types enum
    └── Faction.js            # BLUE_FORCE, RED_FORCE
```

**Data Flow:**
1. User logs in → `authService.login()` → receives JWT token → stored in cookie
2. All API calls include JWT in `Authorization: Bearer <token>` header
3. App.jsx fetches units/obstacles/actions every 2 seconds (live updates)
4. Map displays units as markers with icons based on type/faction

---

### 2.2 Auth-Service (Java Spring Boot)
**Port:** 8081

**Purpose:** User authentication and JWT token management

**Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Create new user |
| `/api/v1/auth/login` | POST | Login, get JWT token |
| `/api/v1/auth/profile` | GET | Get user profile |
| `/api/v1/auth/change-password` | POST | Change password |
| `/api/v1/auth/test` | GET | Health check |

**JWT Token Flow:**
```
1. User submits credentials
          │
          ▼
2. AuthService validates against MongoDB
          │
          ▼
3. JwtUtil generates token with:
   - username (sub)
   - role (USER/ADMIN)
   - expiration (24 hours)
          │
          ▼
4. Token returned to frontend
   - Stored in cookie
   - Sent with every API request
```

**Key Files:**
```
auth-service/src/main/java/uaigroup/authservice/
├── controller/AuthController.java   # REST endpoints
├── service/AuthService.java         # Business logic
├── config/JwtUtil.java              # Token generation/validation
├── model/User.java                  # User entity
└── repository/UserRepository.java   # MongoDB access
```

---

### 2.3 Map-Service (Java Spring Boot)
**Port:** 8080

**Purpose:** Core tactical data management - units, obstacles, actions, scripts

**Main Endpoints:**

**Units:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/map/units` | GET | Get all user's units |
| `/api/v1/map/units` | POST | Create unit |
| `/api/v1/map/units/{id}` | PUT | Update unit |
| `/api/v1/map/units/{id}` | DELETE | Delete unit |
| `/api/v1/map/units/batch` | POST | Get multiple units by IDs |

**Obstacles:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/map/obstacles` | GET/POST | List/Create obstacles |
| `/api/v1/map/obstacles/{id}` | PUT/DELETE | Update/Delete |

**Actions:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/map/actions` | GET/POST | List/Create actions |
| `/api/v1/map/actions/{id}` | PUT/DELETE | Update/Delete |

**Scripts:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/map/scripts` | GET/POST | List/Create scripts |
| `/api/v1/map/scripts/{id}/activate` | POST | Start script execution |
| `/api/v1/map/scripts/{id}/pause` | POST | Pause script |
| `/api/v1/map/scripts/{id}/actions` | GET/POST | Script actions |

**Fire Control:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fire-control/units/{id}/field-of-fire` | PUT | Set fire sector |
| `/api/fire-control/fire-missions` | POST | Create artillery mission |

**Communications:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/map/communications/stats/{faction}` | GET | Coverage statistics |
| `/api/v1/map/communications/refresh` | POST | Update comms status |

**Key Services:**
```
map-service/src/main/java/uaigroup/mapservice/
├── controller/
│   ├── MapController.java           # Units, obstacles, actions
│   ├── ScriptController.java        # Script management
│   ├── FireControlController.java   # Artillery, fields of fire
│   └── BattleReplayController.java  # Battle replay
├── service/
│   ├── MapService.java              # Core CRUD operations
│   ├── ScriptExecutionService.java  # Automated script runner (5s interval)
│   └── CommunicationService.java    # Comms network simulation
├── config/
│   ├── JwtAuthFilter.java           # JWT validation filter
│   └── WebSocketConfig.java         # Real-time updates
└── model/
    ├── GeneralUnit.java             # Main unit entity
    ├── Action.java                  # Unit action
    ├── Script.java                  # Automation script
    └── ScriptAction.java            # Script step
```

**Authentication Filter:**
```java
// JwtAuthFilter.java - runs on every request
1. Extract JWT from Authorization header or cookie
2. Validate token signature with shared JWT_SECRET
3. Extract username and role
4. Set request attributes: request.setAttribute("username", username)
5. Controllers access via: httpRequest.getAttribute("username")
```

---

### 2.4 Intelligence-Service (Python FastAPI)
**Port:** 8084

**Purpose:** AI-powered tactical analysis using Groq LLM

**Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analyze` | POST | Battle analysis |
| `/api/v1/test` | GET | Test Groq connection |
| `/api/v1/health` | GET | Health check |

**Battle Analysis Flow:**
```
1. Frontend collects:
   - All units (positions, stats)
   - All obstacles
   - All actions (commands to units)
   - Terrain type
   - Weather conditions
          │
          ▼
2. POST /api/v1/analyze
   {
     "battle_data": { "units": [...], "obstacles": [...] },
     "actions": [...],
     "terrain": "urban",
     "weather": "clear"
   }
          │
          ▼
3. Intelligence service:
   - Formats data for LLM
   - Sends to Groq API with tactical system prompt
   - Parses JSON response
          │
          ▼
4. Returns battle outcome:
   {
     "battle_outcome": "BLUE_VICTORY",
     "units": [...with updated stats...],
     "communications": [...tactical recommendations...],
     "timeline": [...battle events...]
   }
          │
          ▼
5. Frontend:
   - Updates units on map
   - Shows results modal
   - Deletes processed actions
```

**Key Files:**
```
intelligence-service/
├── main.py              # FastAPI app setup
├── api/
│   └── router.py        # /analyze endpoint, Groq integration
└── core/
    └── config.py        # Settings (GROQ_API_KEY)
```

---

## 3. Data Models

### 3.1 GeneralUnit (MongoDB: military_units)
```javascript
{
  "id": "uuid",
  "userId": "owner_username",
  "unitType": "TANKS | INFANTRY | MECHANIZED | RECONNAISSANCE | ...",
  "faction": "BLUE_FORCE | RED_FORCE",
  "unitRank": "SQUAD | PLATOON | COMPANY | BATTALION",
  "position": {
    "latitude": 50.4501,
    "longitude": 30.5234
  },
  "status": "ATTACKING | DEFENDING | DESTROYED",
  "personnel": 120,
  "vehicles": 40,
  "firepower": 500,
  "supplyLevel": 85,
  "morale": 75,
  "direction": 45,

  // Communications
  "hasCommsLink": true,
  "linkedCommsUnitId": "comms-unit-id",
  "commsStrength": 85,

  // Fire Control
  "fieldOfFire": {
    "centerAzimuth": 45,
    "leftAzimuth": 0,
    "rightAzimuth": 90,
    "maxRange": 3000,
    "active": true
  }
}
```

### 3.2 Script
```javascript
{
  "id": "uuid",
  "userId": "owner_username",
  "name": "Operation Thunder Strike",
  "description": "Coordinated assault",
  "targetFaction": "BLUE_FORCE",
  "isActive": true,
  "isPaused": false,
  "startedAt": "2024-01-01T10:00:00",
  "elapsedSeconds": 120,
  "totalActions": 5,
  "completedActions": 2,
  "failedActions": 0
}
```

### 3.3 ScriptAction
```javascript
{
  "id": "uuid",
  "scriptId": "parent-script-id",
  "unitId": "target-unit-id",
  "executionOrder": 1,
  "actionType": "MOVE | ATTACK | DEFEND | RETREAT | FLANK | ...",
  "description": "Move to flanking position",
  "priority": "HIGH",
  "triggerType": "IMMEDIATE | TIME_BASED | CONDITION_BASED | MANUAL",
  "delaySeconds": 30,
  "condition": "UNIT_IN_RANGE | SUPPLY_LOW | MORALE_LOW | ...",
  "conditionValue": 5.0,
  "targetPosition": { "latitude": 50.48, "longitude": 30.55 },
  "status": "PENDING | EXECUTING | COMPLETED | FAILED",
  "startedAt": null,
  "completedAt": null
}
```

---

## 4. Interaction Flows

### 4.1 User Login Flow
```
User                Frontend              Auth-Service         MongoDB
  │                    │                       │                  │
  │─── Enter creds ───>│                       │                  │
  │                    │── POST /login ───────>│                  │
  │                    │                       │── find user ────>│
  │                    │                       │<── user data ────│
  │                    │                       │── validate pwd ──│
  │                    │<── JWT token ─────────│                  │
  │<── Store cookie ───│                       │                  │
  │                    │                       │                  │
  │                    │── GET /units ─────────────────────────────>
  │                    │   (with JWT header)   │                  │
  │<── Display map ────│                       │                  │
```

### 4.2 Create Unit Flow
```
User                Frontend              Map-Service          MongoDB
  │                    │                       │                  │
  │─ Select unit type ─>│                      │                  │
  │─ Select rank ──────>│                      │                  │
  │─ Click on map ─────>│                      │                  │
  │                    │── POST /units ───────>│                  │
  │                    │   + JWT header        │                  │
  │                    │                       │── validate JWT ──│
  │                    │                       │── save unit ────>│
  │                    │<── unit data ─────────│                  │
  │<── Show on map ────│                       │                  │
```

### 4.3 Battle Simulation Flow
```
User             Frontend           Map-Service      Intelligence-Service    Groq API
  │                  │                   │                    │                  │
  │─ Create actions ─>│                  │                    │                  │
  │                  │── POST /actions ──>│                   │                  │
  │                  │                   │                    │                  │
  │─ Click Generate ─>│                  │                    │                  │
  │                  │── GET /actions ───>│                   │                  │
  │                  │── GET /units ─────>│                   │                  │
  │                  │── GET /obstacles ─>│                   │                  │
  │                  │                   │                    │                  │
  │                  │── POST /analyze ───────────────────────>│                 │
  │                  │   (units, actions, terrain, weather)   │                  │
  │                  │                   │                    │── LLM request ──>│
  │                  │                   │                    │<── JSON result ──│
  │                  │<── battle result ───────────────────────│                 │
  │                  │                   │                    │                  │
  │                  │── PUT /units (update positions/stats) ─>│                 │
  │                  │── DELETE /actions ─>│                  │                  │
  │<─ Show results ──│                   │                    │                  │
```

### 4.4 Script Execution Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                   SCRIPT EXECUTION SERVICE                           │
│                   (Runs every 5 seconds)                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Get all active  │
                    │    scripts      │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌─────────────────┐           ┌─────────────────┐
     │  Script A       │           │  Script B       │
     │  (not paused)   │           │  (paused)       │
     └────────┬────────┘           └─────────────────┘
              │                              SKIP
              ▼
     ┌─────────────────┐
     │ Get PENDING     │
     │ actions         │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐     No
     │ Check trigger   │─────────────────┐
     │ condition       │                 │
     └────────┬────────┘                 │
              │ Yes                      │
              ▼                          │
     ┌─────────────────┐                 │
     │ Execute action: │                 │
     │ - MOVE: update  │                 │
     │   position      │                 │
     │ - ATTACK: set   │                 │
     │   status        │                 │
     │ - RETREAT: move │                 │
     │   + morale down │                 │
     └────────┬────────┘                 │
              │                          │
              ▼                          ▼
     ┌─────────────────┐        ┌─────────────────┐
     │ Mark COMPLETED  │        │ Wait for next   │
     │ Update unit in  │        │ 5-second cycle  │
     │ MongoDB         │        └─────────────────┘
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │ All actions     │ Yes    ┌─────────────────┐
     │ completed?      │───────>│ Deactivate      │
     └────────┬────────┘        │ script          │
              │ No              └─────────────────┘
              │
              └── Continue next cycle ──┘
```

### 4.5 Communications Network Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│              COMMUNICATION SERVICE (every 30 seconds)                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Get all units   │
                    └────────┬────────┘
                             │
              For each unit: │
                             ▼
     ┌─────────────────────────────────────────────┐
     │ Is unit type COMMUNICATIONS?                │
     │                                             │
     │  Yes ──> Always has comms (self-link)       │
     │  No  ──> Find friendly COMMUNICATIONS units │
     └────────────────────┬────────────────────────┘
                          │
                          ▼
     ┌─────────────────────────────────────────────┐
     │ For each COMMUNICATIONS unit:               │
     │   Calculate distance (Haversine formula)    │
     │   If distance <= comms.range:               │
     │     - Unit has coverage                     │
     │     - Signal strength = f(distance)         │
     └────────────────────┬────────────────────────┘
                          │
                          ▼
     ┌─────────────────────────────────────────────┐
     │ Update unit:                                │
     │   hasCommsLink = true/false                 │
     │   linkedCommsUnitId = closest comms unit    │
     │   commsStrength = 50-100%                   │
     │   lastCommsCheck = now()                    │
     └─────────────────────────────────────────────┘
```

---

## 5. Environment Configuration

### docker-compose.yml Services:
```yaml
services:
  frontend:       # React app
    ports: 5173
    depends_on: auth-service, map-service, intelligence-service

  auth-service:   # Java Spring Boot
    ports: 8081
    env: MONGODB_HOST, JWT_SECRET

  map-service:    # Java Spring Boot
    ports: 8080
    env: MONGODB_HOST, JWT_SECRET, INTELLIGENCE_SERVICE_PORT

  intelligence-service:  # Python FastAPI
    ports: 8084
    env: GROQ_API_KEY

  mongodb:        # Database
    ports: 27017
```

### Required Environment Variables:
```bash
JWT_SECRET=your-secret-key-for-jwt-signing
GROQ_API_KEY=your-groq-api-key
MONGODB_DB_NAME=military_simulation
```

---

## 6. Scheduled Tasks

| Service | Task | Interval | Description |
|---------|------|----------|-------------|
| Map-Service | Script Execution | 5 seconds | Process active scripts, execute pending actions |
| Map-Service | Comms Update | 30 seconds | Recalculate communications coverage for all units |
| Frontend | Unit Fetch | 2 seconds | Poll for unit updates to show live changes |

---

## 7. Key Technologies

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, Leaflet, CSS |
| Backend (Auth) | Java 17, Spring Boot 3, Spring Data MongoDB |
| Backend (Map) | Java 17, Spring Boot 3, Spring WebSocket |
| Backend (Intel) | Python 3.11, FastAPI, Groq SDK |
| Database | MongoDB 6+ |
| Container | Docker, Docker Compose |
| AI | Groq LLM (llama-3.1-70b-versatile) |

---

## 8. Demo Scripts

| Script | Description |
|--------|-------------|
| `demo-instant-battle.sh` | Defensive scenario - Blue Force defends against Red assault |
| `demo-offensive-battle.sh` | Offensive scenario - Blue Force attacks Red defensive positions |

Both scripts:
1. Create user account
2. Deploy units for both factions
3. Set up obstacles and fire sectors
4. Create tactical actions
5. Activate automated scripts
6. Simulate battle with live unit updates
7. Display results and statistics
