#!/bin/bash

# MCOTS Demo Test Script
# This script populates the system with test data to demonstrate all features

set -e  # Exit on error

# Configuration
API_BASE="http://localhost"
AUTH_API="${API_BASE}:8081/api/v1/auth"
MAP_API="${API_BASE}:8080/api/v1/map"
FORMATIONS_API="${API_BASE}:8080/api/formations"
REPLAY_API="${API_BASE}:8080/api/replays"
FIRE_CONTROL_API="${API_BASE}:8080/api/fire-control"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Wait for services to be ready
wait_for_services() {
    print_header "Waiting for Services to Start"

    print_info "Waiting for auth-service..."
    for i in {1..30}; do
        if curl -s "${AUTH_API}/test" > /dev/null 2>&1; then
            print_success "Auth service is ready"
            break
        fi
        sleep 2
    done

    print_info "Waiting for map-service..."
    for i in {1..30}; do
        if curl -s "${MAP_API}/units" > /dev/null 2>&1; then
            print_success "Map service is ready"
            break
        fi
        sleep 2
    done
}

# Register and login test user
setup_user() {
    print_header "Setting Up Test User"

    # Try to register (may fail if user exists)
    print_info "Registering test user..."
    REGISTER_RESPONSE=$(curl -s -X POST "${AUTH_API}/register" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "demo_user",
            "email": "demo@mcots.test",
            "password": "Demo123456"
        }' || echo '{"error":"User may already exist"}')

    # Login to get token
    print_info "Logging in..."
    LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_API}/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "demo_user",
            "password": "Demo123456"
        }')

    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        print_error "Failed to login. Please check if services are running."
        exit 1
    fi

    print_success "Logged in as demo_user (ID: ${USER_ID:0:8}...)"

    # Set headers for subsequent requests
    AUTH_HEADER="Authorization: Bearer $TOKEN"
    USER_HEADER="X-User-Id: $USER_ID"
}

