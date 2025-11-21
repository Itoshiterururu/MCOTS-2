#!/bin/bash

# Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"tactical_demo","password":"TacticalDemo123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

echo "TOKEN: ${TOKEN:0:20}..."
echo "USER_ID: $USER_ID"
echo ""

echo "Fetching units..."
UNITS=$(curl -s "http://localhost:8080/api/v1/map/units" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "X-User-ID: ${USER_ID}")

echo "Raw response:"
echo "$UNITS"
echo ""

if command -v jq &> /dev/null; then
    echo "Parsed units:"
    echo "$UNITS" | jq -r '.[] | "\(.faction) - \(.unitType) - Personnel: \(.personnel) - Vehicles: \(.vehicles) - Status: \(.status)"'

    echo ""
    echo "Total units: $(echo "$UNITS" | jq 'length')"
    echo "Blue Force: $(echo "$UNITS" | jq '[.[] | select(.faction == "BLUE_FORCE")] | length')"
    echo "Red Force: $(echo "$UNITS" | jq '[.[] | select(.faction == "RED_FORCE")] | length')"
else
    echo "jq not installed, showing raw output only"
fi
