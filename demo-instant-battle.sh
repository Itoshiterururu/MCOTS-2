#!/bin/bash

# MCOTS Instant Battle Scenario Demo
# Creates a complete tactical scenario with simulated battle results

set -e

# Configuration
API_BASE="http://localhost"
AUTH_API="${API_BASE}:8081/api/v1/auth"
MAP_API="${API_BASE}:8080/api/v1/map"
FIRE_CONTROL_API="${API_BASE}:8080/api/fire-control"
INTEL_API="${API_BASE}:8084/api/v1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_stat() {
    echo -e "${CYAN}  $1${NC}"
}

print_highlight() {
    echo -e "${MAGENTA}★ $1${NC}"
}

wait_for_services() {
    print_header "Checking Services"

    print_info "Waiting for auth-service..."
    for i in {1..30}; do
        if curl -s "${AUTH_API}/test" > /dev/null 2>&1; then
            print_success "Auth service ready"
            break
        fi
        sleep 2
    done

    print_info "Waiting for map-service..."
    for i in {1..30}; do
        if curl -s "${MAP_API}/units" > /dev/null 2>&1; then
            print_success "Map service ready"
            break
        fi
        sleep 2
    done

    print_info "Waiting for intelligence-service..."
    for i in {1..15}; do
        if curl -s "${INTEL_API}/health" > /dev/null 2>&1; then
            print_success "Intelligence service ready"
            break
        fi
        sleep 2
    done
}

setup_user() {
    print_header "Setting Up Demo User"

    curl -s -X POST "${AUTH_API}/register" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "tactical_demo",
            "email": "tactical@mcots.demo",
            "password": "TacticalDemo123"
        }' > /dev/null 2>&1

    LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_API}/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "tactical_demo",
            "password": "TacticalDemo123"
        }')

    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)
    USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        print_error "Failed to login"
        exit 1
    fi

    AUTH_HEADER="Authorization: Bearer $TOKEN"
    USER_HEADER="X-User-Id: $USER_ID"

    print_success "Logged in as tactical_demo"
}

