# MARQUE System - Install All Dependencies
# Run this script from the root of the project
# Usage: .\install.ps1

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  MARQUE System - Dependency Installer" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# ===== BACKEND =====
Write-Host "[1/2] Installing Backend packages..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend packages installed successfully." -ForegroundColor Green
} else {
    Write-Host "Backend install failed. Check errors above." -ForegroundColor Red
}

# ===== MOBILE =====
Write-Host ""
Write-Host "[2/2] Installing Mobile packages..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\mobile"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "Mobile packages installed successfully." -ForegroundColor Green
} else {
    Write-Host "Mobile install failed. Check errors above." -ForegroundColor Red
}

# ===== DONE =====
Set-Location "$PSScriptRoot"
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  All done! Setup complete." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  Backend  -> cd backend ; npm run dev" -ForegroundColor Gray
Write-Host "  Mobile   -> cd mobile  ; npx expo start" -ForegroundColor Gray
Write-Host ""
