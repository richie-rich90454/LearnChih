# Build script for LernChih (Windows)
# Builds the frontend, copies the dist into the backend static resources,
# then packages the backend into a single runnable JAR.
# Usage: .\build.ps1  (run from the repository root)

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot
$frontendDir = Join-Path $repoRoot "frontend"
$backendDir = Join-Path $repoRoot "backend\lernchih"
$staticDir = Join-Path $backendDir "src\main\resources\static"

Push-Location $repoRoot
try {
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
    Write-Host "Deploy from the repository root with:"
    Write-Host "  java -Xmx512m -jar backend\lernchih\target\lernchih-0.0.1-SNAPSHOT.jar"
}
finally {
    Pop-Location
}
