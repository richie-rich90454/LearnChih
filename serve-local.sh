#!/usr/bin/env bash
# Serve LernChih in local single-port mode without building (Linux / macOS).
# Loads .env, validates required variables, verifies static assets exist,
# and starts Spring Boot with the local profile.
# Usage: ./serve-local.sh  (run from the repository root)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend/lernchih"
STATIC_DIR="${BACKEND_DIR}/src/main/resources/static"

cd "${REPO_ROOT}"

echo "Loading environment from .env..."
# shellcheck source=scripts/load-env.sh
. "${REPO_ROOT}/scripts/load-env.sh"
load_env .env JWT_SECRET
echo "Environment loaded."

if [[ -z "${SERVER_PORT:-}" ]]; then
    export SERVER_PORT=38517
fi

if [[ ! -f "${STATIC_DIR}/index.html" ]]; then
    echo "Static frontend assets not found at ${STATIC_DIR}/index.html. Run './start-local.sh --build' first to build the frontend." >&2
    exit 1
fi

echo "Starting LernChih backend (local profile) on port ${SERVER_PORT}..."
cd "${BACKEND_DIR}"
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
