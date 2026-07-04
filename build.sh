#!/usr/bin/env bash
# Build script for LernChih (Linux / macOS)
# Builds the frontend, copies the dist into the backend static resources,
# then packages the backend into a single runnable JAR.
# Usage: ./build.sh  (run from the repository root)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"
BACKEND_DIR="${REPO_ROOT}/backend/lernchih"
STATIC_DIR="${BACKEND_DIR}/src/main/resources/static"

echo "Building LernChih frontend..."
cd "${FRONTEND_DIR}"
npm install
npm run build
echo "Frontend build complete."

echo "Copying frontend dist to Spring Boot static resources..."
rm -rf "${STATIC_DIR}"
cp -R dist "${STATIC_DIR}"
echo "Static files copied."

echo "Building LernChih backend..."
cd "${BACKEND_DIR}"
./mvnw clean package -DskipTests
echo "Backend build complete."

echo ""
echo "All builds finished successfully!"
echo "Deploy from the repository root with the local (H2) profile:"
echo "  java -Xmx512m -jar backend/lernchih/target/lernchih-0.0.1-SNAPSHOT.jar --spring.profiles.active=local"
echo "Or with Docker infra (MySQL + OpenSearch) and env vars set:"
echo "  java -Xmx512m -jar backend/lernchih/target/lernchih-0.0.1-SNAPSHOT.jar"