# Create Blue Force (Friendly) Units
create_blue_force() {
    print_header "Creating Blue Force Units"

    # Blue Force Command Post (Communications Hub)
    print_info "Creating Blue Force Command Post..."
    BLUE_CP=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "COMMUNICATIONS",
            "faction": "BLUE_FORCE",
            "unitRank": "COMPANY",
            "position": {
                "latitude": 50.4501,
                "longitude": 30.5234
            },
            "status": "DEFENDING",
            "personnel": 50,
            "vehicles": 5,
            "supplyLevel": 100,
            "morale": 95
        }')
    BLUE_CP_ID=$(echo $BLUE_CP | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "Command Post created (ID: ${BLUE_CP_ID:0:8}...)"

    # Blue Force Tank Company
    print_info "Creating Blue Force Tank Company..."
    BLUE_TANK1=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "TANKS",
            "faction": "BLUE_FORCE",
            "unitRank": "COMPANY",
            "position": {
                "latitude": 50.4601,
                "longitude": 30.5334
            },
            "status": "DEFENDING",
            "personnel": 120,
            "vehicles": 40,
            "supplyLevel": 90,
            "morale": 85,
            "direction": 45
        }')
    BLUE_TANK1_ID=$(echo $BLUE_TANK1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "Tank Company created (ID: ${BLUE_TANK1_ID:0:8}...)"

    # Blue Force Mechanized Infantry
    print_info "Creating Blue Force Mechanized Infantry..."
    BLUE_MECH1=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "MECHANIZED",
            "faction": "BLUE_FORCE",
            "unitRank": "COMPANY",
            "position": {
                "latitude": 50.4701,
                "longitude": 30.5434
            },
            "status": "DEFENDING",
            "personnel": 120,
            "vehicles": 40,
            "supplyLevel": 85,
            "morale": 80,
            "direction": 90
        }')
    BLUE_MECH1_ID=$(echo $BLUE_MECH1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "Mechanized Infantry created (ID: ${BLUE_MECH1_ID:0:8}...)"

    # Blue Force Artillery (Howitzer)
    print_info "Creating Blue Force Artillery Battery..."
    BLUE_ARTY=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "HOWITZER",
            "faction": "BLUE_FORCE",
            "unitRank": "PLATOON",
            "position": {
                "latitude": 50.4301,
                "longitude": 30.5134
            },
            "status": "DEFENDING",
            "personnel": 30,
            "vehicles": 9,
            "supplyLevel": 95,
            "morale": 90,
            "direction": 0
        }')
    BLUE_ARTY_ID=$(echo $BLUE_ARTY | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "Artillery Battery created (ID: ${BLUE_ARTY_ID:0:8}...)"

    # Blue Force Reconnaissance
    print_info "Creating Blue Force Recon Unit..."
    BLUE_RECON=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "RECONNAISSANCE",
            "faction": "BLUE_FORCE",
            "unitRank": "PLATOON",
            "position": {
                "latitude": 50.5001,
                "longitude": 30.5634
            },
            "status": "MOVING",
            "personnel": 20,
            "vehicles": 6,
            "supplyLevel": 80,
            "morale": 85,
            "direction": 45
        }')
    BLUE_RECON_ID=$(echo $BLUE_RECON | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Recon Unit created (ID: ${BLUE_RECON_ID:0:8}...)"

    # Blue Force Anti-Air
    print_info "Creating Blue Force Air Defense..."
    BLUE_AD=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "AIR_DEFENSE",
            "faction": "BLUE_FORCE",
            "unitRank": "PLATOON",
            "position": {
                "latitude": 50.4401,
                "longitude": 30.5234
            },
            "status": "DEFENDING",
            "personnel": 25,
            "vehicles": 6,
            "supplyLevel": 90,
            "morale": 88
        }')
    BLUE_AD_ID=$(echo $BLUE_AD | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "Air Defense created (ID: ${BLUE_AD_ID:0:8}...)"

    # Blue Force Supply Unit
    print_info "Creating Blue Force Supply Unit..."
    BLUE_SUPPLY=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "SUPPLY",
            "faction": "BLUE_FORCE",
            "unitRank": "PLATOON",
            "position": {
                "latitude": 50.4201,
                "longitude": 30.5134
            },
            "status": "DEFENDING",
            "personnel": 30,
            "vehicles": 15,
            "supplyLevel": 100,
            "morale": 75
        }')
    print_success "Supply Unit created"

    print_success "Blue Force units created successfully!"
}

