#!/bin/bash

API_BASE="http://localhost"
AUTH_API="${API_BASE}:8081/api/v1/auth"
MAP_API="${API_BASE}:8080/api/v1/map"

# Setup user
curl -s -X POST "${AUTH_API}/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "test_user",
        "email": "test@mcots.demo",
        "password": "TestPass123"
    }' > /dev/null 2>&1

LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_API}/login" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "test_user",
        "password": "TestPass123"
    }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to login"
    exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"
USER_HEADER="X-User-Id: $USER_ID"

echo "Creating units..."
echo ""

# Create Blue Force units one by one
echo "Creating BLUE FORCE units:"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"COMMUNICATIONS","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4501,"longitude":30.5234},"status":"DEFENDING","personnel":50,"vehicles":5,"supplyLevel":100,"morale":95}' > /dev/null
echo "  1. COMMUNICATIONS created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"TANKS","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4601,"longitude":30.5334},"status":"DEFENDING","personnel":120,"vehicles":40,"supplyLevel":90,"morale":85,"direction":45}' > /dev/null
echo "  2. TANKS created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"MECHANIZED","faction":"BLUE_FORCE","unitRank":"COMPANY","position":{"latitude":50.4701,"longitude":30.5434},"status":"DEFENDING","personnel":120,"vehicles":40,"supplyLevel":85,"morale":80,"direction":90}' > /dev/null
echo "  3. MECHANIZED created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"HOWITZER","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4301,"longitude":30.5134},"status":"DEFENDING","personnel":30,"vehicles":9,"supplyLevel":95,"morale":90}' > /dev/null
echo "  4. HOWITZER created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"RECONNAISSANCE","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.5001,"longitude":30.5634},"status":"MOVING","personnel":20,"vehicles":6,"supplyLevel":80,"morale":85,"direction":45}' > /dev/null
echo "  5. RECONNAISSANCE created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"AIR_DEFENSE","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4401,"longitude":30.5234},"status":"DEFENDING","personnel":25,"vehicles":6,"supplyLevel":90,"morale":88}' > /dev/null
echo "  6. AIR_DEFENSE created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"SUPPLY","faction":"BLUE_FORCE","unitRank":"PLATOON","position":{"latitude":50.4201,"longitude":30.5134},"status":"DEFENDING","personnel":30,"vehicles":15,"supplyLevel":100,"morale":75}' > /dev/null
echo "  7. SUPPLY created"

echo ""
echo "Creating RED FORCE units:"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"COMMUNICATIONS","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5501,"longitude":30.6234},"status":"DEFENDING","personnel":45,"vehicles":4,"supplyLevel":85,"morale":70}' > /dev/null
echo "  8. COMMUNICATIONS created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"TANKS","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5401,"longitude":30.6134},"status":"MOVING","personnel":110,"vehicles":35,"supplyLevel":75,"morale":65,"direction":225}' > /dev/null
echo "  9. TANKS created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"MECHANIZED","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5301,"longitude":30.6034},"status":"MOVING","personnel":115,"vehicles":38,"supplyLevel":70,"morale":68,"direction":225}' > /dev/null
echo "  10. MECHANIZED created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"MORTAR","faction":"RED_FORCE","unitRank":"PLATOON","position":{"latitude":50.5601,"longitude":30.6334},"status":"DEFENDING","personnel":28,"vehicles":8,"supplyLevel":80,"morale":72,"direction":180}' > /dev/null
echo "  11. MORTAR created"

curl -s -X POST "${MAP_API}/units" -H "Content-Type: application/json" -H "$AUTH_HEADER" -H "$USER_HEADER" \
    -d '{"unitType":"INFANTRY","faction":"RED_FORCE","unitRank":"COMPANY","position":{"latitude":50.5201,"longitude":30.5934},"status":"DEFENDING","personnel":100,"vehicles":20,"supplyLevel":65,"morale":60,"direction":180}' > /dev/null
echo "  12. INFANTRY created"

echo ""
echo "Waiting 2 seconds for database sync..."
sleep 2

# Count units
UNITS_DATA=$(curl -s "${MAP_API}/units" -H "$AUTH_HEADER" -H "$USER_HEADER")
TOTAL_COUNT=$(echo "$UNITS_DATA" | grep -o '"id"' | wc -l)
BLUE_COUNT=$(echo "$UNITS_DATA" | grep -o '"faction":"BLUE_FORCE"' | wc -l)
RED_COUNT=$(echo "$UNITS_DATA" | grep -o '"faction":"RED_FORCE"' | wc -l)

echo ""
echo "=== RESULTS ==="
echo "Total units in database: $TOTAL_COUNT"
echo "BLUE_FORCE: $BLUE_COUNT"
echo "RED_FORCE: $RED_COUNT"
echo ""

if [ "$TOTAL_COUNT" -eq 12 ]; then
    echo "✓ SUCCESS: All 12 units created correctly"
else
    echo "✗ PROBLEM: Expected 12 units but found $TOTAL_COUNT"
    echo ""
    echo "Unit types found:"
    echo "$UNITS_DATA" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  {u.get('faction')} - {u.get('unitType')}\") for u in data]" 2>/dev/null || echo "  (unable to parse JSON)"
fi
