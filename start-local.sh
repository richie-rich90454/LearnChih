#!/usr/bin/env bash
# Start LernChih in local single-port mode (Linux / macOS).
# By default this serves the existing static frontend assets without building.
# Use --build to install dependencies, build the frontend, copy it into the
# backend static resources, and then start the backend.
# Usage: ./start-local.sh [--build]  (run from the repository root)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"
BACKEND_DIR="${REPO_ROOT}/backend/lernchih"
STATIC_DIR="${BACKEND_DIR}/src/main/resources/static"

build=false
for arg in "$@"; do
    case "${arg}" in
        --build)
            build=true
            ;;
        *)
            echo "Unknown argument: ${arg}" >&2
            echo "Usage: ./start-local.sh [--build]" >&2
            exit 1
            ;;
    esac
done

cd "${REPO_ROOT}"

if [[ "${build}" == true ]]; then
    echo "Building LernChih frontend..."
    cd "${FRONTEND_DIR}"

    needs_install=false
    if [[ ! -d node_modules ]]; then
        needs_install=true
    elif [[ ! -f node_modules/.package-lock.json ]] || [[ "package-lock.json" -nt "node_modules/.package-lock.json" ]]; then
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
fi

./serve-local.sh
