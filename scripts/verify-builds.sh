#!/usr/bin/env bash
# LernChih reproducible build verification script (Task 10.5 / Spec I107)
# Usage: ./scripts/verify-builds.sh
# Verifies Java/Maven backend package and frontend production build.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend/lernchih"
FRONTEND_DIR="${REPO_ROOT}/frontend"

BACKEND_OK=false
FRONTEND_OK=false

log_info() {
    echo -e "\033[36m$1\033[0m"
}

log_ok() {
    echo -e "\033[32m$1\033[0m"
}

log_fail() {
    echo -e "\033[31m$1\033[0m"
}

check_java() {
    local raw major
    raw=$(java -version 2>&1 | grep -o 'version "[0-9.]*"' | head -1 | tr -d 'version "')
    if [ -z "$raw" ]; then
        log_fail "Unable to determine Java version. Is Java installed?"
        exit 1
    fi
    major=$(echo "$raw" | cut -d. -f1)
    if [ "$major" -lt 25 ]; then
        log_fail "Java 25+ is required. Found version: $raw (major: $major)"
        exit 1
    fi
    log_ok "[OK] Java version $raw (major: $major)"
}

build_backend() {
    log_info "\n[BUILD] Backend: ./mvnw clean package -DskipTests"
    (
        cd "$BACKEND_DIR"
        if ./mvnw clean package -DskipTests; then
            log_ok "[OK] Backend package succeeded."
            BACKEND_OK=true
        else
            log_fail "[FAIL] Backend package failed."
            BACKEND_OK=false
        fi
    )
}

build_frontend() {
    log_info "\n[BUILD] Frontend: npm ci --legacy-peer-deps && npm run build"
    (
        cd "$FRONTEND_DIR"
        # Clear any stale Vite temp cache that can cause config load errors
        rm -rf node_modules/.vite-temp

        if ! npm ci --legacy-peer-deps; then
            log_fail "[FAIL] Frontend npm ci failed."
            FRONTEND_OK=false
            return
        fi

        if npm run build; then
            log_ok "[OK] Frontend build succeeded."
            FRONTEND_OK=true
        else
            log_fail "[FAIL] Frontend build failed."
            FRONTEND_OK=false
        fi
    )
}

# --------------------------------------------------------------------
# Main
# --------------------------------------------------------------------
log_info "LernChih Build Verification (Task 10.5 / Spec I107)"
echo "Repository: $REPO_ROOT"

check_java
build_backend
build_frontend

log_info "\n----------------------------------------"
if $BACKEND_OK && $FRONTEND_OK; then
    log_ok "RESULT: SUCCESS - all builds passed."
    exit 0
else
    log_fail "RESULT: FAILURE"
    if ! $BACKEND_OK; then log_fail "  - Backend package failed"; fi
    if ! $FRONTEND_OK; then log_fail "  - Frontend build failed"; fi
    exit 1
fi
