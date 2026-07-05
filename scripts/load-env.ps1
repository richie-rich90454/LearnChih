# Load environment variables from a .env file into the current process.
# Usage (from the repository root):
#   .\scripts\load-env.ps1 [-EnvFile ".env"] [-RequiredVars @("JWT_SECRET")]
#
# Comments (#) and blank lines are ignored. KEY=VALUE pairs are exported as
# process environment variables so child processes (Maven, npm, Spring Boot)
# can read them.

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$EnvFile = ".env",

    [Parameter(Position = 1)]
    [string[]]$RequiredVars = @()
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Split-Path -Parent $scriptDir
$envPath = Join-Path $repoRoot $EnvFile

if (-not (Test-Path $envPath)) {
    Write-Error "Environment file not found: $envPath"
    exit 1
}

Get-Content -Path $envPath | ForEach-Object {
    $line = $_.Trim()

    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }

    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        # Strip optional matching surrounding quotes.
        if (($value.Length -ge 2) -and (
            ($value[0] -eq '"' -and $value[-1] -eq '"') -or
            ($value[0] -eq "'" -and $value[-1] -eq "'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$missing = $RequiredVars | Where-Object {
    [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, "Process"))
}

if ($missing) {
    Write-Error ("Missing required environment variables: " + ($missing -join ", ") + ". See .env.example.")
    exit 1
}