# Create Red Force (Enemy) Units
create_red_force() {
    print_header "Creating Red Force Units"

    # Red Force Command Post
    print_info "Creating Red Force Command Post..."
    RED_CP=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "COMMUNICATIONS",
            "faction": "RED_FORCE",
            "unitRank": "COMPANY",
            "position": {
                "latitude": 50.5501,
                "longitude": 30.6234
            },
            "status": "DEFENDING",
            "personnel": 45,
            "vehicles": 4,
            "supplyLevel": 85,
            "morale": 70
        }')
    RED_CP_ID=$(echo $RED_CP | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Command Post created (ID: ${RED_CP_ID:0:8}...)"

    # Red Force Tank Units
    print_info "Creating Red Force Tank Company..."
    RED_TANK1=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "TANKS",
            "faction": "RED_FORCE",
            "unitRank": "COMPANY",
            "position": {
                "latitude": 50.5401,
                "longitude": 30.6134
            },
            "status": "MOVING",
            "personnel": 110,
            "vehicles": 35,
            "supplyLevel": 75,
            "morale": 65,
            "direction": 225
        }')
    RED_TANK1_ID=$(echo $RED_TANK1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Tank Company created (ID: ${RED_TANK1_ID:0:8}...)"

    # Red Force Mechanized Infantry
    print_info "Creating Red Force Mechanized Infantry..."
    RED_MECH1=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "MECHANIZED",
            "faction": "RED_FORCE",
            "unitRank": "COMPANY",
            "position": {
                "latitude": 50.5301,
                "longitude": 30.6034
            },
            "status": "MOVING",
            "personnel": 115,
            "vehicles": 38,
            "supplyLevel": 70,
            "morale": 68,
            "direction": 225
        }')
    RED_MECH1_ID=$(echo $RED_MECH1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Mechanized Infantry created (ID: ${RED_MECH1_ID:0:8}...)"

    # Red Force Artillery
    print_info "Creating Red Force Artillery..."
    RED_ARTY=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "MORTAR",
            "faction": "RED_FORCE",
            "unitRank": "PLATOON",
            "position": {
                "latitude": 50.5601,
                "longitude": 30.6334
            },
            "status": "DEFENDING",
            "personnel": 28,
            "vehicles": 8,
            "supplyLevel": 80,
            "morale": 72,
            "direction": 180
        }')
    RED_ARTY_ID=$(echo $RED_ARTY | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "Artillery created (ID: ${RED_ARTY_ID:0:8}...)"

    # Red Force Infantry (Defensive Position)
    print_info "Creating Red Force Infantry..."
    RED_INF=$(curl -s -X POST "${MAP_API}/units" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "INFANTRY",
            "faction": "RED_FORCE",
            "unitRank": "COMPANY",
            "position": {
                "latitude": 50.5201,
                "longitude": 30.5934
            },
            "status": "DEFENDING",
            "personnel": 100,
            "vehicles": 20,
            "supplyLevel": 65,
            "morale": 60,
            "direction": 180
        }')
    RED_INF_ID=$(echo $RED_INF | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "Infantry created (ID: ${RED_INF_ID:0:8}...)"

    print_success "Red Force units created successfully!"
}

# Create a Battalion Formation
create_formation() {
    print_header "Creating Battalion Formation"

    print_info "Creating Blue Force Tank Battalion with subordinate units..."
    FORMATION=$(curl -s -X POST "${FORMATIONS_API}" \
        -H "Content-Type: application/json" \
        -H "$USER_HEADER" \
        -d '{
            "unitType": "TANKS",
            "rank": "BATTALION",
            "faction": "BLUE_FORCE",
            "hqPosition": {
                "latitude": 50.4100,
                "longitude": 30.4800
            },
            "formationType": "WEDGE",
            "spacing": 500,
            "orientation": 45
        }')

    FORMATION_ID=$(echo $FORMATION | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

    if [ ! -z "$FORMATION_ID" ]; then
        print_success "Battalion Formation created (ID: ${FORMATION_ID:0:8}...)"
        print_info "  - 1 Battalion HQ unit"
        print_info "  - 3 Company HQ units (automatic)"
        print_info "  - Formation type: WEDGE"
        print_info "  - Spacing: 500 meters"
    else
        print_error "Failed to create formation"
        print_info "Response: $FORMATION"
    fi
}

# Create Obstacles
create_obstacles() {
    print_header "Creating Obstacles"

    # Minefield
    print_info "Creating minefield..."
    curl -s -X POST "${MAP_API}/obstacles" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "type": "MINEFIELD",
            "startPosition": {
                "latitude": 50.4900,
                "longitude": 30.5500
            },
            "endPosition": {
                "latitude": 50.4950,
                "longitude": 30.5600
            }
        }' > /dev/null
    print_success "Minefield created"

    # Tank Traps
    print_info "Creating tank traps..."
    curl -s -X POST "${MAP_API}/obstacles" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "type": "TANK_TRAP",
            "startPosition": {
                "latitude": 50.4850,
                "longitude": 30.5400
            },
            "endPosition": {
                "latitude": 50.4900,
                "longitude": 30.5500
            }
        }' > /dev/null
    print_success "Tank traps created"

    # Trench Line
    print_info "Creating defensive trenches..."
    curl -s -X POST "${MAP_API}/obstacles" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -H "$USER_HEADER" \
        -d '{
            "type": "TRENCH",
            "startPosition": {
                "latitude": 50.4600,
                "longitude": 30.5300
            },
            "endPosition": {
                "latitude": 50.4700,
                "longitude": 30.5500
            }
        }' > /dev/null
    print_success "Trenches created"
}

