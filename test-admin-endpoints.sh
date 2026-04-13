#!/bin/bash

# Test Admin Endpoints Script
# This script tests all admin dashboard endpoints

echo "🧪 Testing BlackPiston Admin Endpoints"
echo "========================================"
echo ""

BASE_URL="http://localhost:3001/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
    elif [ "$response" -eq 401 ]; then
        echo -e "${YELLOW}⚠ Unauthorized${NC} (HTTP $response) - Need admin login"
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
    fi
}

echo "📡 Testing Public Endpoints:"
echo "----------------------------"
test_endpoint "Health Check" "$BASE_URL/health"
test_endpoint "Database Health" "$BASE_URL/health/db"
test_endpoint "Products" "$BASE_URL/products"
test_endpoint "Categories" "$BASE_URL/products/categories/all"
echo ""

echo "🔐 Testing Admin Endpoints (may require auth):"
echo "----------------------------------------------"
test_endpoint "Admin Blog" "$BASE_URL/admin/blog"
test_endpoint "Admin Services" "$BASE_URL/admin/services"
test_endpoint "Admin Builds" "$BASE_URL/admin/builds"
test_endpoint "Admin Appointments" "$BASE_URL/admin/appointments"
test_endpoint "Admin Requests" "$BASE_URL/admin/requests"
test_endpoint "Admin Products" "$BASE_URL/admin/products"
test_endpoint "Admin Orders" "$BASE_URL/orders/admin/all"
test_endpoint "Admin Payments" "$BASE_URL/admin/payments"
test_endpoint "Admin Users" "$BASE_URL/admin/users"
test_endpoint "Admin Dashboard Stats" "$BASE_URL/admin/dashboard/stats"
echo ""

echo "📊 Summary:"
echo "-----------"
echo "If you see '⚠ Unauthorized' for admin endpoints, that's normal."
echo "Login to the admin panel first, then these endpoints will work."
echo ""
echo "If you see '✗ FAILED' with HTTP 404, the route might not be registered."
echo "If you see '✗ FAILED' with HTTP 500, there might be a database issue."
echo ""
echo "✅ Test complete!"
