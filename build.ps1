# Build script for LernChih
Write-Host "Building LernChih frontend..."
Set-Location frontend
npm install
npm run build
Write-Host "Frontend build complete."

Write-Host "Copying frontend dist to Spring Boot static resources..."
$staticDir = "..\backend\lernchih\src\main\resources\static"
if (Test-Path $staticDir) {
    Remove-Item -Recurse -Force $staticDir
}
Copy-Item -Recurse "dist" $staticDir
Write-Host "Static files copied."

Write-Host "Building LernChih backend..."
Set-Location ..\backend\lernchih
.\mvnw.cmd clean package -DskipTests
Write-Host "Backend build complete."

Write-Host "All builds finished successfully!"
Write-Host "Deploy: java -Xmx512m -jar backend/lernchih/target/lernchih-0.0.1-SNAPSHOT.jar"