# Set Fields of Fire
set_fields_of_fire() {
    print_header "Setting Fields of Fire"

    if [ ! -z "$BLUE_TANK1_ID" ]; then
        print_info "Setting field of fire for Tank Company..."
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${BLUE_TANK1_ID}/field-of-fire" \
            -H "Content-Type: application/json" \
            -H "$USER_HEADER" \
            -d '{
                "centerAzimuth": 45,
                "leftAzimuth": 0,
                "rightAzimuth": 90,
                "maxRange": 3000,
                "minRange": 100,
                "active": true,
                "priority": "PRIMARY"
            }' > /dev/null
        print_success "Tank Company field of fire set (0° - 90°, 3km range)"
    fi

    if [ ! -z "$BLUE_MECH1_ID" ]; then
        print_info "Setting field of fire for Mechanized Infantry..."
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${BLUE_MECH1_ID}/field-of-fire" \
            -H "Content-Type: application/json" \
            -H "$USER_HEADER" \
            -d '{
                "centerAzimuth": 90,
                "leftAzimuth": 45,
                "rightAzimuth": 135,
                "maxRange": 2000,
                "minRange": 50,
                "active": true,
                "priority": "PRIMARY"
            }' > /dev/null
        print_success "Mechanized Infantry field of fire set (45° - 135°, 2km range)"
    fi

    if [ ! -z "$RED_INF_ID" ]; then
        print_info "Setting field of fire for Red Force Infantry..."
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${RED_INF_ID}/field-of-fire" \
            -H "Content-Type: application/json" \
            -H "$USER_HEADER" \
            -d '{
                "centerAzimuth": 180,
                "leftAzimuth": 135,
                "rightAzimuth": 225,
                "maxRange": 1500,
                "minRange": 50,
                "active": true,
                "priority": "FINAL_PROTECTIVE_FIRE"
            }' > /dev/null
        print_success "Red Force Infantry field of fire set (135° - 225°, 1.5km range)"
    fi
}

# Create Fire Missions
create_fire_missions() {
    print_header "Creating Fire Missions"

    if [ ! -z "$BLUE_ARTY_ID" ]; then
        print_info "Creating suppression mission on Red Force positions..."
        curl -s -X POST "${FIRE_CONTROL_API}/fire-missions" \
            -H "Content-Type: application/json" \
            -H "$USER_HEADER" \
            -d "{
                \"artilleryUnitId\": \"${BLUE_ARTY_ID}\",
                \"missionType\": \"SUPPRESSION\",
                \"targetCenter\": {
                    \"latitude\": 50.5300,
                    \"longitude\": 30.6000
                },
                \"targetRadius\": 200,
                \"status\": \"PLANNED\",
                \"roundsAllocated\": 50,
                \"roundsFired\": 0,
                \"priority\": \"PRIORITY\",
                \"effectsRadius\": 300
            }" > /dev/null
        print_success "Suppression mission created (Target: Red Force positions)"

        print_info "Creating interdiction mission on supply route..."
        curl -s -X POST "${FIRE_CONTROL_API}/fire-missions" \
            -H "Content-Type: application/json" \
            -H "$USER_HEADER" \
            -d "{
                \"artilleryUnitId\": \"${BLUE_ARTY_ID}\",
                \"missionType\": \"INTERDICTION\",
                \"targetCenter\": {
                    \"latitude\": 50.5500,
                    \"longitude\": 30.6200
                },
                \"targetRadius\": 150,
                \"status\": \"PLANNED\",
                \"roundsAllocated\": 30,
                \"roundsFired\": 0,
                \"priority\": \"ROUTINE\",
                \"effectsRadius\": 250
            }" > /dev/null
        print_success "Interdiction mission created (Target: Supply route)"
    fi
}

