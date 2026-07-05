# Serve LernChih in local single-port mode without building (Windows).
# Loads .env, validates required variables, verifies static assets exist,
# and starts Spring Boot with the local profile.
# Usage: .\serve-local.ps1  (run from the repository root)

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$backendDir = Join-Path $repoRoot "backend\lernchih"
$staticDir = Join-Path $backendDir "src\main\resources\static"

Push-Location $repoRoot
try {
    Write-Host "Loading environment from .env..."
    & "$repoRoot\scripts\load-env.ps1" -EnvFile ".env" -RequiredVars @("JWT_SECRET")
    Write-Host "Environment loaded."

    if (-not $env:SERVER_PORT) {
        $env:SERVER_PORT = 38517
    }

    $indexHtml = Join-Path $staticDir "index.html"
    if (-not (Test-Path $indexHtml)) {
        Write-Error "Static frontend assets not found at $indexHtml. Run '.\start-local.ps1 -Build' first to build the frontend."
        exit 1
    }

    Write-Host "Starting LernChih backend (local profile) on port $env:SERVER_PORT..."
    Set-Location $backendDir
    .\mvnw.cmd spring-boot:run -D"spring-boot.run.arguments=--spring.profiles.active=local"
}
finally {
    Pop-Location
}