create_blue_force() {
    print_header "Deploying Blue Force (Defensive)"

    # Command Post
    BLUE_CP=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"COMMUNICATIONS","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4501,"longitude":30.5234},"status":"DEFENDING","personnel":50,"vehicles":5,"supplyLevel":100,"morale":95}')
    print_success "Command Post deployed"

    # Main defensive line
    BLUE_TANK1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"TANKS","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4601,"longitude":30.5334},"status":"DEFENDING","personnel":120,"vehicles":40,"supplyLevel":90,"morale":85,"direction":45}')
    BLUE_TANK1_ID=$(echo $BLUE_TANK1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Tank Company positioned (40 tanks)"

    BLUE_MECH1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"MECHANIZED","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4701,"longitude":30.5434},"status":"DEFENDING","personnel":120,"vehicles":40,"supplyLevel":85,"morale":80,"direction":90}')
    BLUE_MECH1_ID=$(echo $BLUE_MECH1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Mechanized Infantry positioned (120 troops)"

    # Artillery support
    BLUE_ARTY=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"HOWITZER","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4301,"longitude":30.5134},"status":"DEFENDING","personnel":30,"vehicles":9,"supplyLevel":95,"morale":90}')
    BLUE_ARTY_ID=$(echo $BLUE_ARTY | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Artillery Battery ready (9 howitzers)"

    # Forward elements
    BLUE_RECON=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"RECONNAISSANCE","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.5001,"longitude":30.5634},"status":"MOVING","personnel":20,"vehicles":6,"supplyLevel":80,"morale":85,"direction":45}')
    BLUE_RECON_ID=$(echo $BLUE_RECON | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Recon Platoon scouting forward"

    # Support units
    curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"AIR_DEFENSE","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4401,"longitude":30.5234},"status":"DEFENDING","personnel":25,"vehicles":6,"supplyLevel":90,"morale":88}' > /dev/null
    print_success "Air Defense deployed"

    curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"SUPPLY","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4201,"longitude":30.5134},"status":"DEFENDING","personnel":30,"vehicles":15,"supplyLevel":100,"morale":75}' > /dev/null
    print_success "Supply Unit secured"

    print_stat "Total: 7 units | 415 personnel | 121 vehicles"
}

create_red_force() {
    print_header "Detecting Red Force (Offensive)"

    # Enemy command
    curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"COMMUNICATIONS","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5501,"longitude":30.6234},"status":"DEFENDING","personnel":45,"vehicles":4,"supplyLevel":85,"morale":70}' > /dev/null
    print_success "Enemy Command Post identified"

    # Assault force
    RED_TANK1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"TANKS","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5401,"longitude":30.6134},"status":"MOVING","personnel":110,"vehicles":35,"supplyLevel":75,"morale":65,"direction":225}')
    RED_TANK1_ID=$(echo $RED_TANK1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Tank Company advancing (35 tanks)"

    RED_MECH1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"MECHANIZED","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5301,"longitude":30.6034},"status":"MOVING","personnel":115,"vehicles":38,"supplyLevel":70,"morale":68,"direction":225}')
    RED_MECH1_ID=$(echo $RED_MECH1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Mechanized Infantry detected (115 troops)"

    # Fire support
    curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"MORTAR","faction":"RED_FORCE","unitRank":"PLATOON","position":{"latitude":50.5601,"longitude":30.6334},"status":"DEFENDING","personnel":28,"vehicles":8,"supplyLevel":80,"morale":72,"direction":180}' > /dev/null
    print_success "Enemy Artillery providing support"

    # Defensive element
    RED_INF=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"INFANTRY","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5201,"longitude":30.5934},"status":"DEFENDING","personnel":100,"vehicles":20,"supplyLevel":65,"morale":60,"direction":180}')
    RED_INF_ID=$(echo $RED_INF | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Infantry holding position"

    print_stat "Total: 5 units | 398 personnel | 105 vehicles"
}

create_defenses() {
    print_header "Establishing Defensive Positions"

    # Obstacles
    curl -s -X POST "${MAP_API}/obstacles" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"type":"MINEFIELD","startPosition":{"latitude":50.49,"longitude":30.55},"endPosition":{"latitude":50.495,"longitude":30.56}}' > /dev/null
    print_success "Minefield laid (covering approach)"

    curl -s -X POST "${MAP_API}/obstacles" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"type":"TANK_TRAP","startPosition":{"latitude":50.485,"longitude":30.54},"endPosition":{"latitude":50.49,"longitude":30.55}}' > /dev/null
    print_success "Tank traps emplaced"

    curl -s -X POST "${MAP_API}/obstacles" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"type":"TRENCH","startPosition":{"latitude":50.46,"longitude":30.53},"endPosition":{"latitude":50.47,"longitude":30.55}}' > /dev/null
    print_success "Trenches dug"

    # Fields of fire
    if [ ! -z "$BLUE_TANK1_ID" ]; then
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${BLUE_TANK1_ID}/field-of-fire" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d '{"centerAzimuth":45,"leftAzimuth":0,"rightAzimuth":90,"maxRange":3000,"minRange":100,"active":true,"priority":"PRIMARY"}' > /dev/null
        print_success "Tank Company fire sector set (3km coverage)"
    fi

    if [ ! -z "$BLUE_MECH1_ID" ]; then
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${BLUE_MECH1_ID}/field-of-fire" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d '{"centerAzimuth":90,"leftAzimuth":45,"rightAzimuth":135,"maxRange":2000,"minRange":50,"active":true,"priority":"PRIMARY"}' > /dev/null
        print_success "Mechanized Infantry fire sector set (2km)"
    fi

    if [ ! -z "$RED_INF_ID" ]; then
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${RED_INF_ID}/field-of-fire" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d '{"centerAzimuth":180,"leftAzimuth":135,"rightAzimuth":225,"maxRange":1500,"minRange":50,"active":true,"priority":"FINAL_PROTECTIVE_FIRE"}' > /dev/null
        print_success "Enemy defensive fire set"
    fi

    # Fire missions
    if [ ! -z "$BLUE_ARTY_ID" ]; then
        curl -s -X POST "${FIRE_CONTROL_API}/fire-missions" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d "{\"artilleryUnitId\":\"${BLUE_ARTY_ID}\",\"missionType\":\"SUPPRESSION\",\"targetCenter\":{\"latitude\":50.53,\"longitude\":30.6},\"targetRadius\":200,\"status\":\"PLANNED\",\"roundsAllocated\":50,\"roundsFired\":0,\"priority\":\"PRIORITY\",\"effectsRadius\":300}" > /dev/null
        print_success "Artillery mission planned (suppression fire)"
    fi
}

create_actions() {
    print_header "Issuing Tactical Orders"

    if [ ! -z "$BLUE_RECON_ID" ]; then
        curl -s -X POST "${MAP_API}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"unitId\":\"${BLUE_RECON_ID}\",\"description\":\"Patrol forward area and report enemy activity\",\"actionType\":\"PATROL\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.51,\"longitude\":30.58},\"durationSeconds\":1800}" > /dev/null
        print_success "Recon patrol order issued"
    fi

    if [ ! -z "$RED_TANK1_ID" ]; then
        curl -s -X POST "${MAP_API}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"unitId\":\"${RED_TANK1_ID}\",\"description\":\"Advance and engage Blue Force positions\",\"actionType\":\"ATTACK\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.47,\"longitude\":30.54},\"durationSeconds\":3600}" > /dev/null
        print_success "Enemy attack order detected"
    fi

    if [ ! -z "$RED_MECH1_ID" ]; then
        curl -s -X POST "${MAP_API}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"unitId\":\"${RED_MECH1_ID}\",\"description\":\"Support tank assault\",\"actionType\":\"MOVE\",\"priority\":\"MEDIUM\",\"targetPosition\":{\"latitude\":50.50,\"longitude\":30.57},\"durationSeconds\":1200}" > /dev/null
        print_success "Enemy support movement order detected"
    fi
}

create_and_activate_script() {
    print_header "Enemy Automated Script Detected"

    if [ ! -z "$RED_TANK1_ID" ] && [ ! -z "$RED_MECH1_ID" ]; then
        SCRIPT=$(curl -s -X POST "${MAP_API}/scripts" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d '{"name":"Red Force Coordinated Assault","description":"Automated enemy assault sequence","isActive":false,"priority":"HIGH"}')
        SCRIPT_ID=$(echo $SCRIPT | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

        if [ ! -z "$SCRIPT_ID" ]; then
            print_success "Enemy script identified: 'Coordinated Assault'"

            # Add script actions
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${RED_TANK1_ID}\",\"description\":\"Tank advance phase 1\",\"actionType\":\"MOVE\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.50,\"longitude\":30.56},\"executionOrder\":1,\"durationSeconds\":600}" > /dev/null

            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${RED_MECH1_ID}\",\"description\":\"Mechanized support\",\"actionType\":\"MOVE\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.49,\"longitude\":30.55},\"executionOrder\":2,\"durationSeconds\":600}" > /dev/null

            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${RED_TANK1_ID}\",\"description\":\"Final assault\",\"actionType\":\"ATTACK\",\"priority\":\"URGENT\",\"targetPosition\":{\"latitude\":50.47,\"longitude\":30.54},\"executionOrder\":3,\"durationSeconds\":1800}" > /dev/null

            print_success "Script sequence: 3 coordinated actions"

            # Activate script
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/activate" -H "$AUTH_HEADER" -H "$USER_HEADER" > /dev/null
            print_highlight "ENEMY SCRIPT ACTIVATED - Assault in progress!"
        fi
    fi
}

simulate_battle() {
    print_header "Battle Simulation In Progress"

    print_info "Waiting for initial contact..."
    sleep 3

    print_highlight "CONTACT! Enemy armor engaged at 2.8km"
    sleep 2

    print_info "Blue Force artillery firing suppression mission..."
    sleep 2

    print_info "Enemy taking casualties from defensive fire..."
    sleep 2

    print_info "Red Force continuing advance under fire..."
    sleep 2

    print_highlight "Heavy fighting in the minefield sector!"
    sleep 2

    # Phase 1: Initial engagement
    print_info "Enemy advancing into engagement range..."
    if [ ! -z "$RED_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_TANK1_ID}\",\"position\":{\"latitude\":50.495,\"longitude\":30.565},\"status\":\"ATTACKING\",\"personnel\":115,\"vehicles\":35,\"firepower\":500,\"supplyLevel\":85,\"morale\":75,\"direction\":225}" > /dev/null
    fi
    if [ ! -z "$RED_MECH1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_MECH1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_MECH1_ID}\",\"position\":{\"latitude\":50.485,\"longitude\":30.560},\"status\":\"ATTACKING\",\"personnel\":115,\"vehicles\":38,\"firepower\":420,\"supplyLevel\":80,\"morale\":70,\"direction\":225}" > /dev/null
    fi
    sleep 2

    # Phase 2: Taking casualties
    print_info "Blue Force engaging at range..."
    if [ ! -z "$RED_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_TANK1_ID}\",\"position\":{\"latitude\":50.485,\"longitude\":30.555},\"status\":\"ATTACKING\",\"personnel\":92,\"vehicles\":28,\"firepower\":400,\"supplyLevel\":70,\"morale\":55,\"direction\":225}" > /dev/null
        print_info "Red Tank Company: 7 tanks destroyed, 23 casualties"
    fi
    sleep 2

    # Phase 3: Heavy fighting
    print_info "Intense firefight in progress..."
    if [ ! -z "$RED_MECH1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_MECH1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_MECH1_ID}\",\"position\":{\"latitude\":50.475,\"longitude\":30.550},\"status\":\"ATTACKING\",\"personnel\":65,\"vehicles\":20,\"firepower\":280,\"supplyLevel\":55,\"morale\":35,\"direction\":225}" > /dev/null
        print_info "Red Mechanized Infantry: 50 casualties, 18 vehicles destroyed"
    fi

    if [ ! -z "$BLUE_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_TANK1_ID}\",\"position\":{\"latitude\":50.460,\"longitude\":30.533},\"status\":\"DEFENDING\",\"personnel\":110,\"vehicles\":37,\"firepower\":530,\"supplyLevel\":75,\"morale\":85,\"direction\":45}" > /dev/null
        print_info "Blue Tank Company: 3 tanks damaged, 10 casualties"
    fi
    sleep 2

    # Phase 4: Enemy unit destroyed
    print_highlight "Critical hit on enemy infantry!"
    if [ ! -z "$RED_INF_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_INF_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_INF_ID}\",\"position\":{\"latitude\":50.545,\"longitude\":30.61},\"status\":\"DESTROYED\",\"personnel\":0,\"vehicles\":0,\"firepower\":0,\"supplyLevel\":0,\"morale\":0,\"direction\":180}" > /dev/null
        print_info "Red Infantry Battalion: DESTROYED by artillery strike"
    fi
    sleep 1

    # Phase 5: Final positions
    if [ ! -z "$BLUE_MECH1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_MECH1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_MECH1_ID}\",\"position\":{\"latitude\":50.470,\"longitude\":30.543},\"status\":\"DEFENDING\",\"personnel\":105,\"vehicles\":36,\"firepower\":420,\"supplyLevel\":70,\"morale\":80,\"direction\":90}" > /dev/null
        print_info "Blue Mechanized Infantry: 15 casualties, position secure"
    fi

    sleep 2
    print_highlight "Engagement concludes - Defensive success!"
}

request_intelligence() {
    print_header "Intelligence Analysis Report"

    print_info "Requesting AI tactical analysis..."
    sleep 1

    # Get all units for analysis
    UNITS=$(curl -s "${MAP_API}/units" -H "$AUTH_HEADER" -H "$USER_HEADER")

    # Request intelligence analysis
    ANALYSIS=$(curl -s -X POST "${INTEL_API}/analyze" \
        -H "Content-Type: application/json" \
        -d "{
            \"battle_data\": {
                \"blue_force\": {
                    \"units\": 7,
                    \"personnel\": 400,
                    \"vehicles\": 118,
                    \"status\": \"Defensive positions holding\"
                },
                \"red_force\": {
                    \"units\": 5,
                    \"personnel\": 175,
                    \"vehicles\": 53,
                    \"status\": \"Assault repulsed, heavy casualties\"
                }
            },
            \"terrain\": \"mixed\",
            \"weather\": \"clear\"
        }" 2>/dev/null)

    if [ ! -z "$ANALYSIS" ]; then
        print_success "Intelligence analysis received"
        echo -e "\n${CYAN}═══ AI TACTICAL ASSESSMENT ═══${NC}"
        echo "$ANALYSIS" | grep -o '"analysis":"[^"]*' | cut -d'"' -f4 | head -c 500
        echo -e "\n"
    else
        print_info "Intelligence service may need API key configuration"
    fi
}

show_statistics() {
    print_header "Battle Statistics"

    # Fetch current unit data
    UNITS_DATA=$(curl -s "${MAP_API}/units" -H "$AUTH_HEADER" -H "$USER_HEADER")

    # Calculate Blue Force stats
    BLUE_PERSONNEL=$(echo "$UNITS_DATA" | grep -o '"faction":"BLUE_FORCE"[^}]*"personnel":[0-9]*' | grep -o '"personnel":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s}')
    BLUE_VEHICLES=$(echo "$UNITS_DATA" | grep -o '"faction":"BLUE_FORCE"[^}]*"vehicles":[0-9]*' | grep -o '"vehicles":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s}')
    BLUE_UNITS=$(echo "$UNITS_DATA" | grep -c '"faction":"BLUE_FORCE"')

    # Calculate Red Force stats
    RED_PERSONNEL=$(echo "$UNITS_DATA" | grep -o '"faction":"RED_FORCE"[^}]*"personnel":[0-9]*' | grep -o '"personnel":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s}')
    RED_VEHICLES=$(echo "$UNITS_DATA" | grep -o '"faction":"RED_FORCE"[^}]*"vehicles":[0-9]*' | grep -o '"vehicles":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s}')
    RED_UNITS=$(echo "$UNITS_DATA" | grep -c '"faction":"RED_FORCE"')

    # Calculate casualties (from initial values)
    BLUE_CASUALTIES=$((830 - BLUE_PERSONNEL))
    RED_CASUALTIES=$((575 - RED_PERSONNEL))
    BLUE_VEH_LOSSES=$((246 - BLUE_VEHICLES))
    RED_VEH_LOSSES=$((158 - RED_VEHICLES))

    echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              FORCE COMPARISON                     ║${NC}"
    echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║  ${NC}BLUE FORCE (Defender)                          ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Units:      ${BLUE_UNITS} (operational)                   ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Personnel:  ${BLUE_PERSONNEL} (casualties: ${BLUE_CASUALTIES})            ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Vehicles:   ${BLUE_VEHICLES} (losses: ${BLUE_VEH_LOSSES})                 ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Morale:     85% (holding firm)                 ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Position:   Intact                             ${CYAN}║${NC}"
    echo -e "${CYAN}╠═══════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║  ${NC}RED FORCE (Attacker)                           ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Units:      ${RED_UNITS} (1 destroyed, others damaged)     ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Personnel:  ${RED_PERSONNEL} (casualties: ${RED_CASUALTIES})            ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Vehicles:   ${RED_VEHICLES} (losses: ${RED_VEH_LOSSES})                  ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Morale:     45% (severely degraded)            ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Position:   Assault failed                     ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"

    echo -e "\n${YELLOW}KEY ENGAGEMENTS:${NC}"
    print_stat "• Tank battle - Red lost 7 tanks vs Blue lost 3"
    print_stat "• Mechanized clash - Red 50 casualties vs Blue 15"
    print_stat "• Artillery strike - Red Infantry Battalion destroyed"
    print_stat "• Defensive fire sectors - 100% coverage maintained"

    echo -e "\n${GREEN}TACTICAL ASSESSMENT:${NC}"
    print_stat "• Blue Force prepared positions proved decisive"
    print_stat "• Obstacles channeled enemy into kill zones"
    print_stat "• Artillery effectively suppressed enemy advance"
    print_stat "• Communications network maintained coordination"
    print_stat "• Defensive victory - position secure"
}

show_ui_guide() {
    print_header "Explore the Tactical Map"

    echo -e "${YELLOW}Open your browser and go to:${NC}"
    echo -e "${GREEN}  http://localhost:5173${NC}"

    echo -e "\n${YELLOW}Login credentials:${NC}"
    echo -e "  Username: ${CYAN}tactical_demo${NC}"
    echo -e "  Password: ${CYAN}TacticalDemo123${NC}"

    echo -e "\n${MAGENTA}★ INTERACTIVE FEATURES TO EXPLORE:${NC}"
    echo ""
    echo -e "${CYAN}1. Map Layers (Toggle to see):${NC}"
    print_stat "☑ Units - All 12 military units on the map"
    print_stat "☑ Communications - Command & control network"
    print_stat "☑ Fields of Fire - Defensive fire sectors (colored arcs)"
    print_stat "☑ Fire Missions - Artillery target zones (circles)"
    print_stat "☑ Obstacles - Defensive barriers (lines)"

    echo -e "\n${CYAN}2. Unit Details:${NC}"
    print_stat "• Click any unit to see full statistics"
    print_stat "• View firepower, morale, supply status"
    print_stat "• Check communications links"
    print_stat "• See damage and casualties"

    echo -e "\n${CYAN}3. Actions Panel:${NC}"
    print_stat "• View all tactical orders"
    print_stat "• See script execution status"
    print_stat "• Monitor unit movements"

    echo -e "\n${CYAN}4. Scripts Panel:${NC}"
    print_stat "• Check 'Red Force Coordinated Assault' (ACTIVE)"
    print_stat "• View 3-step assault sequence"
    print_stat "• See automation in action"

    echo -e "\n${CYAN}5. Fire Control:${NC}"
    print_stat "• View planned artillery missions"
    print_stat "• See defensive fire sectors"
    print_stat "• Check coverage zones"

    echo -e "\n${CYAN}6. Intelligence Analysis:${NC}"
    print_stat "• Request AI tactical recommendations"
    print_stat "• Get force comparison analysis"
    print_stat "• Receive tactical suggestions"
}

print_banner() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║          MCOTS Instant Battle Scenario                ║"
    echo "║          Tactical Operations Demonstration            ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

wait_for_user() {
    print_header "⚠️  OPEN THE MAP INTERFACE NOW"
    echo ""
    echo -e "${YELLOW}Before the battle starts, please:${NC}"
    echo ""
    echo -e "${CYAN}1. Open browser: ${GREEN}http://localhost:5173${NC}"
    echo -e "${CYAN}2. Login:${NC}"
    echo -e "   Username: ${GREEN}tactical_demo${NC}"
    echo -e "   Password: ${GREEN}TacticalDemo123${NC}"
    echo ""
    echo -e "${YELLOW}You should see:${NC}"
    echo -e "${CYAN}  ✓ Green 'Live Updates' indicator (bottom-right corner)${NC}"
    echo -e "${CYAN}  ✓ Click '📊 Show Stats' button to open dashboard${NC}"
    echo -e "${CYAN}  ✓ 12 military units displayed on the map${NC}"
    echo -e "${CYAN}  ✓ Blue defensive positions, Red offensive positions${NC}"
    echo ""
    echo -e "${MAGENTA}★ When the battle starts, you will see:${NC}"
    echo -e "${CYAN}  • Units moving (blue dashed trails appear)${NC}"
    echo -e "${CYAN}  • Health bars decreasing${NC}"
    echo -e "${CYAN}  • Statistics updating in real-time${NC}"
    echo -e "${CYAN}  • One unit marked DESTROYED with skull icon${NC}"
    echo ""
    echo -e "${RED}█████████████████████████████████████████████████${NC}"
    echo -e "${RED}█                                               █${NC}"
    echo -e "${RED}█  Press ENTER when ready to START BATTLE...   █${NC}"
    echo -e "${RED}█                                               █${NC}"
    echo -e "${RED}█████████████████████████████████████████████████${NC}"
    echo ""
    read
}

main() {
    print_banner

    wait_for_services
    setup_user
    create_blue_force
    create_red_force
    create_defenses
    create_actions
    create_and_activate_script

    wait_for_user

    simulate_battle
    request_intelligence
    show_statistics
    show_ui_guide

    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  ✓ Demo scenario complete! Check all visual changes. ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"
}

main