# Create Actions
create_actions() {
    print_header "Creating Actions"

    if [ ! -z "$BLUE_RECON_ID" ]; then
        print_info "Creating reconnaissance patrol action..."
        curl -s -X POST "${MAP_API}/actions" \
            -H "Content-Type: application/json" \
            -H "$AUTH_HEADER" \
            -H "$USER_HEADER" \
            -d "{
                \"unitId\": \"${BLUE_RECON_ID}\",
                \"description\": \"Patrol forward area and report enemy activity\",
                \"actionType\": \"PATROL\",
                \"priority\": \"HIGH\",
                \"targetPosition\": {
                    \"latitude\": 50.5100,
                    \"longitude\": 30.5800
                },
                \"durationSeconds\": 1800
            }" > /dev/null
        print_success "Recon patrol action created"
    fi

    if [ ! -z "$RED_TANK1_ID" ]; then
        print_info "Creating Red Force attack action..."
        curl -s -X POST "${MAP_API}/actions" \
            -H "Content-Type: application/json" \
            -H "$AUTH_HEADER" \
            -H "$USER_HEADER" \
            -d "{
                \"unitId\": \"${RED_TANK1_ID}\",
                \"description\": \"Advance and engage Blue Force positions\",
                \"actionType\": \"ATTACK\",
                \"priority\": \"HIGH\",
                \"targetPosition\": {
                    \"latitude\": 50.4700,
                    \"longitude\": 30.5400
                },
                \"durationSeconds\": 3600
            }" > /dev/null
        print_success "Red Force attack action created"
    fi

    if [ ! -z "$RED_MECH1_ID" ]; then
        print_info "Creating Red Force movement action..."
        curl -s -X POST "${MAP_API}/actions" \
            -H "Content-Type: application/json" \
            -H "$AUTH_HEADER" \
            -H "$USER_HEADER" \
            -d "{
                \"unitId\": \"${RED_MECH1_ID}\",
                \"description\": \"Move to assault position\",
                \"actionType\": \"MOVE\",
                \"priority\": \"MEDIUM\",
                \"targetPosition\": {
                    \"latitude\": 50.5000,
                    \"longitude\": 30.5700
                },
                \"durationSeconds\": 1200
            }" > /dev/null
        print_success "Red Force movement action created"
    fi
}

# Create a Script
create_script() {
    print_header "Creating Automated Script"

    if [ ! -z "$RED_TANK1_ID" ] && [ ! -z "$RED_MECH1_ID" ]; then
        print_info "Creating 'Red Force Assault' script..."

        SCRIPT=$(curl -s -X POST "${MAP_API}/scripts" \
            -H "Content-Type: application/json" \
            -H "$AUTH_HEADER" \
            -H "$USER_HEADER" \
            -d '{
                "name": "Red Force Coordinated Assault",
                "description": "Automated enemy assault sequence",
                "isActive": false,
                "priority": "HIGH"
            }')

        SCRIPT_ID=$(echo $SCRIPT | grep -o '"id":"[^"]*' | cut -d'"' -f4)

        if [ ! -z "$SCRIPT_ID" ]; then
            print_success "Script created (ID: ${SCRIPT_ID:0:8}...)"

            # Add actions to script
            print_info "Adding script actions..."

            # Action 1: Tank advance
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" \
                -H "Content-Type: application/json" \
                -H "$AUTH_HEADER" \
                -H "$USER_HEADER" \
                -d "{
                    \"unitId\": \"${RED_TANK1_ID}\",
                    \"description\": \"Tank unit advance\",
                    \"actionType\": \"MOVE\",
                    \"priority\": \"HIGH\",
                    \"targetPosition\": {
                        \"latitude\": 50.5000,
                        \"longitude\": 30.5600
                    },
                    \"executionOrder\": 1,
                    \"durationSeconds\": 600
                }" > /dev/null

            # Action 2: Mechanized follow
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" \
                -H "Content-Type: application/json" \
                -H "$AUTH_HEADER" \
                -H "$USER_HEADER" \
                -d "{
                    \"unitId\": \"${RED_MECH1_ID}\",
                    \"description\": \"Mechanized support advance\",
                    \"actionType\": \"MOVE\",
                    \"priority\": \"HIGH\",
                    \"targetPosition\": {
                        \"latitude\": 50.4900,
                        \"longitude\": 30.5500
                    },
                    \"executionOrder\": 2,
                    \"durationSeconds\": 600
                }" > /dev/null

            # Action 3: Final assault
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" \
                -H "Content-Type: application/json" \
                -H "$AUTH_HEADER" \
                -H "$USER_HEADER" \
                -d "{
                    \"unitId\": \"${RED_TANK1_ID}\",
                    \"description\": \"Assault Blue Force positions\",
                    \"actionType\": \"ATTACK\",
                    \"priority\": \"URGENT\",
                    \"targetPosition\": {
                        \"latitude\": 50.4700,
                        \"longitude\": 30.5400
                    },
                    \"executionOrder\": 3,
                    \"durationSeconds\": 1800
                }" > /dev/null

            print_success "Script actions added (3 steps)"
            print_info "Script is ready but not activated"
            print_info "You can activate it manually from the UI"
        fi
    fi
}

