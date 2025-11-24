#!/bin/bash

# MCOTS Offensive Battle Scenario Demo
# Blue Force launches coordinated assault on Red Force defensive positions

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

print_battle() {
    echo -e "${RED}⚔ $1${NC}"
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
    print_header "Setting Up Commander Account"

    curl -s -X POST "${AUTH_API}/register" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "offensive_commander",
            "email": "commander@mcots.demo",
            "password": "OffensiveOps123"
        }' > /dev/null 2>&1

    LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_API}/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "offensive_commander",
            "password": "OffensiveOps123"
        }')

    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)
    USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        print_error "Failed to login"
        exit 1
    fi

    AUTH_HEADER="Authorization: Bearer $TOKEN"
    USER_HEADER="X-User-Id: $USER_ID"

    print_success "Logged in as offensive_commander"
}

create_red_force_defense() {
    print_header "Intelligence Report: Enemy Defensive Positions"

    # Enemy Command Post (fortified)
    curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"COMMUNICATIONS","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5201,"longitude":30.6034},"status":"DEFENDING","personnel":60,"vehicles":8,"supplyLevel":95,"morale":80}' > /dev/null
    print_success "Enemy Command Post identified (fortified position)"

    # Main defensive line - Tanks in hull-down positions
    RED_TANK1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"TANKS","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.4901,"longitude":30.5834},"status":"DEFENDING","personnel":100,"vehicles":32,"supplyLevel":90,"morale":75,"direction":225}')
    RED_TANK1_ID=$(echo $RED_TANK1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Tank Company in hull-down positions (32 tanks)"

    # Mechanized infantry holding town
    RED_MECH1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"MECHANIZED","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.4801,"longitude":30.5734},"status":"DEFENDING","personnel":130,"vehicles":35,"supplyLevel":85,"morale":70,"direction":180}')
    RED_MECH1_ID=$(echo $RED_MECH1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Mechanized Infantry holding urban sector (130 troops)"

    # Infantry in trenches
    RED_INF1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"INFANTRY","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.4751,"longitude":30.5634},"status":"DEFENDING","personnel":110,"vehicles":15,"supplyLevel":80,"morale":65,"direction":200}')
    RED_INF1_ID=$(echo $RED_INF1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Infantry in prepared trenches (110 troops)"

    # Artillery support
    RED_ARTY=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"HOWITZER","faction":"RED_FORCE","unitRank":"PLATOON","position":{"latitude":50.5101,"longitude":30.6134},"status":"DEFENDING","personnel":35,"vehicles":12,"supplyLevel":90,"morale":70}')
    RED_ARTY_ID=$(echo $RED_ARTY | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Artillery Battery providing fire support (12 howitzers)"

    # Air defense protecting rear
    curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"AIR_DEFENSE","faction":"RED_FORCE","unitRank":"PLATOON","position":{"latitude":50.5151,"longitude":30.5934},"status":"DEFENDING","personnel":30,"vehicles":8,"supplyLevel":85,"morale":72}' > /dev/null
    print_success "Enemy Air Defense covering rear area"

    # Anti-tank positions
    RED_AT=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"ANTI_TANK","faction":"RED_FORCE","unitRank":"PLATOON","position":{"latitude":50.4851,"longitude":30.5784},"status":"DEFENDING","personnel":25,"vehicles":6,"supplyLevel":80,"morale":68,"direction":210}')
    RED_AT_ID=$(echo $RED_AT | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Enemy Anti-Tank platoon covering approaches"

    print_stat "Enemy Force Total: 7 units | 490 personnel | 116 vehicles"
    print_stat "Defense depth: 3km | Strong fortifications"
}

create_blue_force_assault() {
    print_header "Deploying Blue Force Assault Elements"

    # Forward Command Post
    BLUE_CP=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"COMMUNICATIONS","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4201,"longitude":30.5034},"status":"DEFENDING","personnel":55,"vehicles":6,"supplyLevel":100,"morale":95}')
    print_success "Forward Command Post established"

    # Main assault force - Tank battalion (2 companies)
    BLUE_TANK1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"TANKS","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4301,"longitude":30.5134},"status":"MOVING","personnel":130,"vehicles":45,"supplyLevel":95,"morale":90,"direction":45}')
    BLUE_TANK1_ID=$(echo $BLUE_TANK1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "1st Tank Company ready for assault (45 tanks) - MAIN EFFORT"

    BLUE_TANK2=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"TANKS","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4351,"longitude":30.4934},"status":"MOVING","personnel":125,"vehicles":42,"supplyLevel":95,"morale":88,"direction":60}')
    BLUE_TANK2_ID=$(echo $BLUE_TANK2 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "2nd Tank Company for flanking maneuver (42 tanks)"

    # Mechanized infantry for exploitation
    BLUE_MECH1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"MECHANIZED","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4251,"longitude":30.5234},"status":"MOVING","personnel":140,"vehicles":40,"supplyLevel":90,"morale":85,"direction":45}')
    BLUE_MECH1_ID=$(echo $BLUE_MECH1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Mechanized Infantry ready to exploit breakthrough (140 troops)"

    # Artillery - fire preparation
    BLUE_ARTY1=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"HOWITZER","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4101,"longitude":30.5034},"status":"DEFENDING","personnel":80,"vehicles":24,"supplyLevel":100,"morale":92}')
    BLUE_ARTY1_ID=$(echo $BLUE_ARTY1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Artillery Battery for fire preparation (24 howitzers)"

    # Reconnaissance leading the way
    BLUE_RECON=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"RECONNAISSANCE","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4451,"longitude":30.5334},"status":"MOVING","personnel":25,"vehicles":8,"supplyLevel":85,"morale":90,"direction":45}')
    BLUE_RECON_ID=$(echo $BLUE_RECON | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Recon Platoon scouting ahead"

    # UAV support
    BLUE_UAV=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"UAV","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4151,"longitude":30.5134},"status":"MOVING","personnel":15,"vehicles":12,"supplyLevel":95,"morale":88}')
    BLUE_UAV_ID=$(echo $BLUE_UAV | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "UAV Platoon providing ISR coverage (12 drones)"

    # Engineer support for breaching
    BLUE_ENG=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"ENGINEER","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4281,"longitude":30.5184},"status":"MOVING","personnel":35,"vehicles":10,"supplyLevel":90,"morale":82,"direction":45}')
    BLUE_ENG_ID=$(echo $BLUE_ENG | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Combat Engineers ready for breaching operations"

    # Reserve force
    BLUE_RESERVE=$(curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"unitType":"INFANTRY","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4151,"longitude":30.5084},"status":"DEFENDING","personnel":120,"vehicles":25,"supplyLevel":95,"morale":85}')
    BLUE_RESERVE_ID=$(echo $BLUE_RESERVE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_success "Infantry Reserve standing by"

    print_stat "Assault Force Total: 9 units | 725 personnel | 212 vehicles"
    print_stat "Force ratio: 1.5:1 advantage | Combined arms assault"
}

create_enemy_defenses() {
    print_header "Enemy Defensive Obstacles Identified"

    # Minefield belt
    curl -s -X POST "${MAP_API}/obstacles" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"type":"MINEFIELD","startPosition":{"latitude":50.46,"longitude":30.54},"endPosition":{"latitude":50.465,"longitude":30.58}}' > /dev/null
    print_success "Minefield belt detected (500m wide)"

    curl -s -X POST "${MAP_API}/obstacles" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"type":"MINEFIELD","startPosition":{"latitude":50.465,"longitude":30.58},"endPosition":{"latitude":50.47,"longitude":30.59}}' > /dev/null
    print_success "Secondary minefield covering flank"

    # Tank traps
    curl -s -X POST "${MAP_API}/obstacles" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"type":"TANK_TRAP","startPosition":{"latitude":50.47,"longitude":30.55},"endPosition":{"latitude":50.475,"longitude":30.57}}' > /dev/null
    print_success "Anti-tank obstacles emplaced"

    # Wire obstacles
    curl -s -X POST "${MAP_API}/obstacles" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
        -d '{"type":"WIRE","startPosition":{"latitude":50.475,"longitude":30.56},"endPosition":{"latitude":50.48,"longitude":30.58}}' > /dev/null
    print_success "Wire obstacles protecting infantry positions"

    # Enemy fields of fire
    if [ ! -z "$RED_TANK1_ID" ]; then
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${RED_TANK1_ID}/field-of-fire" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d '{"centerAzimuth":225,"leftAzimuth":180,"rightAzimuth":270,"maxRange":3500,"minRange":200,"active":true,"priority":"PRIMARY"}' > /dev/null
        print_success "Enemy tank kill zone identified (3.5km range)"
    fi

    if [ ! -z "$RED_AT_ID" ]; then
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${RED_AT_ID}/field-of-fire" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d '{"centerAzimuth":210,"leftAzimuth":170,"rightAzimuth":250,"maxRange":2500,"minRange":100,"active":true,"priority":"PRIMARY"}' > /dev/null
        print_success "Enemy anti-tank ambush positions marked"
    fi

    if [ ! -z "$RED_MECH1_ID" ]; then
        curl -s -X PUT "${FIRE_CONTROL_API}/units/${RED_MECH1_ID}/field-of-fire" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d '{"centerAzimuth":180,"leftAzimuth":135,"rightAzimuth":225,"maxRange":1500,"minRange":50,"active":true,"priority":"FINAL_PROTECTIVE_FIRE"}' > /dev/null
        print_success "Enemy final protective fire lanes plotted"
    fi
}

create_assault_plan() {
    print_header "Assault Plan: Operation Thunder Strike"

    # Artillery fire missions
    if [ ! -z "$BLUE_ARTY1_ID" ]; then
        # Suppression on enemy tanks
        curl -s -X POST "${FIRE_CONTROL_API}/fire-missions" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d "{\"artilleryUnitId\":\"${BLUE_ARTY1_ID}\",\"missionType\":\"SUPPRESSION\",\"targetCenter\":{\"latitude\":50.49,\"longitude\":30.58},\"targetRadius\":300,\"status\":\"PLANNED\",\"roundsAllocated\":120,\"roundsFired\":0,\"priority\":\"PRIORITY\",\"effectsRadius\":400}" > /dev/null
        print_success "Fire Mission ALPHA: Suppress enemy armor"

        # Destruction on AT positions
        curl -s -X POST "${FIRE_CONTROL_API}/fire-missions" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d "{\"artilleryUnitId\":\"${BLUE_ARTY1_ID}\",\"missionType\":\"DESTRUCTION\",\"targetCenter\":{\"latitude\":50.485,\"longitude\":30.578},\"targetRadius\":150,\"status\":\"PLANNED\",\"roundsAllocated\":80,\"roundsFired\":0,\"priority\":\"URGENT\",\"effectsRadius\":200}" > /dev/null
        print_success "Fire Mission BRAVO: Destroy anti-tank positions"

        # Smoke screen
        curl -s -X POST "${FIRE_CONTROL_API}/fire-missions" -H "Content-Type: application/json" -H "$USER_HEADER" \
            -d "{\"artilleryUnitId\":\"${BLUE_ARTY1_ID}\",\"missionType\":\"SMOKE\",\"targetCenter\":{\"latitude\":50.465,\"longitude\":30.56},\"targetRadius\":400,\"status\":\"PLANNED\",\"roundsAllocated\":40,\"roundsFired\":0,\"priority\":\"PRIORITY\",\"effectsRadius\":500}" > /dev/null
        print_success "Fire Mission CHARLIE: Smoke screen for assault"
    fi

    # Assault actions
    if [ ! -z "$BLUE_RECON_ID" ]; then
        curl -s -X POST "${MAP_API}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"unitId\":\"${BLUE_RECON_ID}\",\"description\":\"Infiltrate and mark breach points\",\"actionType\":\"RECON\",\"priority\":\"URGENT\",\"targetPosition\":{\"latitude\":50.46,\"longitude\":30.55},\"durationSeconds\":600}" > /dev/null
        print_success "Recon: Identify breach points in obstacle belt"
    fi

    if [ ! -z "$BLUE_TANK1_ID" ]; then
        curl -s -X POST "${MAP_API}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"unitId\":\"${BLUE_TANK1_ID}\",\"description\":\"Main assault through breach - destroy enemy armor\",\"actionType\":\"ATTACK\",\"priority\":\"URGENT\",\"targetPosition\":{\"latitude\":50.49,\"longitude\":30.58},\"durationSeconds\":1800}" > /dev/null
        print_success "1st Tanks: Assault through breach - MAIN EFFORT"
    fi

    if [ ! -z "$BLUE_TANK2_ID" ]; then
        curl -s -X POST "${MAP_API}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"unitId\":\"${BLUE_TANK2_ID}\",\"description\":\"Flanking attack on enemy left\",\"actionType\":\"FLANK\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.485,\"longitude\":30.60},\"durationSeconds\":1800}" > /dev/null
        print_success "2nd Tanks: Flanking maneuver"
    fi

    if [ ! -z "$BLUE_MECH1_ID" ]; then
        curl -s -X POST "${MAP_API}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"unitId\":\"${BLUE_MECH1_ID}\",\"description\":\"Follow tanks, secure objectives\",\"actionType\":\"ATTACK\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.48,\"longitude\":30.57},\"durationSeconds\":2400}" > /dev/null
        print_success "Mech Infantry: Exploit breakthrough"
    fi
}

create_assault_script() {
    print_header "Automated Assault Sequence"

    if [ ! -z "$BLUE_TANK1_ID" ] && [ ! -z "$BLUE_TANK2_ID" ] && [ ! -z "$BLUE_MECH1_ID" ]; then
        SCRIPT=$(curl -s -X POST "${MAP_API}/scripts" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d '{"name":"Operation Thunder Strike","description":"Coordinated combined arms assault on enemy defensive positions","isActive":false,"priority":"URGENT","targetFaction":"BLUE_FORCE"}')
        SCRIPT_ID=$(echo $SCRIPT | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

        if [ ! -z "$SCRIPT_ID" ]; then
            print_success "Assault script created: 'Operation Thunder Strike'"

            # Phase 1: Recon forward
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${BLUE_RECON_ID}\",\"description\":\"Scout enemy positions\",\"actionType\":\"RECON\",\"priority\":\"URGENT\",\"targetPosition\":{\"latitude\":50.455,\"longitude\":30.545},\"executionOrder\":1,\"triggerType\":\"IMMEDIATE\",\"durationSeconds\":300}" > /dev/null
            print_stat "Phase 1: Reconnaissance"

            # Phase 2: Engineers breach
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${BLUE_ENG_ID}\",\"description\":\"Clear minefield lane\",\"actionType\":\"MOVE\",\"priority\":\"URGENT\",\"targetPosition\":{\"latitude\":50.46,\"longitude\":30.55},\"executionOrder\":2,\"triggerType\":\"TIME_BASED\",\"delaySeconds\":10,\"durationSeconds\":600}" > /dev/null
            print_stat "Phase 2: Breach obstacles"

            # Phase 3: Main assault
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${BLUE_TANK1_ID}\",\"description\":\"Assault through breach\",\"actionType\":\"ATTACK\",\"priority\":\"URGENT\",\"targetPosition\":{\"latitude\":50.475,\"longitude\":30.565},\"executionOrder\":3,\"triggerType\":\"TIME_BASED\",\"delaySeconds\":15,\"durationSeconds\":900}" > /dev/null
            print_stat "Phase 3: Armor assault"

            # Phase 4: Flanking attack
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${BLUE_TANK2_ID}\",\"description\":\"Flank enemy positions\",\"actionType\":\"FLANK\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.485,\"longitude\":30.595},\"executionOrder\":4,\"triggerType\":\"TIME_BASED\",\"delaySeconds\":10,\"durationSeconds\":900}" > /dev/null
            print_stat "Phase 4: Flanking maneuver"

            # Phase 5: Exploitation
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${BLUE_MECH1_ID}\",\"description\":\"Exploit breakthrough\",\"actionType\":\"ATTACK\",\"priority\":\"HIGH\",\"targetPosition\":{\"latitude\":50.49,\"longitude\":30.58},\"executionOrder\":5,\"triggerType\":\"TIME_BASED\",\"delaySeconds\":15,\"durationSeconds\":1200}" > /dev/null
            print_stat "Phase 5: Infantry exploitation"

            # Phase 6: Secure objective
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/actions" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
                -d "{\"unitId\":\"${BLUE_TANK1_ID}\",\"description\":\"Secure enemy command post\",\"actionType\":\"ATTACK\",\"priority\":\"URGENT\",\"targetPosition\":{\"latitude\":50.52,\"longitude\":30.60},\"executionOrder\":6,\"triggerType\":\"TIME_BASED\",\"delaySeconds\":20,\"durationSeconds\":600}" > /dev/null
            print_stat "Phase 6: Objective seizure"

            # Activate script
            curl -s -X POST "${MAP_API}/scripts/${SCRIPT_ID}/activate" -H "$AUTH_HEADER" -H "$USER_HEADER" > /dev/null
            print_highlight "ASSAULT SCRIPT ACTIVATED - Operation Thunder Strike commencing!"
        fi
    fi
}

simulate_assault() {
    print_header "OPERATION THUNDER STRIKE - ASSAULT IN PROGRESS"

    echo -e "\n${YELLOW}══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  H-HOUR: Artillery preparation begins...${NC}"
    echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}\n"
    sleep 2

    print_battle "Artillery barrage on enemy positions!"
    sleep 1

    print_info "24 howitzers firing - 120 rounds on target..."
    sleep 2

    print_info "Smoke screen deploying..."
    sleep 1

    print_highlight "Enemy anti-tank position DESTROYED by artillery!"
    if [ ! -z "$RED_AT_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_AT_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_AT_ID}\",\"position\":{\"latitude\":50.4851,\"longitude\":30.5784},\"status\":\"DESTROYED\",\"personnel\":0,\"vehicles\":0,\"firepower\":0,\"supplyLevel\":0,\"morale\":0,\"direction\":210}" > /dev/null
        print_info "Enemy AT Platoon: DESTROYED (25 KIA, 6 vehicles destroyed)"
    fi
    sleep 2

    echo -e "\n${YELLOW}══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  H+5: Ground assault begins!${NC}"
    echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}\n"

    # Recon advances
    print_info "Recon platoon infiltrating..."
    if [ ! -z "$BLUE_RECON_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_RECON_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_RECON_ID}\",\"position\":{\"latitude\":50.455,\"longitude\":30.545},\"status\":\"ATTACKING\",\"personnel\":25,\"vehicles\":8,\"firepower\":120,\"supplyLevel\":80,\"morale\":88,\"direction\":45}" > /dev/null
    fi
    sleep 2

    # Engineers breach
    print_info "Engineers clearing minefield lane..."
    if [ ! -z "$BLUE_ENG_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_ENG_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_ENG_ID}\",\"position\":{\"latitude\":50.46,\"longitude\":30.55},\"status\":\"ATTACKING\",\"personnel\":32,\"vehicles\":9,\"firepower\":80,\"supplyLevel\":85,\"morale\":80,\"direction\":45}" > /dev/null
        print_info "Engineers: 3 casualties from mines, lane cleared!"
    fi
    sleep 2

    echo -e "\n${YELLOW}══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  H+10: Armor assault through breach!${NC}"
    echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}\n"

    # Main tank assault
    print_battle "1st Tank Company charging through breach!"
    if [ ! -z "$BLUE_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_TANK1_ID}\",\"position\":{\"latitude\":50.465,\"longitude\":30.56},\"status\":\"ATTACKING\",\"personnel\":128,\"vehicles\":44,\"firepower\":650,\"supplyLevel\":88,\"morale\":92,\"direction\":45}" > /dev/null
    fi
    sleep 2

    # Enemy tanks engage
    print_battle "CONTACT! Enemy tanks engaging at 2.5km!"
    sleep 1

    print_info "Tank battle in progress..."
    sleep 2

    # Both sides take casualties
    if [ ! -z "$BLUE_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_TANK1_ID}\",\"position\":{\"latitude\":50.475,\"longitude\":30.565},\"status\":\"ATTACKING\",\"personnel\":118,\"vehicles\":39,\"firepower\":580,\"supplyLevel\":75,\"morale\":85,\"direction\":45}" > /dev/null
        print_info "Blue 1st Tanks: 5 tanks destroyed, 10 casualties - CONTINUING ATTACK"
    fi

    if [ ! -z "$RED_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_TANK1_ID}\",\"position\":{\"latitude\":50.4901,\"longitude\":30.5834},\"status\":\"DEFENDING\",\"personnel\":72,\"vehicles\":18,\"firepower\":280,\"supplyLevel\":70,\"morale\":50,\"direction\":225}" > /dev/null
        print_info "Red Tanks: 14 tanks destroyed, 28 casualties - MORALE BREAKING"
    fi
    sleep 2

    echo -e "\n${YELLOW}══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  H+15: Flanking attack succeeds!${NC}"
    echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}\n"

    # Flanking tanks
    print_battle "2nd Tank Company hits enemy flank!"
    if [ ! -z "$BLUE_TANK2_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_TANK2_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_TANK2_ID}\",\"position\":{\"latitude\":50.485,\"longitude\":30.595},\"status\":\"ATTACKING\",\"personnel\":120,\"vehicles\":40,\"firepower\":600,\"supplyLevel\":82,\"morale\":90,\"direction\":315}" > /dev/null
    fi
    sleep 1

    # Enemy mech taking casualties
    if [ ! -z "$RED_MECH1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_MECH1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_MECH1_ID}\",\"position\":{\"latitude\":50.4801,\"longitude\":30.5734},\"status\":\"DEFENDING\",\"personnel\":85,\"vehicles\":22,\"firepower\":200,\"supplyLevel\":60,\"morale\":35,\"direction\":180}" > /dev/null
        print_info "Red Mech Infantry: 45 casualties, 13 vehicles - WAVERING"
    fi
    sleep 2

    # Enemy infantry collapses
    print_highlight "Enemy infantry position OVERRUN!"
    if [ ! -z "$RED_INF1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_INF1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_INF1_ID}\",\"position\":{\"latitude\":50.4751,\"longitude\":30.5634},\"status\":\"DESTROYED\",\"personnel\":0,\"vehicles\":0,\"firepower\":0,\"supplyLevel\":0,\"morale\":0,\"direction\":200}" > /dev/null
        print_info "Red Infantry: DESTROYED - 85 KIA, 25 POW, position captured"
    fi
    sleep 2

    echo -e "\n${YELLOW}══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  H+20: Exploitation phase - Infantry advances!${NC}"
    echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}\n"

    # Mech infantry exploits
    print_battle "Mechanized Infantry exploiting breakthrough!"
    if [ ! -z "$BLUE_MECH1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_MECH1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_MECH1_ID}\",\"position\":{\"latitude\":50.49,\"longitude\":30.58},\"status\":\"ATTACKING\",\"personnel\":130,\"vehicles\":38,\"firepower\":450,\"supplyLevel\":78,\"morale\":88,\"direction\":45}" > /dev/null
        print_info "Mech Infantry: 10 casualties, seizing key terrain"
    fi
    sleep 2

    # Enemy artillery silenced
    print_highlight "Counter-battery fire - enemy artillery SILENCED!"
    if [ ! -z "$RED_ARTY_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_ARTY_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_ARTY_ID}\",\"position\":{\"latitude\":50.5101,\"longitude\":30.6134},\"status\":\"DESTROYED\",\"personnel\":0,\"vehicles\":0,\"firepower\":0,\"supplyLevel\":0,\"morale\":0}" > /dev/null
        print_info "Red Artillery: DESTROYED by counter-battery fire"
    fi
    sleep 2

    echo -e "\n${YELLOW}══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  H+30: OBJECTIVE SECURED!${NC}"
    echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}\n"

    # Final positions
    print_battle "Tanks assault enemy command post!"
    if [ ! -z "$BLUE_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${BLUE_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${BLUE_TANK1_ID}\",\"position\":{\"latitude\":50.515,\"longitude\":30.60},\"status\":\"ATTACKING\",\"personnel\":115,\"vehicles\":38,\"firepower\":560,\"supplyLevel\":65,\"morale\":90,\"direction\":45}" > /dev/null
    fi
    sleep 1

    # Enemy remaining tanks retreat
    if [ ! -z "$RED_TANK1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_TANK1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_TANK1_ID}\",\"position\":{\"latitude\":50.53,\"longitude\":30.62},\"status\":\"DEFENDING\",\"personnel\":55,\"vehicles\":12,\"firepower\":180,\"supplyLevel\":45,\"morale\":25,\"direction\":45}" > /dev/null
        print_info "Red Tanks: RETREATING with heavy losses"
    fi

    # Enemy mech retreats
    if [ ! -z "$RED_MECH1_ID" ]; then
        curl -s -X PUT "${MAP_API}/units/${RED_MECH1_ID}" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
            -d "{\"id\":\"${RED_MECH1_ID}\",\"position\":{\"latitude\":50.525,\"longitude\":30.615},\"status\":\"DEFENDING\",\"personnel\":50,\"vehicles\":12,\"firepower\":120,\"supplyLevel\":40,\"morale\":20,\"direction\":45}" > /dev/null
        print_info "Red Mech Infantry: RETREATING in disorder"
    fi
    sleep 2

    print_highlight "ENEMY COMMAND POST CAPTURED!"
    print_highlight "OPERATION THUNDER STRIKE - DECISIVE VICTORY!"
}

show_statistics() {
    print_header "Battle Statistics - Operation Thunder Strike"

    # Fetch current unit data
    UNITS_DATA=$(curl -s "${MAP_API}/units" -H "$AUTH_HEADER" -H "$USER_HEADER")

    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                  BATTLE OUTCOME                           ║${NC}"
    echo -e "${CYAN}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║  ${GREEN}★ BLUE FORCE VICTORY - OFFENSIVE SUCCESS ★${NC}              ${CYAN}║${NC}"
    echo -e "${CYAN}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║  ${NC}BLUE FORCE (Attacker)                                     ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Units:      9 operational (0 destroyed)               ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Personnel:  ~680 remaining (casualties: ~45)          ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Vehicles:   ~195 remaining (losses: ~17)              ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Tanks lost: 7 (out of 87)                             ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Morale:     HIGH (85-92%)                             ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}✓${NC} Objective:  SECURED                                   ${CYAN}║${NC}"
    echo -e "${CYAN}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║  ${NC}RED FORCE (Defender)                                      ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Units:      3 remaining (4 DESTROYED)                  ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Personnel:  ~165 remaining (casualties: ~325)          ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Vehicles:   ~32 remaining (losses: ~84)                ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Tanks lost: 20 (out of 32)                             ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Morale:     BROKEN (20-25%)                            ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${RED}✗${NC} Position:   LOST - retreating in disorder              ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"

    echo -e "\n${YELLOW}KEY ENGAGEMENTS:${NC}"
    print_stat "Artillery Preparation:"
    print_stat "  • 120+ rounds fired, enemy AT platoon destroyed"
    print_stat "  • Counter-battery silenced enemy artillery"
    print_stat ""
    print_stat "Breach Phase:"
    print_stat "  • Engineers cleared minefield lane (3 casualties)"
    print_stat "  • Recon identified weak points in defense"
    print_stat ""
    print_stat "Armor Assault:"
    print_stat "  • 1st Tanks punched through main defense"
    print_stat "  • 2nd Tanks flanked and rolled up enemy line"
    print_stat "  • Tank battle: Blue lost 7, Red lost 20"
    print_stat ""
    print_stat "Exploitation:"
    print_stat "  • Mech Infantry seized key terrain"
    print_stat "  • Enemy infantry position overrun"
    print_stat "  • Enemy command post captured"

    echo -e "\n${GREEN}TACTICAL ASSESSMENT:${NC}"
    print_stat "• Combined arms assault executed effectively"
    print_stat "• Artillery preparation degraded enemy defenses"
    print_stat "• Flanking maneuver decisive in breaking enemy"
    print_stat "• Engineers enabled rapid breach of obstacles"
    print_stat "• Reserve uncommitted - available for pursuit"
    print_stat "• Enemy force rendered combat ineffective"
}

show_ui_guide() {
    print_header "View the Battle in the Interface"

    echo -e "${YELLOW}Open your browser and go to:${NC}"
    echo -e "${GREEN}  http://localhost:5173${NC}"

    echo -e "\n${YELLOW}Login credentials:${NC}"
    echo -e "  Username: ${CYAN}offensive_commander${NC}"
    echo -e "  Password: ${CYAN}OffensiveOps123${NC}"

    echo -e "\n${MAGENTA}★ WHAT YOU'LL SEE:${NC}"
    echo ""
    echo -e "${CYAN}1. Battle Damage:${NC}"
    print_stat "• 4 destroyed Red Force units (skull icons)"
    print_stat "• Remaining Red units retreating northeast"
    print_stat "• Blue units advanced to objective"

    echo -e "\n${CYAN}2. Unit Trails:${NC}"
    print_stat "• Blue dashed lines showing assault paths"
    print_stat "• Tank advances through minefield"
    print_stat "• Flanking maneuver visible"

    echo -e "\n${CYAN}3. Fire Missions:${NC}"
    print_stat "• Artillery target zones visible"
    print_stat "• Smoke screen positions"

    echo -e "\n${CYAN}4. Scripts Panel:${NC}"
    print_stat "• 'Operation Thunder Strike' script ACTIVE"
    print_stat "• 6 coordinated actions completed"

    echo -e "\n${CYAN}5. Battle Stats Dashboard:${NC}"
    print_stat "• Click 'Show Stats' to see casualty comparison"
    print_stat "• Force strength graphs updated"
}

wait_for_user() {
    print_header "OPEN THE MAP INTERFACE NOW"
    echo ""
    echo -e "${YELLOW}Before the assault begins, please:${NC}"
    echo ""
    echo -e "${CYAN}1. Open browser: ${GREEN}http://localhost:5173${NC}"
    echo -e "${CYAN}2. Login:${NC}"
    echo -e "   Username: ${GREEN}offensive_commander${NC}"
    echo -e "   Password: ${GREEN}OffensiveOps123${NC}"
    echo ""
    echo -e "${YELLOW}You should see:${NC}"
    echo -e "${CYAN}  ✓ Green 'Live Updates' indicator (bottom-right corner)${NC}"
    echo -e "${CYAN}  ✓ 16 military units on the map${NC}"
    echo -e "${CYAN}  ✓ Blue Force assault elements in the south${NC}"
    echo -e "${CYAN}  ✓ Red Force defensive positions in the north${NC}"
    echo -e "${CYAN}  ✓ Obstacle lines visible (minefields, tank traps)${NC}"
    echo ""
    echo -e "${MAGENTA}★ When the assault starts, you will see:${NC}"
    echo -e "${CYAN}  • Blue units advancing (movement trails)${NC}"
    echo -e "${CYAN}  • Health bars changing during combat${NC}"
    echo -e "${CYAN}  • Red units being destroyed (skull icons)${NC}"
    echo -e "${CYAN}  • Statistics updating in real-time${NC}"
    echo ""
    echo -e "${RED}████████████████████████████████████████████████████████${NC}"
    echo -e "${RED}█                                                      █${NC}"
    echo -e "${RED}█  Press ENTER when ready to LAUNCH ASSAULT...         █${NC}"
    echo -e "${RED}█                                                      █${NC}"
    echo -e "${RED}████████████████████████████████████████████████████████${NC}"
    echo ""
    read
}

print_banner() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║          MCOTS Offensive Battle Scenario                   ║"
    echo "║          Operation Thunder Strike                          ║"
    echo "║          Combined Arms Assault Demonstration               ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

main() {
    print_banner

    wait_for_services
    setup_user
    create_red_force_defense
    create_blue_force_assault
    create_enemy_defenses
    create_assault_plan
    create_assault_script

    wait_for_user

    simulate_assault
    show_statistics
    show_ui_guide

    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  ✓ Offensive demo complete! Objective secured.             ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

main
