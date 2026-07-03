#Requires -Version 5.1
# LernChih reproducible build verification script (Task 10.5 / Spec I107)
# Usage: .\scripts\verify-builds.ps1
# Verifies Java/Maven backend package and frontend production build.

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot "backend\lernchih"
$frontendDir = Join-Path $repoRoot "frontend"

$script:backendOk = $false
$script:frontendOk = $false

function Test-JavaVersion {
    $raw = & java -version 2>&1 | Select-String -Pattern 'version "([0-9]+(\.[0-9]+)*)"'
    if (-not $raw) {
        Write-Error "Unable to determine Java version. Is Java installed?"
        exit 1
    }
    $version = $raw.Matches.Groups[1].Value
    $major = ($version -split '\.')[0]
    if ([int]$major -lt 25) {
        Write-Error "Java 25+ is required. Found version: $version (major: $major)"
        exit 1
    }
    Write-Host "[OK] Java version $version (major: $major)" -ForegroundColor Green
}

function Invoke-BackendBuild {
    Write-Host "`n[BUILD] Backend: mvnw.cmd clean package -DskipTests" -ForegroundColor Cyan
    Push-Location $backendDir
    try {
        & .\mvnw.cmd clean package -DskipTests
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Backend package succeeded." -ForegroundColor Green
            $script:backendOk = $true
        }
        else {
            Write-Host "[FAIL] Backend package failed (exit code $LASTEXITCODE)." -ForegroundColor Red
            $script:backendOk = $false
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-FrontendBuild {
    Write-Host "`n[BUILD] Frontend: npm ci --legacy-peer-deps && npm run build" -ForegroundColor Cyan
    Push-Location $frontendDir
    try {
        # Clear any stale Vite temp cache that can cause config load errors
        if (Test-Path "node_modules\.vite-temp") {
            Remove-Item -Recurse -Force "node_modules\.vite-temp"
        }

        & npm ci --legacy-peer-deps
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[FAIL] Frontend npm ci failed (exit code $LASTEXITCODE)." -ForegroundColor Red
            $script:frontendOk = $false
            return
        }

        & npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Frontend build succeeded." -ForegroundColor Green
            $script:frontendOk = $true
        }
        else {
            Write-Host "[FAIL] Frontend build failed (exit code $LASTEXITCODE)." -ForegroundColor Red
            $script:frontendOk = $false
        }
    }
    finally {
        Pop-Location
    }
}

# --------------------------------------------------------------------
# Main
# --------------------------------------------------------------------
Write-Host "LernChih Build Verification (Task 10.5 / Spec I107)" -ForegroundColor Cyan
Write-Host "Repository: $repoRoot"

Test-JavaVersion
Invoke-BackendBuild
Invoke-FrontendBuild

Write-Host "`n----------------------------------------" -ForegroundColor Cyan
if ($script:backendOk -and $script:frontendOk) {
    Write-Host "RESULT: SUCCESS - all builds passed." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "RESULT: FAILURE" -ForegroundColor Red
    if (-not $script:backendOk) { Write-Host "  - Backend package failed" -ForegroundColor Red }
    if (-not $script:frontendOk) { Write-Host "  - Frontend build failed" -ForegroundColor Red }
    exit 1
}