# Start Battle Recording
start_recording() {
    print_header "Starting Battle Recording"

    print_info "Creating battle replay recording..."
    REPLAY=$(curl -s -X POST "${REPLAY_API}/start" \
        -H "Content-Type: application/json" \
        -H "$USER_HEADER" \
        -d '{
            "battleName": "Demo Battle - Blue vs Red",
            "description": "Automated demo battle scenario"
        }')

    REPLAY_ID=$(echo $REPLAY | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

    if [ ! -z "$REPLAY_ID" ]; then
        print_success "Battle recording started (ID: ${REPLAY_ID:0:8}...)"
        print_info "Recording will capture all activity"
        print_info "Stop recording from the UI when ready"
    else
        print_error "Failed to start recording"
        print_info "Response: $REPLAY"
    fi
}

# Print summary
print_summary() {
    print_header "Demo Setup Complete!"

    echo -e "${GREEN}✓ Test data has been successfully created!${NC}\n"

    echo -e "${BLUE}Created:${NC}"
    echo "  • 7 Blue Force units (friendly)"
    echo "  • 5 Red Force units (enemy)"
    echo "  • 1 Battalion formation with hierarchy"
    echo "  • 3 Obstacles (minefield, traps, trenches)"
    echo "  • 3 Fields of fire (defensive sectors)"
    echo "  • 2 Fire missions (artillery strikes)"
    echo "  • 3 Actions (patrol, attack, move)"
    echo "  • 1 Automated script (3-step assault)"
    echo "  • 1 Battle recording (active)"

    echo -e "\n${YELLOW}Access the application at:${NC}"
    echo "  http://localhost:5173"

    echo -e "\n${YELLOW}Login credentials:${NC}"
    echo "  Username: demo_user"
    echo "  Password: Demo123456"

    echo -e "\n${BLUE}Features to explore:${NC}"
    echo "  1. View all units on the map"
    echo "  2. Toggle map layers (Communications, Fields of Fire, etc.)"
    echo "  3. Click units to see details"
    echo "  4. View formation hierarchy"
    echo "  5. Check Actions panel for pending tasks"
    echo "  6. View Scripts panel (activate the assault script)"
    echo "  7. View Fire Control panel"
    echo "  8. Check Battle Replay is recording"
    echo "  9. Request Intelligence Analysis"

    echo -e "\n${GREEN}Enjoy exploring MCOTS!${NC}\n"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║        MCOTS Demo Setup Script                        ║"
    echo "║        Military Command & Tactical Operations          ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    wait_for_services
    setup_user
    create_blue_force
    create_red_force
    create_formation
    create_obstacles
    set_fields_of_fire
    create_fire_missions
    create_actions
    create_script
    start_recording
    print_summary
}

# Run main function
main
