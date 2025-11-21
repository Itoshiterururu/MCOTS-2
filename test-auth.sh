#!/bin/bash

echo "=== Testing MCOTS Authentication System ==="

# Test auth service
echo "1. Testing auth service..."
curl -s http://localhost:8081/api/v1/auth/test || echo "Auth service not running"

# Test registration
echo "2. Testing registration..."
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}' \
  | jq '.' || echo "Registration failed"

# Test login
echo "3. Testing login..."
TOKEN=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# Test map service with token
echo "4. Testing map service with JWT..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/map/units \
  | jq '.' || echo "Map service test failed"

echo "=== Test completed ==="