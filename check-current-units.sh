#!/bin/bash

# Get token
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8081/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"tactical_demo","password":"TacticalDemo123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to get token"
    exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."

# Get units
UNITS=$(curl -s "http://localhost:8080/api/v1/map/units" -H "Authorization: Bearer $TOKEN")

# Count units
echo ""
echo "=== UNITS COUNT ==="
echo "$UNITS" | python3 << 'EOF'
import sys
import json

try:
    data = json.loads(sys.stdin.read())
    print(f"Total units: {len(data)}")

    blue = [u for u in data if u.get('faction') == 'BLUE_FORCE']
    red = [u for u in data if u.get('faction') == 'RED_FORCE']

    print(f"\nBLUE_FORCE: {len(blue)} units")
    print(f"RED_FORCE: {len(red)} units")

    print("\n=== BLUE FORCE UNITS ===")
    for u in blue:
        print(f"  {u.get('unitType'):20} - {u.get('status'):12} - {u.get('unitRank')}")

    print("\n=== RED FORCE UNITS ===")
    for u in red:
        print(f"  {u.get('unitType'):20} - {u.get('status'):12} - {u.get('unitRank')}")

except Exception as e:
    print(f"Error: {e}")
    print(sys.stdin.read())
EOF
