# Deploy script: Build React và copy vào Laravel public/pano để same-origin (không CORS)
# Chạy: powershell -ExecutionPolicy Bypass -File ./deploy.ps1
# Hoặc: npm run deploy

$ErrorActionPreference = "Stop"

$PanoRoot = $PSScriptRoot
$LaravelPublicPano = "D:\laragon\www\pano-admin\public\pano"

Write-Host "=== Pano Deploy: React -> Laravel ===" -ForegroundColor Cyan
Write-Host "Pano root: $PanoRoot"
Write-Host "Target  : $LaravelPublicPano"

# 1. Build
Write-Host "`n[1/3] Building React (vite build)..." -ForegroundColor Yellow
Set-Location $PanoRoot
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

# 2. Copy to Laravel public/pano + assets to public/assets (để index.html dùng /assets/... tuyệt đối vẫn load được)
Write-Host "`n[2/3] Copying dist -> $LaravelPublicPano + public/assets ..." -ForegroundColor Yellow
if (Test-Path $LaravelPublicPano) {
    Remove-Item -Recurse -Force $LaravelPublicPano
}
New-Item -ItemType Directory -Path $LaravelPublicPano -Force | Out-Null
Copy-Item -Path "$PanoRoot\dist\*" -Destination $LaravelPublicPano -Recurse -Force

# Copy assets ra public/assets để đường dẫn tuyệt đối /assets/... hoạt động khi serve từ "/"
$PublicAssets = "D:\laragon\www\pano-admin\public\assets"
if (Test-Path "$PanoRoot\dist\assets") {
    if (-not (Test-Path $PublicAssets)) { New-Item -ItemType Directory -Path $PublicAssets -Force | Out-Null }
    Copy-Item -Path "$PanoRoot\dist\assets\*" -Destination $PublicAssets -Recurse -Force
    # vite.svg nếu có
    if (Test-Path "$PanoRoot\dist\vite.svg") { Copy-Item -Path "$PanoRoot\dist\vite.svg" -Destination "D:\laragon\www\pano-admin\public\vite.svg" -Force }
}

# 3. Verify
Write-Host "`n[3/3] Verifying..." -ForegroundColor Yellow
Get-ChildItem $LaravelPublicPano | Select-Object Name, Length | Format-Table -AutoSize
if (Test-Path "$LaravelPublicPano\index.html") {
    Write-Host "`n✅ Deploy OK! Truycap:" -ForegroundColor Green
    Write-Host "   Frontend : http://pano-admin.test/ (serve từ public/pano/index.html)"
    Write-Host "   Admin    : http://pano-admin.test/admin"
    Write-Host "   API      : http://pano-admin.test/api/projects"
    Write-Host "   Storage  : http://pano-admin.test/storage/..."
    Write-Host "`nLen hosting: chỉ cần upload toàn bộ thư mục pano-admin (đã chứa public/pano), chạy:"
    Write-Host "   php artisan storage:link, php artisan migrate, php artisan config:cache"
} else {
    throw "index.html not found in target"
}
