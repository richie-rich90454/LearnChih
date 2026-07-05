# Start LernChih in local single-port mode (Windows).
# Loads .env, validates required variables, builds the frontend, copies it into
# the backend static resources, and starts Spring Boot with the local profile.
# Usage: .\start-local.ps1  (run from the repository root)

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$frontendDir = Join-Path $repoRoot "frontend"
$backendDir = Join-Path $repoRoot "backend\lernchih"
$staticDir = Join-Path $backendDir "src\main\resources\static"

Push-Location $repoRoot
try {
    Write-Host "Loading environment from .env..."
    & "$repoRoot\scripts\load-env.ps1" -EnvFile ".env" -RequiredVars @("JWT_SECRET")
    Write-Host "Environment loaded."

    Write-Host "Building LernChih frontend..."
    Set-Location $frontendDir

    $needsInstall = $false
    if (-not (Test-Path "node_modules")) {
        $needsInstall = $true
    } else {
        $packageLock = Get-Item "package-lock.json" -ErrorAction SilentlyContinue
        $installedLock = Get-Item "node_modules\.package-lock.json" -ErrorAction SilentlyContinue
        if (-not $installedLock -or $packageLock.LastWriteTime -gt $installedLock.LastWriteTime) {
            $needsInstall = $true
        }
    }
    if ($needsInstall) {
        npm install
    }

    npm run build
    Write-Host "Frontend build complete."

    Write-Host "Copying frontend dist to Spring Boot static resources..."
    if (Test-Path $staticDir) {
        Remove-Item -Recurse -Force $staticDir
    }
    Copy-Item -Recurse (Join-Path $frontendDir "dist") $staticDir
    Write-Host "Static files copied."

    Write-Host "Starting LernChih backend (local profile)..."
    Set-Location $backendDir
    .\mvnw.cmd spring-boot:run -D"spring-boot.run.arguments=--spring.profiles.active=local"
}
finally {
    Pop-Location
}
