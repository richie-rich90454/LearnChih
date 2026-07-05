#!/usr/bin/env bash
# Start LernChih in local single-port mode (Linux / macOS).
# Loads .env, validates required variables, builds the frontend, copies it into
# the backend static resources, and starts Spring Boot with the local profile.
# Usage: ./start-local.sh  (run from the repository root)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"
BACKEND_DIR="${REPO_ROOT}/backend/lernchih"
STATIC_DIR="${BACKEND_DIR}/src/main/resources/static"

cd "${REPO_ROOT}"

echo "Loading environment from .env..."
# shellcheck source=scripts/load-env.sh
. "${REPO_ROOT}/scripts/load-env.sh"
load_env .env JWT_SECRET
echo "Environment loaded."

echo "Building LernChih frontend..."
cd "${FRONTEND_DIR}"

needs_install=false
if [[ ! -d node_modules ]]; then
    needs_install=true
elif [[ ! -f node_modules/.package-lock.json ]] || [[ package-lock.json -nt node_modules/.package-lock.json ]]; then
    needs_install=true
fi

if [[ "${needs_install}" == true ]]; then
    npm install
fi

npm run build
echo "Frontend build complete."

echo "Copying frontend dist to Spring Boot static resources..."
rm -rf "${STATIC_DIR}"
cp -R dist "${STATIC_DIR}"
echo "Static files copied."

echo "Starting LernChih backend (local profile)..."
cd "${BACKEND_DIR}"
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
