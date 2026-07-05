# Start LernChih in local single-port mode (Windows).
# By default this serves the existing static frontend assets without building.
# Use -Build to install dependencies, build the frontend, copy it into the
# backend static resources, and then start the backend.
# Usage: .\start-local.ps1 [-Build]  (run from the repository root)

[CmdletBinding()]
param(
    [switch]$Build
)

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$frontendDir = Join-Path $repoRoot "frontend"
$backendDir = Join-Path $repoRoot "backend\lernchih"
$staticDir = Join-Path $backendDir "src\main\resources\static"

if ($Build) {
    Push-Location $repoRoot
    try {
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
    }
    finally {
        Pop-Location
    }
}

& "$repoRoot\serve-local.ps1"
