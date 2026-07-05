#!/usr/bin/env bash
# Load environment variables from a .env file into the current shell.
# Usage:
#   source scripts/load-env.sh
#   load_env .env JWT_SECRET [MORE_REQUIRED ...]
#
# Or run directly:
#   ./scripts/load-env.sh .env JWT_SECRET
#
# Comments (#) and blank lines are ignored. KEY=VALUE pairs are exported so
# child processes (Maven, npm, Spring Boot) can read them.

load_env() {
    local env_file="${1:-.env}"
    shift || true
    local required_vars=("$@")

    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local repo_root
    repo_root="$(cd "${script_dir}/.." && pwd)"
    local env_path="${repo_root}/${env_file}"

    if [[ ! -f "${env_path}" ]]; then
        echo "Environment file not found: ${env_path}" >&2
        return 1
    fi

    local line key value
    while IFS= read -r line || [[ -n "${line}" ]]; do
        # Trim leading/trailing whitespace.
        line="${line#"${line%%[![:space:]]*}"}"
        line="${line%"${line##*[![:space:]]}"}"

        [[ -z "${line}" || "${line}" =~ ^# ]] && continue

        if [[ "${line}" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"

            # Strip optional matching surrounding quotes.
            if [[ "${value}" == \"*\" ]]; then
                value="${value#\"}"
                value="${value%\"}"
            elif [[ "${value}" == \'*\' ]]; then
                value="${value#\'}"
                value="${value%\'}"
            fi

            export "${key}=${value}"
        fi
    done < "${env_path}"

    local missing=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing+=("${var}")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        echo "Missing required environment variables: ${missing[*]}. See .env.example." >&2
        return 1
    fi
}

# When executed directly, load the environment using the supplied arguments.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    load_env "$@"
fi
