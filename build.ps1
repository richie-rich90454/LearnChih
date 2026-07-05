# Build script for LernChih (Windows)
# Loads .env, validates required variables, builds the frontend, copies the dist
# into the backend static resources, then packages the backend into a single
# runnable JAR.
# Usage: .\build.ps1  (run from the repository root)

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
    if ($env:DB_URL -notlike "jdbc:h2*") {
        if ([string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
            Write-Error "Missing required environment variable: DB_PASSWORD. See .env.example."
            exit 1
        }
    }
    Write-Host "Environment loaded."

    Write-Host "Building LernChih frontend..."
    Set-Location $frontendDir
    npm install
    npm run build
    Write-Host "Frontend build complete."

    Write-Host "Copying frontend dist to Spring Boot static resources..."
    if (Test-Path $staticDir) {
        Remove-Item -Recurse -Force $staticDir
    }
    Copy-Item -Recurse (Join-Path $frontendDir "dist") $staticDir
    Write-Host "Static files copied."

    Write-Host "Building LernChih backend..."
    Set-Location $backendDir
    .\mvnw.cmd clean package -DskipTests
    Write-Host "Backend build complete."

    Write-Host "All builds finished successfully!"
    Write-Host "Deploy from the repository root with the local (H2) profile:"
    Write-Host "  java -Xmx512m -jar backend\lernchih\target\lernchih-0.0.1-SNAPSHOT.jar --spring.profiles.active=local"
    Write-Host "Or with Docker infra (MySQL + OpenSearch) and env vars set:"
    Write-Host "  java -Xmx512m -jar backend\lernchih\target\lernchih-0.0.1-SNAPSHOT.jar"
}
finally {
    Pop-Location
}
