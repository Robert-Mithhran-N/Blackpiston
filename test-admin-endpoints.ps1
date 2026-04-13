# Test Admin Endpoints Script (PowerShell)
# This script tests all admin dashboard endpoints

Write-Host "🧪 Testing BlackPiston Admin Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:3001/api"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200) {
            Write-Host "✓ OK" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $statusCode)"
        } else {
            Write-Host "⚠ Warning" -ForegroundColor Yellow -NoNewline
            Write-Host " (HTTP $statusCode)"
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401) {
            Write-Host "⚠ Unauthorized" -ForegroundColor Yellow -NoNewline
            Write-Host " (HTTP $statusCode) - Need admin login"
        } elseif ($statusCode -eq 404) {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $statusCode) - Route not found"
        } elseif ($statusCode -eq 500) {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $statusCode) - Server error"
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $statusCode)"
        }
    }
}

Write-Host "📡 Testing Public Endpoints:" -ForegroundColor Cyan
Write-Host "----------------------------"
Test-Endpoint "Health Check" "$BASE_URL/health"
Test-Endpoint "Database Health" "$BASE_URL/health/db"
Test-Endpoint "Products" "$BASE_URL/products"
Test-Endpoint "Categories" "$BASE_URL/products/categories/all"
Write-Host ""

Write-Host "🔐 Testing Admin Endpoints (may require auth):" -ForegroundColor Cyan
Write-Host "----------------------------------------------"
Test-Endpoint "Admin Blog" "$BASE_URL/admin/blog"
Test-Endpoint "Admin Services" "$BASE_URL/admin/services"
Test-Endpoint "Admin Builds" "$BASE_URL/admin/builds"
Test-Endpoint "Admin Appointments" "$BASE_URL/admin/appointments"
Test-Endpoint "Admin Requests" "$BASE_URL/admin/requests"
Test-Endpoint "Admin Products" "$BASE_URL/admin/products"
Test-Endpoint "Admin Orders" "$BASE_URL/orders/admin/all"
Test-Endpoint "Admin Payments" "$BASE_URL/admin/payments"
Test-Endpoint "Admin Users" "$BASE_URL/admin/users"
Test-Endpoint "Admin Dashboard Stats" "$BASE_URL/admin/dashboard/stats"
Write-Host ""

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "-----------"
Write-Host "If you see '⚠ Unauthorized' for admin endpoints, that's normal."
Write-Host "Login to the admin panel first, then these endpoints will work."
Write-Host ""
Write-Host "If you see '✗ FAILED' with HTTP 404, the route might not be registered."
Write-Host "If you see '✗ FAILED' with HTTP 500, there might be a database issue."
Write-Host ""
Write-Host "✅ Test complete!" -ForegroundColor Green
